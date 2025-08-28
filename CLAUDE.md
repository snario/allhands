# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Apps Script project that generates all-hands meeting slides from Linear initiatives and manages project communications via email. The project integrates with Linear's GraphQL API and Google Slides to automate slide creation and project status updates.

## Development Commands

### Essential Commands
- `npm run build` - Complete build pipeline: lint, test, clean, bundle, and copy appsscript.json
- `npm run push` - Build and deploy to Google Apps Script using clasp
- `npm run lint` - Run ESLint with auto-fix and Prettier formatting
- `npm run test` - Run Jest tests (currently configured with --passWithNoTests)
- `npm run bundle` - Bundle source code using Rollup (no tree-shaking)
- `npm run clean` - Remove dist directory

### Testing
- Test files should follow the pattern: `(src/.+(\\.|/)(test|spec))\\.(jsx?|tsx?)$`
- Tests are run with Jest and ts-jest transformer

## Architecture

### Build System
- **Bundler**: Rollup with TypeScript, configured to bundle everything into a single file for Google Apps Script
- **Deployment**: Uses `clasp` to push bundled code to Google Apps Script
- **Target**: ES2020 with Google Apps Script APIs

### Core Structure
```
src/
├── index.ts              # Entry point with Google Apps Script menu setup
├── scripts/              # Main executable functions (called from GAS UI)
│   ├── email/           # Email automation scripts
│   └── slides/          # Slide generation and updates
├── lib/                 # Core libraries and utilities
│   ├── linear.ts        # Linear GraphQL API integration
│   ├── googleSlides.ts  # Google Slides API wrapper
│   ├── markdown.ts      # Markdown to Slides conversion
│   ├── emoji.ts         # Slack emoji to Unicode conversion
│   └── formatting.ts    # Text styling utilities
└── external/            # Vendored dependencies
    └── secretService.ts # Secret management for GAS
```

### Key Integration Points
- **Linear API**: GraphQL queries for project data and initiatives
- **Google Slides API**: Slide creation, text box insertion, and image handling
- **Google Apps Script Properties**: Used for configuration persistence and caching
- **Email Service**: Automated notifications to project leads

### Configuration System
- Configuration schema defined in `configSchema.json`
- Settings stored using Google Apps Script document properties
- HTML dialog for user configuration (`config.html`)
- Options include assignee pictures, project slides, and agenda slides

### Data Flow
1. Linear initiatives are fetched via GraphQL
2. Data is processed and formatted with emoji/markdown support
3. Slides are generated using Google Slides API
4. Project leads receive email notifications
5. Configuration and cache data stored in GAS properties

## Google Apps Script Specifics

- Functions exported in `Scripts` object for GAS runtime
- `onOpen()` and `onInstall()` handlers for add-on lifecycle
- All functions must be declared with `// eslint-disable-next-line @typescript-eslint/no-unused-vars`
- Single bundled output file deployed as `index.gs`