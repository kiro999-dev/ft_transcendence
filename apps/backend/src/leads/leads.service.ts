
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatLead(lead: any) {
    return {
      id: lead.id,
      name: lead.visitors.name ?? '',
      email: lead.visitors.email ?? '',
      phone: lead.visitors.phone ?? '',
      city: lead.desired_city ?? lead.properties?.city ?? '',
      budget: lead.budget?.toString() ?? '',
      bedrooms: lead.bedrooms ?? lead.properties?.bedrooms ?? '',
      status: lead.status,
      score: lead.score ?? '',
      created_at: lead.created_at,
      notes: lead.notes ?? '',
      property_matches: lead.property_matches?.map((match: any) => ({
        id: match.properties.id,
        title: match.properties.title,
        location: match.properties.city,
        price: match.properties.price.toString(),
        matchScore: match.match_score?.toString() ?? '',
        reason: match.reason ?? '',
      })) ?? [],
    };
  }

  async findByPhone(organizationId: string, phone: string) {
    const visitor = await this.prisma.visitors.findFirst({
      where: { organization_id: organizationId, phone },
      include: {
        leads: {
          where: { organization_id: organizationId },
          include: {
            visitors: true,
            properties: true,
            property_matches: { include: { properties: true } },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!visitor || visitor.leads.length === 0) {
      return { found: false };
    }

    return {
      found: true,
      lead: this.formatLead(visitor.leads[0]),
    };
  }

  async create(organizationId: string, body: Record<string, any>) {
    const { name, email, phone, city, budget, bedrooms, status, notes } = body;

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof phone !== 'string' || !phone.trim()
    ) {
      throw new BadRequestException('Name and phone are required');
    }

    if (budget !== undefined && (
      !Number.isFinite(Number(budget)) || Number(budget) < 0
    )) {
      throw new BadRequestException('Budget must be a non-negative number');
    }

    if (bedrooms !== undefined && (
      !Number.isInteger(Number(bedrooms)) || Number(bedrooms) < 0
    )) {
      throw new BadRequestException('Bedrooms must be a non-negative integer');
    }

    const allowedStatuses = [
      'New', 'Contacted', 'Interested', 'Visit Scheduled', 'Closed', 'Lost',
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid lead status');
    }

    const visitor = await this.prisma.visitors.findFirst({
      where: { organization_id: organizationId, phone: phone.trim() },
    });

    const lead = await this.prisma.$transaction(async (tx) => {
      const customer = visitor
        ? await tx.visitors.update({
            where: { id: visitor.id },
            data: {
              name: name.trim(),
              email: typeof email === 'string' ? email : visitor.email,
            },
          })
        : await tx.visitors.create({
            data: {
              organization_id: organizationId,
              name: name.trim(),
              phone: phone.trim(),
              email: typeof email === 'string' ? email : null,
            },
          });

      return tx.leads.create({
        data: {
          organization_id: organizationId,
          visitor_id: customer.id,
          desired_city: typeof city === 'string' ? city : null,
          budget: budget !== undefined ? String(budget) : undefined,
          bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
          status: status ?? 'New',
          notes: typeof notes === 'string' ? notes : null,
        },
        include: {
          visitors: true,
          properties: true,
          property_matches: { include: { properties: true } },
        },
      });
    });

    return { lead: this.formatLead(lead) };
  }

  async update(
    organizationId: string,
    id: string,
    body: Record<string, any>,
  ) {
    const existing = await this.prisma.leads.findFirst({
      where: { id, organization_id: organizationId },
    });

    if (!existing) throw new NotFoundException('Lead not found');

    const data: Record<string, any> = {};

    if (body.city !== undefined) {
      if (typeof body.city !== 'string') {
        throw new BadRequestException('City must be a string');
      }
      data.desired_city = body.city;
    }

    if (body.budget !== undefined) {
      if (!Number.isFinite(Number(body.budget)) || Number(body.budget) < 0) {
        throw new BadRequestException('Invalid budget');
      }
      data.budget = String(body.budget);
    }

    if (body.bedrooms !== undefined) {
      if (!Number.isInteger(Number(body.bedrooms)) || Number(body.bedrooms) < 0) {
        throw new BadRequestException('Invalid bedrooms');
      }
      data.bedrooms = Number(body.bedrooms);
    }

    if (body.status !== undefined) {
      const allowed = [
        'New', 'Contacted', 'Interested', 'Visit Scheduled', 'Closed', 'Lost',
      ];
      if (!allowed.includes(body.status)) {
        throw new BadRequestException('Invalid lead status');
      }
      data.status = body.status;
    }

    if (body.notes !== undefined) {
      if (typeof body.notes !== 'string') {
        throw new BadRequestException('Notes must be a string');
      }
      data.notes = body.notes;
    }

    const lead = await this.prisma.leads.update({
      where: { id },
      data,
      include: {
        visitors: true,
        properties: true,
        property_matches: { include: { properties: true } },
      },
    });

    return { lead: this.formatLead(lead) };
  }

  async saveMatches(
    organizationId: string,
    leadId: string,
    matches: Array<{
      propertyId: string;
      matchScore?: number;
      reason?: string;
    }>,
  ) {
    if (!Array.isArray(matches)) {
      throw new BadRequestException('matches must be an array');
    }

    const lead = await this.prisma.leads.findFirst({
      where: { id: leadId, organization_id: organizationId },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    for (const match of matches) {
      if (
        !match ||
        typeof match.propertyId !== 'string' ||
        !/^[0-9a-f-]{36}$/i.test(match.propertyId)
      ) {
        throw new BadRequestException('Every match needs a valid propertyId');
      }

      if (
        match.matchScore !== undefined &&
        (!Number.isFinite(match.matchScore) ||
          match.matchScore < 0 || match.matchScore > 100)
      ) {
        throw new BadRequestException('matchScore must be between 0 and 100');
      }
    }

    const propertyIds = matches.map((match) => match.propertyId);

    const properties = await this.prisma.properties.findMany({
      where: {
        organization_id: organizationId,
        id: { in: propertyIds },
      },
      select: { id: true },
    });

    if (new Set(propertyIds).size !== propertyIds.length) {
      throw new BadRequestException('Duplicate property IDs are not allowed');
    }

    if (properties.length !== propertyIds.length) {
      throw new BadRequestException(
        'One or more properties do not belong to this organization',
      );
    }

    await this.prisma.$transaction([
      this.prisma.property_matches.deleteMany({
        where: { organization_id: organizationId, lead_id: leadId },
      }),
      this.prisma.property_matches.createMany({
        data: matches.map((match) => ({
          organization_id: organizationId,
          lead_id: leadId,
          property_id: match.propertyId,
          match_score: match.matchScore,
          reason: match.reason,
        })),
      }),
    ]);

    return { saved: matches.length };
  }
}
