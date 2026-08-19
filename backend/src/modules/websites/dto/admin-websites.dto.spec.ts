import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';

import {
  AdminCreateWebsiteDto,
  AdminUpdateWebsiteDto,
} from './admin-websites.dto.js';

function errorsFor<T extends object>(
  type: new () => T,
  payload: Record<string, unknown>,
) {
  return validateSync(plainToInstance(type, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('website manual WordPress admin metadata DTOs', () => {
  it('accepts WordPress admin URL on admin website create', () => {
    expect(
      errorsFor(AdminCreateWebsiteDto, {
        tenantId: '0eec97ea-403a-49e7-9122-4c43df34967a',
        vpsNodeId: 'd287244b-666e-4984-bad3-d1fca0a15466',
        domain: 'example.com',
        wordpressAdminUrl: 'https://example.com/wp-admin/',
      }),
    ).toHaveLength(0);
  });

  it('accepts null to clear WordPress admin URL', () => {
    expect(
      errorsFor(AdminUpdateWebsiteDto, { wordpressAdminUrl: null }),
    ).toHaveLength(0);
  });

  it('rejects non-HTTP WordPress admin URLs', () => {
    expect(
      errorsFor(AdminUpdateWebsiteDto, {
        wordpressAdminUrl: 'javascript:alert(1)',
      }),
    ).not.toHaveLength(0);
  });
});
