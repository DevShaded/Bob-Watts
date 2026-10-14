# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `DevShaded/Bob-Watts`.
Use the `gh` CLI from this clone; it infers the repository from the Git remote.

## Conventions

Write multiline bodies to a file and pass it with `--body-file`.

- Create: `gh issue create --title "..." --body-file /path/to/body.md`.
- Read, including labels and discussion: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list --state open --json number,title,body,labels,comments`, with appropriate label or state filters.
- Comment: `gh issue comment <number> --body-file /path/to/comment.md`.
- Apply or remove labels: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close: `gh issue close <number>`; post any explanation first.

When a skill says "publish to the issue tracker", create a GitHub issue.
When it says "fetch the relevant ticket", read the issue, labels, and comments.

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub shares issue and PR numbers. If a reference identifies a PR,
read it with `gh pr view <number> --comments` and inspect its changes
with `gh pr diff <number>`.

## Wayfinding operations

Used by `/wayfinder`: a map issue tracks child tickets.

- Map: create an issue labelled `wayfinder:map` with Notes, Decisions-so-far, and Fog sections.
- Child: link the ticket as a GitHub sub-issue through `gh api`. If unavailable, add it to the map's task list and put `Part of #<map>` at the top of its body. Use `wayfinder:<type>` labels, where type is `research`, `prototype`, `grilling`, or `task`.
- Blocking: use native issue dependencies. Add a blocker with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`. Obtain the database ID with `gh api repos/<owner>/<repo>/issues/<number> --jq .id`; it is not the issue number or node ID. If dependencies are unavailable, put `Blocked by: #<number>` references at the top of the child body.
- Frontier: inspect the map's open children in map order. Skip assigned tickets and tickets with open blockers. Native `issue_dependencies_summary.blocked_by` counts open blockers; for the fallback, check each referenced issue's state.
- Claim: assign the selected ticket with `gh issue edit <number> --add-assignee @me` as the session's first write.
- Resolve: comment with the answer, close the ticket, and append a brief finding plus its link to the map's Decisions-so-far section.
