# Contributing to Smasage 🤝

First off, thank you for considering contributing to Smasage! It's people like you that make Smasage such a great tool.

## How Can I Contribute?

### Reporting Bugs

- Check the [issues](https://github.com/your-username/smasage/issues) to see if it has already been reported.
- If not, create a new issue. Clearly describe the bug, include steps to reproduce, and specify your environment.

### Suggesting Enhancements

- Open a new issue with the tag "enhancement".
- Explain the feature and how it would benefit users.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes (`npm test` or `cargo test`).
4. Make sure your code lints.
5. Issue a pull request!

#### Pre-PR Verification Checklist

Before submitting a pull request, verify the following:

- [ ] **Code Quality**
  - [ ] Code follows the project's style guidelines (see Style Guidelines below)
  - [ ] No console.log, debug statements, or commented-out code remains
  - [ ] Variable and function names are clear and descriptive

- [ ] **Testing**
  - [ ] New code includes tests where applicable
  - [ ] All tests pass locally: `npm test` (frontend/agent) or `cargo test` (contracts)
  - [ ] Tests cover the happy path and edge cases

- [ ] **Build & Format**
  - [ ] Frontend code passes linting: `npm run lint` (if configured)
  - [ ] Rust code is formatted: `cargo fmt` and passes `cargo clippy`
  - [ ] No build warnings or errors locally

- [ ] **Dependencies**
  - [ ] No unnecessary dependencies added
  - [ ] lock files (package-lock.json, Cargo.lock) are committed
  - [ ] Dependencies resolve without conflicts

- [ ] **Environment & Security**
  - [ ] No secrets (API keys, tokens) are hardcoded in code
  - [ ] `.env` files are not committed; use `.env.example` for templates
  - [ ] All environment variables used are documented in `.env.example`

- [ ] **Documentation**
  - [ ] README.md is updated if behavior or setup changes
  - [ ] Code comments explain the "why" for non-obvious logic
  - [ ] Commit messages follow the imperative mood ("Add feature", not "Added feature")

- [ ] **Git Hygiene**
  - [ ] Branch is up to date with `main`
  - [ ] Commit history is clean (no accidental merge commits)
  - [ ] PR description clearly explains what changed and why

## Development Setup

### Project Structure

- `/frontend`: Next.js application (TypeScript + Vanilla CSS).
- `/agent`: Node.js backend using OpenClaw.
- `/contracts`: Soroban smart contracts in Rust.

### Environment Variables

All environment variables are documented in [README.md](./README.md#environment-variables). Ensure you have a properly configured `.env` file before running any component locally.

Key points:
- Never commit `.env` files containing secrets to the repository.
- `.env` files are gitignored recursively across the project (`**/.env` and `**/.env.*` patterns).
- Use `.env.example` files as templates for required variables.
- Each component (frontend, agent) can have local `.env.local` overrides for development.

### Branching Policy

- `main`: Production-ready code.
- `development`: Integration branch for features.
- `feature/*`: Specific feature development.

## Style Guidelines

### Code Formatting

- **TypeScript**: We follow standard ESLint configurations.
- **CSS**: Use Vanilla CSS. Focus on maintaining the premium, dark-themed aesthetic.
- **Rust**: Use `cargo fmt` before committing.

### Commit Messages

- Use the imperative mood ("Add feature" not "Added feature").
- Keep the subject line under 50 characters.

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all, regardless of level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

## Questions?

Join our community or open an issue for discussion!
