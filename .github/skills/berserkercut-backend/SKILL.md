---
name: berserkercut-backend
description: >
  Maintain BerserkerCut Node/Express API contracts for auth and plans,
  aligned with mobile expectations and secure-by-default practices.
metadata:
  author: berserkercut
---

# BerserkerCut Backend

## Mission
Keep the backend API stable, secure, and aligned with mobile app contracts for authentication and daily plan lifecycle.

## Applies To
Teams: local project contributors working in BerserkerCut/backend.

## When To Use
- Editing routes in backend/src/routes.
- Modifying auth middleware, token creation, or payload shape.
- Updating plan persistence or supplement completion endpoints.

## Core Capabilities
- Enforce consistent JWT token and refresh-token contracts.
- Ensure user ownership checks on protected resources.
- Keep payload sanitization for profile and plan entities.
- Avoid leaking secrets in logs.

## Standard Workflow
1. Compare backend response schema with mobile service expectations.
2. Implement minimal route/model change.
3. Validate status codes and error messages for expected client behavior.
4. Update PROJECT_CONTEXT.md flags when risks are addressed.

## Inputs Required
- Endpoint(s) impacted and expected schema.
- Mobile caller path impacted (service/hook/screen).

## Output Contract
- Reviewable patch under backend/.
- Explicit contract note (before vs after).

## Stop Conditions
- Stop when route contract is coherent and backward compatibility is clear.
- Stop if a required schema decision is missing.

## Validation Steps
- Launch backend locally and call impacted routes.
- Verify auth-protected flows with valid and invalid tokens.

## Quick Quality Checklist
- [ ] No contract drift with mobile services.
- [ ] No sensitive headers/tokens logged.
- [ ] Ownership checks enforced for user-specific resources.

## Deliverables
- Backend patch and contract note.
- Optional mobile alignment patch if required.

## Quality Gates
- 2xx/4xx/5xx behavior is explicit and intentional.
- Token payload shape remains stable across register/login/refresh.

## Anti-Patterns To Avoid
- Returning different schema for equivalent auth endpoints.
- Accepting userId from client without ownership enforcement.
- Logging full request headers in production paths.

## Success Metrics
- Fewer auth/plan integration regressions.
- Stable mobile login and daily plan flows.
