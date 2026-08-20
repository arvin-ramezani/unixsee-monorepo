import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CreateServerDto, UpdateServerDto } from './servers.dto.js';

function errorsFor<T extends object>(
  type: new () => T,
  payload: Record<string, unknown>,
) {
  return validateSync(plainToInstance(type, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('server manual control-panel metadata DTOs', () => {
  it('accepts an HTTPS control-panel URL when creating a server', () => {
    expect(
      errorsFor(CreateServerDto, {
        name: 'VPS DE 01',
        ipAddress: '203.0.113.10',
        controlPanelUrl: 'https://panel.example.com:2222',
      }),
    ).toHaveLength(0);
  });

  it('allows staff to clear the control-panel URL', () => {
    expect(
      errorsFor(UpdateServerDto, { controlPanelUrl: null }),
    ).toHaveLength(0);
  });

  it('rejects non-HTTP control-panel URLs', () => {
    expect(
      errorsFor(UpdateServerDto, {
        controlPanelUrl: 'ftp://panel.example.com',
      }),
    ).not.toHaveLength(0);
  });
});
