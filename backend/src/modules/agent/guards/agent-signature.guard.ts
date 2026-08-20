import { createHmac, timingSafeEqual } from 'crypto';
import {
  BadRequestException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { createAppLogger } from '#/common/logging/app-logger.js';
import type { AgentRequest } from '#/common/interfaces/agent-request.interface.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

/** Same length as enrollment secrets (`randomBytes(32).toString('hex')`). */
const DUMMY_HMAC_SECRET = '0'.repeat(64);

@Injectable()
export class AgentSignatureGuard implements CanActivate {
  private readonly logger = createAppLogger(AgentSignatureGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AgentRequest>();
    const timestamp = request.headers['x-agent-timestamp'];
    const incomingSignature = request.headers['x-agent-signature'];

    const requestBody = request.body as
      | { agentInstanceId?: string }
      | undefined;
    const agentInstanceId = requestBody?.agentInstanceId;

    if (!agentInstanceId) {
      this.logger.warn('agent.auth.payload_invalid', {
        ip: request.ip,
        path: request.originalUrl,
      });
      throw new BadRequestException(
        'Invalid payload topology or missing agentInstanceId.',
      );
    }

    if (!timestamp || !incomingSignature) {
      this.logger.warn('agent.auth.headers_missing', {
        agentInstanceId,
        ip: request.ip,
        hasTimestamp: Boolean(timestamp),
        hasSignature: Boolean(incomingSignature),
      });
      throw this.authenticationFailed();
    }

    const normalizedTimestamp = this.firstHeaderValue(timestamp);
    const normalizedSignature = this.firstHeaderValue(incomingSignature);
    const requestTime = new Date(normalizedTimestamp).getTime();
    const driftMs = Math.abs(Date.now() - requestTime);

    if (Number.isNaN(requestTime) || driftMs > 5 * 60 * 1000) {
      this.logger.warn('agent.auth.timestamp_drift', {
        agentInstanceId,
        ip: request.ip,
        driftMs,
      });
      throw this.authenticationFailed();
    }

    if (!request.rawBody || request.rawBody.length === 0) {
      this.logger.warn('agent.auth.raw_body_missing', {
        agentInstanceId,
        ip: request.ip,
      });
      throw this.authenticationFailed();
    }

    const vpsNode = await this.prisma.vpsNode.findUnique({
      where: { agentInstanceId },
      select: { secretKey: true, credentialsRevokedAt: true },
    });

    const credentialsUsable = Boolean(
      vpsNode?.secretKey && !vpsNode.credentialsRevokedAt,
    );
    const secretKey = credentialsUsable
      ? vpsNode!.secretKey
      : DUMMY_HMAC_SECRET;

    const rawPayloadString = request.rawBody.toString('utf8');
    const dataToSign = `${normalizedTimestamp}.${rawPayloadString}`;
    const computedSignature = createHmac('sha256', secretKey)
      .update(dataToSign)
      .digest('hex');
    const signatureValid = this.safeCompareHex(
      normalizedSignature,
      computedSignature,
    );

    if (!credentialsUsable || !signatureValid) {
      this.logger.warn('agent.auth.rejected', {
        agentInstanceId,
        ip: request.ip,
        credentialsUsable,
        signatureValid,
      });
      throw this.authenticationFailed();
    }

    request.agentInstanceId = agentInstanceId;

    this.logger.debug('agent.auth.signature_verified', {
      agentInstanceId,
      ip: request.ip,
    });
    return true;
  }

  private authenticationFailed(): UnauthorizedException {
    return new UnauthorizedException(ERROR_MESSAGES.fa.unauthenticated);
  }

  private firstHeaderValue(value: string | string[]): string {
    return Array.isArray(value) ? value[0] : value;
  }

  private safeCompareHex(incoming: string, expected: string): boolean {
    if (!/^[a-f0-9]+$/i.test(incoming) || incoming.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(incoming, 'hex'),
      Buffer.from(expected, 'hex'),
    );
  }
}
