# Customer complementary-service request

> Status: Accepted  
> Last verified: 2026-08-24  
> Canonical coverage policy:
> [Website management coverage](./website-management-coverage.md)

## Outcome

An authenticated customer can request a complementary service for either an
existing Website or a typed domain without creating a Website record. The
ordinary **Add website → plans** journey remains the only customer entry to
managed-server onboarding.

## Entry and target field

The existing request page keeps one Website field implemented as a searchable,
writable combobox.

- Existing options are grouped as **Hosted and managed by Unixsee** and
  **External hosting**.
- A valid unmatched value becomes **Use `example.com` for this request**.
- The domain and coverage text are exposed in every option.
- Domains render LTR inside Persian RTL.
- Arrow keys move through options, Enter selects, and Escape closes the list.
- The field accepts exactly one target: `websiteId` or `websiteDomain`.

Typing a domain stores only its normalized hostname on the request. It does not
create a Website.

## Customer journey

1. Open the existing complementary-service request page.
2. Choose a published service.
3. Select an existing managed/external Website or type another domain.
4. For a typed domain, read the external-hosting boundary:
   - the domain is request context;
   - it appears in Websites only after staff acceptance and tenant
     authorization;
   - complementary work does not include hosting, monitoring, backup,
     security, or server management.
5. Choose engagement and scope, then describe the request.
6. Review service, normalized domain, and management coverage.
7. Submit once through the authenticated Server Action.
8. See the domain in request history. Do not add it to Website inventory at
   submission.

## States and recovery

| State                         | Customer experience                                                           |
| ----------------------------- | ----------------------------------------------------------------------------- |
| Catalog or Website load fails | Form is disabled; retry by reloading without presenting fixtures as real data |
| Invalid domain                | No typed-domain option; field error remains associated with the combobox      |
| Cross-tenant conflict         | Generic conflict; no owner or tenant detail is disclosed                      |
| Submission uncertain          | Retry with the same idempotency key                                           |
| Submitted                     | Domain appears in request history; Website inventory is unchanged             |
| Withdrawn/rejected            | No Website is created                                                         |
| Accepted without tenant       | Request remains domain-only and is labeled deferred                           |

## Acceptance criteria

- Typed-domain submission creates one request and zero Websites.
- Selecting an existing Website preserves its coverage snapshot.
- Managed and external options are distinguishable by text, not color alone.
- Review shows service, domain, and coverage before submission.
- Success never implies Website creation, service activation, or server
  management.
- The Add website CTA still routes to plans.
