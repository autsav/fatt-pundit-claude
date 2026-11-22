# Efficient Development Rules

- Minimise token usage without compromising correctness.
- Inspect relevant files before editing. Avoid full-repository scans unless necessary.
- Use targeted search rather than reading entire large files.
- Reuse existing components, utilities and patterns.
- Keep changes within the requested scope.
- Avoid spawning subagents for simple work.
- Do not run unrelated tests or repeated audits.
- Summarise long logs and report actionable errors.
- Use the smallest sufficient implementation.
- Preserve security, accessibility and existing functionality.
- After implementation, report only:
  1. Files changed
  2. What changed
  3. Tests run and results
  4. Remaining issues
- Never skip essential verification to save tokens.

# Session setup

- Run npm run verify, not the individual checks.
- Use the site-map skill instead of scanning src/.
- Do not read tasks/archive or docs/redesign unless asked.
- Compact instructions: keep code changes and failing check output.
- Use a subagent only for full test runs, log reading or wide searches.

## Orchestration
The main session plans, delegates and reviews. It does not do the work.
1. Break the task into steps. For each, pick the cheapest agent that fits:
   finder (locate) → editor (small specified edit) → builder (real
   building) → runner (checks).
2. Give each agent a complete brief: exact files, the change, the pattern
   file, what to reply. Agents start with no memory of this conversation.
3. Run independent steps in parallel; dependent steps in order.
4. Review the agents' diff with `git diff`, not by re-reading whole files.
5. Do it yourself only when: the step needs a design decision, spans many
   files that must change together, or an agent failed the same step twice.
6. Never delegate a one-line change you already have open; just make it.
7. Before committing src/ changes, run reviewer once on the diff. Fix real
   gaps; ignore the rest.
