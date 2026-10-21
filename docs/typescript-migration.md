# TypeScript migration plan

Status: specified in [GitHub issue #26](https://github.com/DevShaded/Bob-Watts/issues/26), including confirmed testing boundaries. Implementation has not started.

The [architecture decision](adr/0001-typescript-migration.md) records the agreed scope and trade-offs.

## Agreed outcome

- Convert application code, command-registration and setup scripts, and tests to TypeScript in one complete migration, developed in verifiable checkpoints.
- Enable strict type checking and enforce it in CI.
- Compile JavaScript for production and migrate the project to ES modules.
- Use explicit typed command and event registries. Startup, registration, and help share the command definitions and category metadata.
- Prohibit `any`, unchecked casts, and type-check suppression comments in maintained code and tests. Third-party and generated declarations are outside that prohibition; unsafe library results enter maintained code as `unknown` and are validated before use.
- Fix bugs discovered during conversion. Changes to behavior require a clear defect and a regression check; ambiguous product behavior remains a question for the user.

## Implementation checkpoints

1. Configure the TypeScript compiler for Node 24 and ES modules, separate generated output from source files, and add type-aware linting to enforce the prohibition on unsafe escapes.
2. Establish typed configuration, database, Discord interaction, command, and event boundaries. Replace import-time runtime initialization with explicit startup functions and narrow dependencies that tests can provide safely.
3. Convert application modules, commands, events, and scripts. Build the shared registries and validate external API fields before use. Preserve help categories and command visibility while deriving names from command definitions.
4. Convert tests, replace CommonJS cache manipulation, and add focused regression coverage for migration-sensitive behavior and discovered defects.
5. Update npm scripts, Prisma configuration, PM2 configuration, CI, and contributor instructions for the compiled application. Prisma configuration can become TypeScript; PM2's data-only configuration can become JSON.

## Compatibility requirements

- Configuration validation follows the entrypoint: application startup, command registration, setup checks, and dependency installation have different requirements.
- Dependency installation and Prisma generation work before an environment file exists. Setup checks do not require Discord credentials.
- Weather credentials remain optional. Unavailable weather configuration or malformed external responses produce controlled command failures.
- Existing slash command definitions, permission rules, help category order, and historical database enum values remain compatible, except where a verified defect requires a documented correction.
- Direct Node and PM2 execution use compiled output. Runtime paths, including package-version lookup, work from that output.

## Completion checks

- A clean installation, Prisma generation, strict type check, type-aware lint, production build, and offline tests succeed.
- CI runs the type check, lint, build, and tests.
- The current baseline of 10 passing offline tests remains covered, with ESM-compatible tests for startup and registration.
- Registry checks cover all 30 existing commands, category metadata, registration payloads, and dispatch contracts.
- Focused tests cover malformed external data, errors without HTTP responses, optional configuration, and each additional bug fixed during conversion.
- Built entrypoints and configuration are exercised without contacting Discord or changing a production database. Live bot verification, if needed, is a separate operational step.
