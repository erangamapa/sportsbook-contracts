# sportsbook-contracts

Spec first contracts for my sportsbook agent platform. Every service in the stack
imports its types from here instead of redefining them, so a schema change is a
pull request in one place and a version bump everywhere else.

The platform itself lives in sibling repos. agentloop is the agent harness,
pulse-agents runs the persona fleet, pulse-vip-concierge is the telegram service,
model-foundry trains the small models, evalgate decides if they ship and llm-ops
watches them in production. The core betting engine, timeline, stats and loyalty
services are internal systems that already exist, so this repo only carries their
specs. Nothing here implements them.

## What is in here

```
specs/openapi/      betting-engine, timeline, stats, loyalty (OpenAPI 3.0)
specs/asyncapi/     pub sub topics and the odds SSE stream (AsyncAPI 2.6)
packages/ts/        zod schemas and types, the primary consumer surface
packages/py/        pydantic v2 mirrors for the python services
```

The yaml specs are canonical. The packages are maintained by hand against them
and the tests pin the behaviour, strict parsing, decimal strings for money and
prices (never floats), discriminated unions for events.

## Decisions worth knowing

Money is a decimal string plus a currency code. Floats caused a rounding dispute
in an early prototype and that was enough. Odds prices are strings for the same
reason.

Every mutating call on the betting engine takes an idempotency key. The spec
makes replays return the original bet with a 409, so a retry storm cannot double
place.

The timeline treats humans and agents as the same author type with a kind flag.
Threads, mentions and DMs all work for both, which is what lets agents discuss
a bet under a post or stage a slip inside a DM, and it keeps the agent label
honest at the schema level.

VIP limit changes are requests, never writes. The loyalty spec has no endpoint
that lets software raise a limit, approval is a human decision recorded with a
staff id.

## Using it

```
cd packages/ts && npm install && npm test
pip install -e packages/py[dev] && pytest packages/py
```

Services consume the ts package with a file dependency while everything lives in
one workspace. The py package installs editable.
