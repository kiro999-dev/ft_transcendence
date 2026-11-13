import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

const STATUSES = ['New', 'Contacted', 'Interested', 'Visit Scheduled', 'Closed', 'Lost'];

const WITH_DETAILS = {
  visitors: true,
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
    return {
      id: lead.id,
      name: visitor.name ?? '',
      email: visitor.email ?? '',
      phone: visitor.phone ?? '',
      city: lead.desired_city ?? '',
      budget: lead.budget?.toString() ?? '',
      bedrooms: lead.bedrooms ?? '',
      status: lead.status,
      notes: lead.notes ?? '',
      created_at: lead.created_at,
    };
  }

  async findAll(organizationId: string) {
    const prisma = this.prisma as any;
    const leads = await prisma.leads.findMany({
      where: { organization_id: organizationId },
      include: WITH_DETAILS,
      orderBy: { created_at: 'desc' },
    });
    return leads.map((lead: any) => this.formatLead(lead));
  }

  async findByPhone(organizationId: string, phone: string) {
    const prisma = this.prisma as any;
    const lead = await prisma.leads.findFirst({
      where: { organization_id: organizationId, visitors: { phone } },
      include: WITH_DETAILS,
      orderBy: { created_at: 'desc' },
    });
    return lead ? { found: true, lead: this.formatLead(lead) } : { found: false };
  }

  async create(organizationId: string, body: any) {
    const { name, email, phone, city, budget, bedrooms, status, notes } = body;
    const prisma = this.prisma as any;

    if (!isText(name) || !isText(phone)) {
      throw new BadRequestException('Name and phone are required');
    }
    checkStatus(status);
    const budgetValue = toNumber(budget, 'Budget');
    const bedroomsValue = toNumber(bedrooms, 'Bedrooms', true);

    const lead = await prisma.$transaction(async (tx: any) => {
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
    const prisma = this.prisma as any;
    const exists = await prisma.leads.findFirst({
      where: { id, organization_id: organizationId },
    });
    if (!exists) throw new NotFoundException('Lead not found');

    checkStatus(body.status);

    const lead = await prisma.leads.update({
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
}
