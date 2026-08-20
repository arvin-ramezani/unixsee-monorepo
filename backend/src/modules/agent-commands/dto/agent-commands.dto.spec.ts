import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CreateRefreshSiteStackCommandDto } from './agent-commands.dto.js';

describe('CreateRefreshSiteStackCommandDto', () => {
  it('accepts a discovery UUID only', () => {
    const errors = validateSync(
      plainToInstance(CreateRefreshSiteStackCommandDto, {
        discoveryId: '6e00ef4d-afc5-4324-9da0-169f2dc987ac',
      }),
      { whitelist: true, forbidNonWhitelisted: true },
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects executable or arbitrary target fields', () => {
    const errors = validateSync(
      plainToInstance(CreateRefreshSiteStackCommandDto, {
        discoveryId: '6e00ef4d-afc5-4324-9da0-169f2dc987ac',
        command: 'rm -rf /',
        url: 'http://127.0.0.1:1234/',
        path: '/etc/passwd',
      }),
      { whitelist: true, forbidNonWhitelisted: true },
    );
    expect(errors).not.toHaveLength(0);
  });
});
