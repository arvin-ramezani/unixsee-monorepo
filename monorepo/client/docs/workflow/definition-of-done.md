# Definition of Done

> **Status:** Current
>
> **Owner:** Engineering team
>
> **Last verified:** 2026-08-04

A change is complete when every applicable item below is satisfied or explicitly reported as not validated.

## Requirements and Architecture

- [ ] The implementation matches the accepted goal and acceptance criteria.
- [ ] Non-goals and existing behavior were preserved.
- [ ] System ownership follows the current architecture documents.
- [ ] Material decisions have an ADR or an updated canonical document.

## Implementation

- [ ] Strict TypeScript and existing repository conventions are preserved.
- [ ] Loading, empty, error, permission, and cleanup states are handled where relevant.
- [ ] Persian RTL and English LTR behavior were checked for user-facing changes.
- [ ] Accessibility and responsive behavior were reviewed.
- [ ] No unrelated refactor, dependency, generated file, backup, or debug output was added.

## Security and Reliability

- [ ] No credential, token, private URL, or sensitive payload was introduced.
- [ ] External input is validated at the correct trust boundary.
- [ ] Authorization is enforced by the owning backend for protected operations.
- [ ] Migration, deployment, and rollback effects were considered.

## Validation and Review

- [ ] Relevant configured commands were run successfully or their failures were reported accurately.
- [ ] New failures were distinguished from baseline debt.
- [ ] The final diff was reviewed against the specification.
- [ ] Current documentation was updated with behavior or architecture changes.
- [ ] Remaining risks and anything not validated are included in the final report.
