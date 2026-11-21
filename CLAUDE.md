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
