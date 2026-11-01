import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

const STATUSES = ['New', 'Contacted', 'Interested', 'Visit Scheduled', 'Closed', 'Lost'];

const WITH_DETAILS = {
  visitors: true,
  properties: true,
  property_matches: { include: { properties: true } },
} as const;


function isText(value: any) {
  return typeof value === 'string' && value.trim() !== '';
}

function checkStatus(status: any) {
  if (status !== undefined && !STATUSES.includes(status)) {
    throw new BadRequestException('Invalid lead status');
  }
}

function toNumber(value: any, field: string, wholeNumber = false) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || (wholeNumber && !Number.isInteger(n))) {
    throw new BadRequestException(`${field} must be a valid number`);
  }
  return n;
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatLead(lead: any) {
    const visitor = lead.visitors;
    const property = lead.properties;
    return {
      id: lead.id,
      name: visitor.name ?? '',
      email: visitor.email ?? '',
      phone: visitor.phone ?? '',
      city: lead.desired_city ?? property?.city ?? '',
      budget: lead.budget?.toString() ?? '',
      bedrooms: lead.bedrooms ?? property?.bedrooms ?? '',
      status: lead.status,
      score: lead.score ?? '',
      notes: lead.notes ?? '',
      created_at: lead.created_at,
      property_matches: (lead.property_matches ?? []).map((m: any) => ({
        id: m.properties.id,
        title: m.properties.title,
        location: m.properties.city,
        price: m.properties.price.toString(),
        matchScore: m.match_score?.toString() ?? '',
        reason: m.reason ?? '',
      })),
    };
  }

  async findAll(organizationId: string) {
    const leads = await this.prisma.leads.findMany({
      where: { organization_id: organizationId },
      include: WITH_DETAILS,
      orderBy: { created_at: 'desc' },
    });
    return leads.map((lead) => this.formatLead(lead));
  }

  async findByPhone(organizationId: string, phone: string) {
    const lead = await this.prisma.leads.findFirst({
      where: { organization_id: organizationId, visitors: { phone } },
      include: WITH_DETAILS,
      orderBy: { created_at: 'desc' },
    });
    return lead ? { found: true, lead: this.formatLead(lead) } : { found: false };
  }

  async create(organizationId: string, body: any) {
    const { name, email, phone, city, budget, bedrooms, status, notes } = body;

    if (!isText(name) || !isText(phone)) {
      throw new BadRequestException('Name and phone are required');
    }
    checkStatus(status);
    const budgetValue = toNumber(budget, 'Budget');
    const bedroomsValue = toNumber(bedrooms, 'Bedrooms', true);

    const lead = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.visitors.findFirst({
        where: { organization_id: organizationId, phone: phone.trim() },
      });
      const visitor = existing
        ? await tx.visitors.update({
            where: { id: existing.id },
            data: { name: name.trim(), email: email || existing.email },
          })
        : await tx.visitors.create({
            data: {
              organization_id: organizationId,
              name: name.trim(),
              phone: phone.trim(),
              email: email || null,
            },
          });

      return tx.leads.create({
        data: {
          organization_id: organizationId,
          visitor_id: visitor.id,
          desired_city: city || null,
          budget: budgetValue,
          bedrooms: bedroomsValue,
          status: status ?? 'New',
          notes: notes || null,
        },
        include: WITH_DETAILS,
      });
    });

    return { lead: this.formatLead(lead) };
  }

  async update(organizationId: string, id: string, body: any) {
    const exists = await this.prisma.leads.findFirst({
      where: { id, organization_id: organizationId },
    });
    if (!exists) throw new NotFoundException('Lead not found');

    checkStatus(body.status);

    const lead = await this.prisma.leads.update({
      where: { id },
      data: {
        status: body.status,
        desired_city: body.city,
        budget: toNumber(body.budget, 'Budget'),
        bedrooms: toNumber(body.bedrooms, 'Bedrooms', true),
        notes: body.notes,
      },
      include: WITH_DETAILS,
    });

    return { lead: this.formatLead(lead) };
  }

  async saveMatches(organizationId: string, leadId: string, matches: any[]) {
    if (!Array.isArray(matches)) {
      throw new BadRequestException('matches must be an array');
    }

    const lead = await this.prisma.leads.findFirst({
      where: { id: leadId, organization_id: organizationId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const propertyIds = matches.map((m) => m?.propertyId);
    if (!propertyIds.every((pid) => typeof pid === 'string' && isUUID(pid))) {
      throw new BadRequestException('Every match needs a valid propertyId');
    }
    if (new Set(propertyIds).size !== propertyIds.length) {
      throw new BadRequestException('Duplicate property IDs are not allowed');
    }
    if (matches.some((m) => m.matchScore !== undefined && !(m.matchScore >= 0 && m.matchScore <= 100))) {
      throw new BadRequestException('matchScore must be between 0 and 100');
    }

    const ownProperties = await this.prisma.properties.count({
      where: { organization_id: organizationId, id: { in: propertyIds } },
    });
    if (ownProperties !== propertyIds.length) {
      throw new BadRequestException('One or more properties do not belong to this organization');
    }

    await this.prisma.$transaction([
      this.prisma.property_matches.deleteMany({ where: { lead_id: leadId } }),
      this.prisma.property_matches.createMany({
        data: matches.map((m) => ({
          organization_id: organizationId,
          lead_id: leadId,
          property_id: m.propertyId,
          match_score: m.matchScore,
          reason: m.reason,
        })),
      }),
    ]);

    return { saved: matches.length };
  }
}
