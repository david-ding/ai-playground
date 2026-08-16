---
name: issue-to-pr
description: Use when the user invokes /issue-to-pr with a Linear issue to run a guarded workflow from requirements grilling through a reviewed draft GitHub pull request.
---

# Issue To PR

Orchestrate one Linear issue through requirements discovery, specification, optional ticket decomposition, implementation, review, and draft pull-request creation.

This is a stateful workflow, not a single autonomous prompt. The user must approve each external or irreversible transition. Prefer the existing skills for phase work; this skill owns sequencing, state, approvals, and recovery.

## Entry Contract

Accept exactly one Linear issue identifier or URL. Resolve the identifier before doing any work. Reject missing, ambiguous, inaccessible, archived, or canceled issues. If a matching workflow run is already active, offer to resume it; an active Linear issue is not itself a conflict.

Create or resume `.scratch/<linear-identifier>/`. This directory is ignored by git and must never be committed. Use the issue identifier, not the issue title, for the directory name.

## Required Preflight

Run these checks before asking the first grill question:

1. Read the repository `AGENTS.md` files, issue-tracker instructions, and relevant project configuration.
2. Confirm Linear access by fetching the complete issue, comments, relations, attachments, and linked documents where available.
3. Confirm the configured tracker and `ready-for-agent` label vocabulary. If setup is missing, stop and direct the user to `/setup-matt-pocock-skills`.
4. Confirm `gh auth status` and repository access before the first grill question.
5. Confirm `treehouse` is installed, initialized, and has an available pool worktree with `treehouse status`. Acquire the lease after preflight; use a durable lease, not an interactive subshell:

   ```text
   treehouse get --lease --json
   ```

   If Treehouse is unavailable or uninitialized, stop. Do not fall back to the current checkout.
6. Confirm the repository has no conflicting active workflow run for this issue. An active Linear issue alone is not a conflict.

If any preflight check fails, record the failure in `state.json` and stop before making external changes.

## State And Artifacts

Maintain `state.json` in the issue directory. Keep it small, explicit, and updated immediately after each successful transition. At minimum it contains:

```json
{
  "issue": "ENG-123",
  "issueUrl": "https://linear.app/...",
  "runId": "generated-id",
  "phase": "intake",
  "worktree": "/absolute/path",
  "treehouseLease": "lease-metadata",
  "branch": "agent/ENG-123-short-slug",
  "baseSha": "commit-sha",
  "approvals": [],
  "linearTickets": [],
  "pullRequest": null
}
```

Allowed phases are:

```text
intake
context
grilling
spec-draft
spec-approved
tickets-draft
tickets-approved
implementation
verification
review
pr-ready
completed
blocked
```

Store these artifacts as they are produced:

```text
context.md
grill.md
spec.md
tickets/<number>-<slug>.md
implementation.md
review.md
```

An approval records the phase, timestamp, decision, artifact path, and artifact checksum or version. Artifact existence is never approval.

## Worktree And Branch

Acquire a Treehouse worktree after preflight and before context exploration. From that worktree:

1. Resolve the repository default branch.
2. Capture its commit SHA as `baseSha` before any implementation changes.
3. Create `agent/<linear-identifier>-<short-slug>`.
4. Record both branch and SHA in state.

If a matching state directory exists, offer to resume it. If a branch or state belongs to another issue/run, stop. Never reset, delete, stash, overwrite, or force-push existing work.

Different issues may run concurrently, but only one active run may exist for a given issue. Never share worktrees.

## Phase 1: Context

Delegate a read-only repository exploration to a fresh context. Give it the full issue and repository instructions. Ask it to identify:

- Relevant modules and tests
- Existing domain vocabulary, ADRs, and conventions
- The highest useful testing seam
- Only the codebase facts needed by the grill

It must not edit files, publish tracker changes, or propose a complete implementation. Save its concise result as `context.md`.

## Phase 2: Grill

Run `grill-me`, which starts the `grilling` session. The grill receives:

- The full Linear issue and relevant comments/relations
- `context.md`
- Relevant repository instructions and domain terminology

The grill asks one decision question at a time and gives a recommendation with each question. It must not edit code or publish tracker changes. Continue until shared understanding is reached. Save the transcript and decisions as `grill.md`.

