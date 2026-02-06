# Agent Task — As-Is vs Canonical (v3)

## Inputs (READ ONLY)
- Requirements/CANONICAL.md
- Requirements/CANONICAL.json

## Outputs (WRITE ONLY)
- Agentic AI Work/AgentOutput/requirements_status.jsonl
- Agentic AI Work/AgentOutput/requirements_status.md
- Agentic AI Work/AgentOutput/implemented_not_documented.md
- Agentic AI Work/AgentOutput/progress_report.md

## Non-negotiable rules
- Semantic matching only (match by meaning; do NOT match by requirement id alone).
- No requirement is "Implemented/Tested/Shippable/Launch-ready" without evidence per the runbook and canonical gates.
- If acceptance criteria are missing, propose Given/When/Then and mark the requirement as Blocked (needs acceptance).
- If code implements something not documented: reverse engineer it into CANONICAL.md first, then mark status.

## Deliverable quality bar
- Every canonical requirement must appear exactly once in requirements_status.jsonl (keyed by semantic_key or heading number).
- Milestones must be evaluated and reported when completed.
