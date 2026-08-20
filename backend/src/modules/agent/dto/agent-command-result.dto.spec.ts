import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { AgentCommandResultDto } from './agent.dto.js';

function errorsFor(payload: Record<string, unknown>) {
  return validateSync(plainToInstance(AgentCommandResultDto, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

const stackSnapshot = {
  domain: 'example.com',
  wordpressVersion: '6.8.2',
  phpVersion: '8.3.23',
  imagickVersion: '3.8.0',
  checkedAt: '2026-08-19T12:00:00.000Z',
  fieldStatus: {
    wordpressVersion: { state: 'ok' },
    phpVersion: { state: 'ok' },
    imagickVersion: { state: 'ok' },
  },
};

const base = {
  schemaVersion: 'phase1',
  agentInstanceId: 'agent-instance-1',
  commandId: '6e00ef4d-afc5-4324-9da0-169f2dc987ac',
  type: 'REFRESH_SITE_STACK',
  domain: 'example.com',
  completedAt: '2026-08-19T12:00:01.000Z',
};

describe('AgentCommandResultDto', () => {
  it('accepts a successful refresh with one stack snapshot', () => {
    expect(
      errorsFor({ ...base, status: 'SUCCEEDED', stackSnapshot }),
    ).toHaveLength(0);
  });

  it('accepts a failed refresh with an explicit error code', () => {
    expect(
      errorsFor({
        ...base,
        status: 'FAILED',
        errorCode: 'domain_not_in_inventory',
      }),
    ).toHaveLength(0);
  });

  it('rejects success without a stack snapshot', () => {
    expect(errorsFor({ ...base, status: 'SUCCEEDED' })).not.toHaveLength(0);
  });

  it('rejects a snapshot for a different domain', () => {
    expect(
      errorsFor({
        ...base,
        status: 'SUCCEEDED',
        stackSnapshot: { ...stackSnapshot, domain: 'other.example.com' },
      }),
    ).not.toHaveLength(0);
  });

  it('rejects any command type except REFRESH_SITE_STACK', () => {
    expect(
      errorsFor({
        ...base,
        type: 'RUN_COMMAND',
        status: 'FAILED',
        errorCode: 'unsupported_command',
      }),
    ).not.toHaveLength(0);
  });
});
