import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ApiResponseBuilder } from './api-response.builder.js';

describe('ApiResponseBuilder', () => {
  it('maps HTTP 409 to the stable CONFLICT error code', () => {
    const response = ApiResponseBuilder.error(HttpStatus.CONFLICT);

    expect(response).toMatchObject({
      statusCode: HttpStatus.CONFLICT,
      success: false,
      data: null,
      error: { code: 'CONFLICT' },
    });
  });
});
