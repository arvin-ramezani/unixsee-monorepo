import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { Phase1IngestDto } from './agent.dto.js';

function errorsFor(payload: Record<string, unknown>) {
  return validateSync(plainToInstance(Phase1IngestDto, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('Phase1IngestDto', () => {
  const envelope = {
    schemaVersion: 'phase1',
    machineId: 'machine-1',
    sentAt: '2026-08-19T12:00:00.000Z',
  };

  it('rejects an ingest envelope with no typed section', () => {
    expect(errorsFor(envelope)).not.toHaveLength(0);
  });

  it('accepts an explicitly empty discovery snapshot', () => {
    expect(errorsFor({ ...envelope, discoveries: [] })).toHaveLength(0);
  });

  it('accepts a stack-only ingest', () => {
    expect(
      errorsFor({
        ...envelope,
        stackSnapshots: [
          {
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
          },
        ],
      }),
    ).toHaveLength(0);
  });

  it('rejects stack status ok when its value is null', () => {
    expect(
      errorsFor({
        ...envelope,
        stackSnapshots: [
          {
            domain: 'example.com',
            wordpressVersion: null,
            phpVersion: '8.3.23',
            imagickVersion: '3.8.0',
            checkedAt: '2026-08-19T12:00:00.000Z',
            fieldStatus: {
              wordpressVersion: { state: 'ok' },
              phpVersion: { state: 'ok' },
              imagickVersion: { state: 'ok' },
            },
          },
        ],
      }),
    ).not.toHaveLength(0);
  });

  it('accepts a 24h warming sample with partial coverage', () => {
    expect(
      errorsFor({
        ...envelope,
        visitors24h: [
          {
            domain: 'example.com',
            uniqueVisitors24h: 50,
            windowSeconds: 86400,
            coverageSeconds: 7200,
            measuredAt: '2026-08-19T12:00:00.000Z',
            algorithm: 'hll',
            status: { state: 'unknown', reason: 'warming_up' },
          },
        ],
      }),
    ).toHaveLength(0);
  });

  it('rejects partial 24h coverage reported as ok', () => {
    expect(
      errorsFor({
        ...envelope,
        visitors24h: [
          {
            domain: 'example.com',
            uniqueVisitors24h: 50,
            windowSeconds: 86400,
            coverageSeconds: 7200,
            measuredAt: '2026-08-19T12:00:00.000Z',
            algorithm: 'hll',
            status: { state: 'ok' },
          },
        ],
      }),
    ).not.toHaveLength(0);
  });
});
