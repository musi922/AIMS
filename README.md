# foerderfinder

SAP CAP (TypeScript) + Fiori Elements application for grant management.

## Getting Started

### Prerequisites

- Node.js >= 22 
- `npm` 
- SAP CDS Development Kit: `npm install -g @sap/cds-dk`

### Installation

```bash
git clone 
cd foerderfinder
npm ci
```

### Generate CDS types

```bash
npm run build:models
```

### Run locally

```bash
npm run watch:local
```

Starts the app locally with SQLite as an in-memory database.

## Build and Test

```bash
npm run build      # cds build
npm run compile    # TypeScript type-check
npm run lint       # ESLint
npm test           # Jest 
```

Minimum coverage target: 80%.

## Contribute

- **Branching:** `feature/<ticket-number>`, `hotfix/<ticket-number>` (GitFlow)
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)

```text
feat: implement grant application service
fix: correct database model for applicants
docs: documentation only changes
style: changes that do not affect the meaning of the code
refactor: a code change that neither fixes a bug nor adds a feature
perf: a code change that improves performance
test: adding missing tests or correcting existing tests
```

- Open a PR against `develop` merges are squashed.
- `npm run lint`, `npm run compile`, and `npm run test` must pass before requesting review.