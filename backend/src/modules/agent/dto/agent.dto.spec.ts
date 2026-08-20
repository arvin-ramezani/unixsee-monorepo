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
    agentInstanceId: 'agent-instance-1',
    sentAt: '2026-08-19T12:00:00.000Z',
  };

  const discovery = {
    domain: 'example.com',
    aliases: ['www.example.com'],
    virtualHostName: 'example.com',
    source: 'openlitespeed',
    discoveredAt: '2026-08-19T12:00:00.000Z',
  };

  it('rejects an ingest envelope with no typed section', () => {
    expect(errorsFor(envelope)).not.toHaveLength(0);
  });

  it('accepts an explicitly empty discovery snapshot', () => {
    expect(errorsFor({ ...envelope, discoveries: [] })).toHaveLength(0);
  });

  it('accepts the OLS-only discovery shape', () => {
    expect(errorsFor({ ...envelope, discoveries: [discovery] })).toHaveLength(0);
  });

  it('rejects legacy discovery-owned filesystem and stack fields', () => {
    expect(
      errorsFor({
        ...envelope,
        discoveries: [
          {
            ...discovery,
            documentRoot: '/home/user/domains/example.com/public_html',
            owner: 'user',
            appType: 'wordpress',
            wordpressVersion: '6.8.2',
            phpVersion: '8.3.23',
            imagickVersion: '3.8.0',
            controlPanelUrl: 'https://panel.example.com:2222',
            wordpressAdminUrl: 'https://example.com/wp-admin/',
          },
        ],
      }),
    ).not.toHaveLength(0);
  });

  it('rejects a non-OLS discovery source', () => {
    expect(
      errorsFor({
        ...envelope,
        discoveries: [{ ...discovery, source: 'directadmin' }],
      }),
    ).not.toHaveLength(0);
  });

  it('requires virtualHostName and discoveredAt for discovery records', () => {
    const { virtualHostName: _vhost, discoveredAt: _at, ...incomplete } =
      discovery;
    expect(
      errorsFor({ ...envelope, discoveries: [incomplete] }),
    ).not.toHaveLength(0);
  });

  it('accepts discovery and stack as separate sections in one envelope', () => {
    expect(
      errorsFor({
        ...envelope,
        discoveries: [discovery],
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


  it('accepts an exact rolling 180-second active visitor sample', () => {
    expect(
      errorsFor({
        ...envelope,
        activeVisitors3m: [
          {
            domain: 'example.com',
            uniqueVisitorCount: 7,
            windowSeconds: 180,
            windowStartedAt: '2026-08-19T11:57:00.000Z',
            measuredAt: '2026-08-19T12:00:00.000Z',
            status: { state: 'ok' },
          },
        ],
      }),
    ).toHaveLength(0);
  });

  it('rejects the legacy uniqueIpCount wire field', () => {
    expect(
      errorsFor({
        ...envelope,
        activeVisitors3m: [
          {
            domain: 'example.com',
            uniqueIpCount: 7,
            windowSeconds: 180,
            windowStartedAt: '2026-08-19T11:57:00.000Z',
            measuredAt: '2026-08-19T12:00:00.000Z',
            status: { state: 'ok' },
          },
        ],
      }),
    ).not.toHaveLength(0);
  });

  it('accepts zero visitors while warming up', () => {
    expect(
      errorsFor({
        ...envelope,
        activeVisitors3m: [
          {
            domain: 'example.com',
            uniqueVisitorCount: 0,
            windowSeconds: 180,
            windowStartedAt: '2026-08-19T11:57:00.000Z',
            measuredAt: '2026-08-19T12:00:00.000Z',
            status: { state: 'unknown', reason: 'warming_up' },
          },
        ],
      }),
    ).toHaveLength(0);
  });

  it('rejects active visitor windows that are not exactly 180 seconds', () => {
    expect(
      errorsFor({
        ...envelope,
        activeVisitors3m: [
          {
            domain: 'example.com',
            uniqueVisitorCount: 7,
            windowSeconds: 120,
            windowStartedAt: '2026-08-19T11:58:00.000Z',
            measuredAt: '2026-08-19T12:00:00.000Z',
            status: { state: 'ok' },
          },
        ],
      }),
    ).not.toHaveLength(0);
  });

  it('requires active visitor status instead of treating zero as a silent real value', () => {
    expect(
      errorsFor({
        ...envelope,
        activeVisitors3m: [
          {
            domain: 'example.com',
            uniqueVisitorCount: 0,
            windowSeconds: 180,
            windowStartedAt: '2026-08-19T11:57:00.000Z',
            measuredAt: '2026-08-19T12:00:00.000Z',
          },
        ],
      }),
    ).not.toHaveLength(0);
  });

  it('accepts a partial 24h sample only with non-ok status', () => {
    expect(
      errorsFor({
        ...envelope,
        visitors24h: [
          {
            domain: 'example.com',
            uniqueVisitors24h: 123,
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
            uniqueVisitors24h: 123,
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
