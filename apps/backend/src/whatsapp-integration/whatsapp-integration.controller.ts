import { Body, Controller, Delete, ForbiddenException, NotFoundException, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IsString, Matches, MaxLength, IsOptional } from 'class-validator';
import { timingSafeEqual } from 'crypto';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { PrismaService } from '../prisma/prisma.service';

class SessionDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{1,64}$/)
  session: string;
}

class SenderDto extends SessionDto {
  @IsString()
  @Matches(/^\d{7,20}@c\.us$/)
  chat_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;
}

@Controller('internal/ai/whatsapp')
export class WhatsappIntegrationController {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

  @Post('link')
  @UseGuards(AuthenticationGuard)
  async link(@Body() body: SessionDto, @Req() req: any) {
    if (req.user.role !== 'owner' || !req.user.organizationId) {
      throw new ForbiddenException('Only an agency owner can link WhatsApp');
    }
    const configured = this.config.get<string>('WAHA_SESSION') || 'default';
    if (body.session !== configured) throw new ForbiddenException('Session is not configured on this server');
    const existing = await this.prisma.whatsapp_sessions.findUnique({ where: { session_name: body.session } });
    if (existing && existing.organization_id !== req.user.organizationId) {
      throw new ForbiddenException('Session already belongs to another agency');
    }
    const result = await this.prisma.whatsapp_sessions.upsert({
      where: { organization_id: req.user.organizationId },
      create: { organization_id: req.user.organizationId, session_name: body.session },
      update: { session_name: body.session },
    });
    return { session: result.session_name, organization_id: result.organization_id };
  }

  @Post('context')
  async context(@Body() body: SenderDto, @Req() req: any) {
    const expected = this.config.get<string>('AI_GATEWAY_TOKEN');
    const supplied = req.headers['x-ai-gateway-token'];
    if (!expected || typeof supplied !== 'string' ||
        Buffer.byteLength(expected) !== Buffer.byteLength(supplied) ||
        !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
      throw new UnauthorizedException('Invalid AI gateway credential');
    }
    const session = await this.prisma.whatsapp_sessions.findUnique({ where: { session_name: body.session } });
    if (!session) throw new NotFoundException('Link this WhatsApp session to an agency first');
    const organization = await this.prisma.organizations.findUnique({ where: { id: session.organization_id } });
    if (!organization || organization.status !== 'active') throw new ForbiddenException('Agency is not active');
    const owner = await this.prisma.users.findFirst({ where: { organization_id: session.organization_id, role: 'owner' } });
    if (!owner) throw new NotFoundException('Agency owner not found');
    const phone = '+' + body.chat_id.split('@')[0];
    const result = await this.prisma.$transaction(async tx => {
      // A sender may generate overlapping webhook deliveries or gateway requests.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${session.organization_id + ':' + phone}))::text`;
      let contact = await tx.visitors.findFirst({ where: { organization_id: session.organization_id, phone } });
      if (!contact) contact = await tx.visitors.create({ data: {
        organization_id: session.organization_id, phone, name: body.name?.trim() || phone,
      }});
      let lead = await tx.leads.findFirst({ where: { organization_id: session.organization_id, visitor_id: contact.id }, orderBy: { created_at: 'desc' } });
      if (!lead) lead = await tx.leads.create({ data: {
        organization_id: session.organization_id, visitor_id: contact.id, status: 'New',
      }});
      return { organization_id: session.organization_id, contact_id: contact.id, lead_id: lead.id };
    });
    // Fresh short-lived access on every verified webhook; no copied customer JWTs.
    const backend_token = this.jwt.sign({ sub: owner.id, organizationId: session.organization_id, role: 'owner' }, { expiresIn: '15m' });
    return { context: result, backend_token };
  }

  @Delete('link')
  @UseGuards(AuthenticationGuard)
  async unlink(@Req() req: any) {
    if (req.user.role !== 'owner' || !req.user.organizationId) throw new ForbiddenException('Only an owner can unlink WhatsApp');
    return this.prisma.whatsapp_sessions.deleteMany({ where: { organization_id: req.user.organizationId } });
  }
}
