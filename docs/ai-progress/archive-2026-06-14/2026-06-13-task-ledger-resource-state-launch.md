# Task Ledger - 2026-06-13 Resource State Launch

## Completed This Round

- [x] T001 - Add server-side `PlayerResourceState` domain entity.
- [x] T002 - Wire `ResourceStates` into EF Core, repository, and runtime SQLite schema patching.
- [x] T003 - Make `/api/launch` update authoritative coin and bean balances.
- [x] T004 - Preserve launch idempotency so repeated `clientRequestId` does not double-spend or double-reward.
- [x] T005 - Extend launch API contract with server resource balances.
- [x] T006 - Add frontend `ResourceManager.applyServerSnapshot()` and use it after server launch success.
- [x] T007 - Update server API smoke script to assert launch balances.
- [x] T008 - Refresh Cocos script assets in asset-db.
- [x] T009 - Run backend, TypeScript, smoke, and Playwright UI regression checks.
- [x] T010 - Write progress and handoff notes for the next AI pass.

## Next Queue

- [ ] N001 - Add `GET /api/resources` for explicit server resource snapshot fetching.
- [ ] N002 - Pull server resources after guest login/server connect and apply local snapshot.
- [ ] N003 - Move mail reward claiming to server-side resource transactions.
- [ ] N004 - Move one paid gameplay action, preferably shop purchase or cat upgrade, to server resource transactions.
- [ ] N005 - Add resource transaction ledger/audit records.
- [ ] N006 - Continue visual polish toward target UI, prioritizing HUD depth and room prop density.
