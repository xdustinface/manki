# Changelog

All notable changes to Manki will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Live-updating dashboard progress comment during reviews
- Review event body with summary and collapsed stats
- AI-generated review summary with text dashboard
- Auto-detect GitHub App installation and use app token
- `/manki` and `@manki-labs` command prefixes
- Token service authentication with GitHub Actions OIDC
- Judge validates PR scope and flags unrelated file changes
- Action always exits 0; event filtering moved inside

### Changed

- Redesigned nit issue formatting with collapsible details and GitHub permalinks
- Progress comment refactored into frozen audit log with review metadata
- Clean inline finding comments with structured AI context
- Restyled all command responses with Manki branding
- Silent auto-approve with no visible message body
- Triage-created issues use minimal format
- Default `models.reviewer` to Sonnet, `models.judge` to Opus
- Bumped `max_diff_lines` from 10k to 50k
- README overhaul with logo and updated features
- Removed blockquote from review summary
- Added codecov.yml informational config

### Fixed

- Removed `DEFAULT_REVIEWERS` — `AGENT_POOL` is single source of truth
- Team size label shows actual agent count
- Code fences in nit issues render at column 0
- Post-judge dedup pass for duplicate findings
- Loosened judge required severity bar and added memory
- Serialized concurrent `ensureCLI` calls
- Triage parser matches new details format
- `isReviewRequest` and `hasBotMention` support all prefixes
- Token service used for installation lookup

## [3.1.0] - 2026-03-25

### Added

- Extended thinking for judge agent
- Full file content as reviewer context
- PR context (title, description, base branch) in prompts
- Memory context (learnings, suppressions) for reviewers
- Resolve `@rules/` references in `CLAUDE.md`
- Pre-filter suppressions before judge
- Code coverage with Codecov
- Severity examples in prompts
- Auto-resolve stale threads after force-push
- Check suppressions in recap dedup
- Linked issue context in prompts
- `@manki forget` command
- Subdirectory `CLAUDE.md` files
- Multi-pass review verification

### Changed

- Default reviewer to Sonnet, judge to Opus
- Renamed nit issues to "triage: findings from PR #N"

### Fixed

- Judge merges duplicate findings
- Prevent duplicate findings via resolved thread dedup

## [3.0.0] - 2026-03-25

### Added

- Dynamic review teams (3/5/7 agents scaled by diff size)
- Judge agent with prompt, parser, and context curation
- 4-tier severity system (required/suggestion/nit/ignore)
- Per-stage model selection (`models.reviewer` / `models.judge`)
- `nit_handling` config (issues vs comments)
- Triage acceptance pattern tracking and auto-escalation
- AGPL-3.0 license

### Changed

- README rewrite and SETUP.md update

### Fixed

- `COMMENT` fallback drops inline comments
- Graceful fallback without `github_token`

## [2.4.0] - 2026-03-24

### Added

- `@manki triage` command for nit issue processing
- Richer nit issues with code snippets and fix prompts

### Fixed

- Renamed `need-human` to `needs-human` label

## [2.3.0] - 2026-03-24

### Added

- `@manki check` command and auto-approve on thread resolution

## [2.2.0] - 2026-03-24

### Added

- Collapsible suggested fixes and AI agent prompts in comments

## [2.1.0] - 2026-03-24

### Changed

- Stripped backwards compatibility, rewrote README with Manki personality

### Fixed

- Consolidation fallback, JSON extraction, and warning annotations

## [2.0.0] - 2026-03-24

### Added

- Rebranded from claude-review to Manki
- `@claude remember` command to teach the reviewer

## [1.2.0] - 2026-03-24

### Added

- Emoji reactions to acknowledge triggers

### Fixed

- Cancel in-progress review runs on PR update

## [1.1.0] - 2026-03-24

### Added

- Memory write path (patterns, suppressions, learnings)
- GitHub App identity support
- Review recap phase (dedup, track resolved)
- Conversation lifecycle (auto-approve, reply handling)
- Nit issues with `needs-human` label
- SETUP.md installation guide

### Fixed

- Auto-resolve addressed findings with validation
- Consolidation failure returns `COMMENT` not `APPROVE`

## [1.0.0] - 2026-03-24

### Added

- Initial release: multi-agent Claude Code PR review
- Specialist reviewer agents
- Basic review posting with inline comments
- Configuration via `.manki.yml`

[Unreleased]: https://github.com/xdustinface/manki/compare/v3.1.0...HEAD
[3.1.0]: https://github.com/xdustinface/manki/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/xdustinface/manki/compare/v2.4.0...v3.0.0
[2.4.0]: https://github.com/xdustinface/manki/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/xdustinface/manki/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/xdustinface/manki/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/xdustinface/manki/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/xdustinface/manki/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/xdustinface/manki/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/xdustinface/manki/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/xdustinface/manki/releases/tag/v1.0.0
