# Phase 1 delivery waves

## Note

Sequences Phase 1 work into a first implementation wave and later Phase 1
items. Behavioral detail remains in
`docs/product/phase-1-application-features.md`.

**Last verified:** 2026-08-09

## First-wave (first implementation)

| Area | Intent |
|---|---|
| Websites | Admin websites inventory and ownership assignment |
| Servers / agents | Enroll and register agents from admin servers; agents discover websites and update admin websites (and assigned owner dashboards) |
| Users | Created by public signup or admin create; admin-created accounts start unverified; OTP with the recorded phone/email marks verified |
| Tickets | Customer and staff support workflow |
| Complementary services | Request, review, activate, deliver |
| Plan requests | Customer request + staff enablement on a website |

## Later Phase 1 (still in Phase 1)

| Area | Intent |
|---|---|
| Activities | Owner-dashboard timeline; include incidents resolved by the server team (for example high traffic detected and resolved). Needs richer ops/incident data before full delivery |
| Website notices (اعلان‌ها) | Admin popups/notices for a **specific website** (for example a harmful plugin). Not the News notifications feature |
| Notifications (News) | Unixsee news / platform announcements in the customer dashboard |
| Admin Settings | Administrator panel settings |

## Hard separation

Do not treat **اعلان‌ها** as the same product as **Notifications (News)**.

- News = platform-wide (or segment) announcements feed.
- اعلان‌ها = website-targeted operational popup/notice.

## Related

- Phase 1 feature spec: `../phase-1-application-features.md`
- Servers / discovery: `servers-agent-data-flow.md`
- Users / tenants: `../ux-flows/admin-users.md`