Do not preload an implementation plan. The purpose of this phase is to resolve requirements, constraints, and decisions without biasing the user toward an assumed design.

## Phase 3: Specification

Delegate `to-spec` to a fresh context with the issue, `grill.md`, `context.md`, and repository context.

The agent must first propose the highest useful test seam. Present the seam to the user and wait for confirmation. Then present the complete spec draft and wait for approval. Do not publish before both approvals exist.

After approval, publish the spec to Linear using `to-spec`, apply `ready-for-agent`, verify the returned issue reference, and record it in state. Save the published content as `spec.md`.

## Phase 4: Ticket Decision

Use this heuristic to decide whether decomposition is warranted:

- More than one independently demoable vertical slice exists.
- The work spans multiple independently reviewable areas.
- One slice blocks another.
- A slice cannot fit one fresh implementation context.
- The spec contains distinct user outcomes that can ship independently.

Do not split a single narrow vertical slice or a mechanical refactor unless expand-contract sequencing is required.

If the heuristic says no, record `ticketDecision: skipped` in state and continue after implementation approval. Do not use `tickets-skipped` as a phase. If it says yes, delegate `to-tickets` to a fresh context with the approved spec. Show the proposed vertical slices, granularity, and blocking edges. Wait for user approval. Publish approved tickets in dependency order, verify every identifier, and record them in state. Never close or modify the parent issue.

## Phase 5: Implementation

Before implementation, ask for explicit approval. Delegate `implement` to a fresh context with the approved spec, approved tickets, context artifact, and worktree path.

Implement tickets sequentially on the one feature branch, in dependency order. Commit each completed ticket separately using:

```text
<linear-identifier>: <ticket title>
```

At ticket start, update its Linear state. At successful completion, update its state only after acceptance criteria and tests pass. Add a concise blocker comment and stop if work cannot proceed. Never mark work complete merely because a commit exists.

## Phase 6: Verification

Run the repository-defined checks:

- Targeted tests and typechecks while implementing
- Full test suite after implementation
- Lint/build checks where configured
- Visual regression only through the Docker-backed command required by repository instructions

Never run visual regression outside Docker. If Docker is unavailable or the Docker-backed command fails because Docker is unavailable, stop and ask the user to start or repair Docker. Do not run an equivalent local visual test or silently skip it. Never run snapshot updates without explicit user permission. Record commands, results, and residual risks in `implementation.md`. Any failed required check blocks review.

## Phase 7: Review

Delegate `code-review` to a fresh context. Review exactly `git diff <baseSha>...HEAD` and pass the approved spec or its Linear reference. The review must keep Standards and Spec findings separate.

Classify every review finding as blocking or non-blocking. Blocking findings include correctness, security, data-loss, spec-compliance, failed verification, and any other material risk. Non-blocking findings include subjective style or smell judgements that do not affect behavior. The PR is blocked until every blocking finding is fixed or explicitly accepted by the user, and every non-blocking finding has an explicit user disposition. Record the classification, disposition, and complete review as `review.md`.

## Phase 8: Draft PR

After review and verification pass, show the final diff summary, commit list, checks, review findings, and PR body. Require explicit final approval.

Before pushing, verify the remote, repository, branch, and clean intended worktree. Push without force and create a draft PR with `gh`. Use:

- Title: `<linear-identifier>: <issue title>`
- Body: issue link, summary, generated ticket links, tests, review result, and known risks

Record and verify the PR URL before setting `completed`. Never merge automatically. Do not mark the PR ready for review automatically.

## Recovery And Idempotency

Resume only from persisted state belonging to the same issue and run. On every resume, re-fetch the Linear issue and all recorded spec/ticket identifiers, compare their current state with local state, and stop for user reconciliation if anything was externally edited or removed. Before every external creation, search by stored identifier and deterministic title. If an action partially succeeds, record the returned identifier immediately and reconcile it on retry. Never blindly duplicate Linear issues, tickets, branches, or PRs.

If state is inconsistent, set `blocked`, explain the inconsistency, and offer only explicit repair choices. Support restarting from a named phase only after confirmation; preserve all previous artifacts.

When complete or explicitly abandoned, return the Treehouse lease safely. Do not destroy the worktree while a PR or unresolved recovery state still needs it.
