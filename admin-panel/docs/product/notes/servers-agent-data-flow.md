# Servers and agent data flow

## Note

Staff can create a server with a proper ID, then create an enrollment token for the agent planned to run on that VPS. Communication happens from the agent to NestJS. NestJS validates the agent and payload, persists the data, and exposes it to the admin panel. After staff review and assignment, the website is created and shown with the related website data received from the agent.

Commercial plan entitlement is a separate channel: the public site collects a plan choice, external validation is out of this admin app, and staff enable the requested plan on a website in درخواست‌های پلن after linking an **existing** user/tenant. Each website has at most one active plan at a time. Agent discovery does not enable a plan and does not make a website customer-visible by itself. Customer accounts may already exist from public signup or may be created in `/users` / discovery assignment—not from the plan-request surface. See `docs/product/notes/onboarding-plan-request-user-website.md` and `docs/product/notes/onboarding-paths-and-handoffs.md`.

## Sequence

1. Create a server record with a stable ID in the admin panel.
2. Issue a one-time enrollment token for the agent on that VPS.
3. The agent connects to NestJS and pushes discovery and monitoring data.
4. NestJS validates the agent credentials and payload, then stores the data.
5. The admin panel shows the validated server, agent, and discovery records.
6. Staff assign each discovered website to a tenant (find existing or inline create when needed) and a plan (prefer the chosen plan from a linked plan request when one is ready/enabled for that context).
7. The website becomes available with the related data received from the agent after assignment/activation rules pass.

## Trust boundary

- The agent communicates with NestJS only.
- NestJS is the authority that validates agents and writes business data.
- The admin panel does not talk to agents or VPS hosts directly.
- Website customer visibility follows assignment and service activation rules, not raw discovery alone.
- Plan enablement follows the thin plan-request workflow, not agent inventory.
