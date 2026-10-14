# Domain docs

This repository uses a single-context layout:

- `GLOSSARY.md` at the repository root defines domain vocabulary.
- `docs/adr/` holds architecture decision records.

## Before exploring

Read `GLOSSARY.md` and any ADRs relevant to the area being explored.

If these files or directories do not exist, proceed silently. Do not
suggest creating them upfront. The `domain-modeling` skill creates them
when terms or decisions are resolved.

## Use the glossary's vocabulary

Use glossary terms when naming domain concepts in issues, proposals,
hypotheses, tests, and code. Respect any synonyms the glossary excludes.

If a needed concept is missing, reconsider whether it belongs to the
project's vocabulary; note genuine gaps for `domain-modeling`.

## Flag ADR conflicts

Explicitly identify any existing ADR your proposal contradicts and
explain why the decision should be reconsidered.
