---
status: accepted
---

# Migrate to TypeScript with strict checking

The project will migrate application code, command-registration and setup scripts, and tests from JavaScript to TypeScript with strict type checking and a CI check that fails on type errors. The migration will be delivered as one complete conversion, developed in verifiable checkpoints, rather than separate stages that leave a mixed JavaScript and TypeScript project. Small JavaScript tool configurations are permitted only where their loaders require them; generated JavaScript is expected build output.

TypeScript will compile to JavaScript for production, and the project will migrate from CommonJS to ES modules in the same change. This accepts additional work on module loading and tests, which currently depend on CommonJS, instead of preserving the existing module system.

Bugs discovered during the migration are in scope for fixes, accepting a broader review scope in return for addressing defects as they are found. There will be no exceptions permitting `any`, unchecked casts, or type-check suppression comments in maintained code or tests. This constraint does not require rewriting third-party or generated declarations: unsafe library results must enter our code as `unknown` and be validated before use.

Explicit typed registries will replace folder-based command and event discovery. Startup, command registration, and help will share the command registry, accepting the need to add a registry entry for each new command in exchange for compile-time checks of registered handlers and consistent command metadata.

The complete specification and agreed testing boundaries are published in [GitHub issue #26](https://github.com/DevShaded/Bob-Watts/issues/26). Implementation has not started.
