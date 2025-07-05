# Agent Instructions for Allhands Project

## Commands
- **Build**: `npm run build` (lint + test + bundle)
- **Lint**: `npm run lint` (ESLint + Prettier)
- **Test**: `npm run test` (Jest, single test: `npm test -- --testNamePattern="test_name"`)
- **Deploy**: `npm run push` (build + deploy to Google Apps Script)

## Architecture
- **Google Apps Script** project using `clasp` for deployment
- **Linear API** integration via GraphQL to fetch initiatives and projects
- **Google Slides** automation for creating project slides
- **Email automation** for project lead notifications
- Main entry: `src/index.ts`, scripts in `src/scripts/`, libs in `src/lib/`

## Code Style
- **TypeScript** with strict mode, target ES2020
- **ESLint** with GTS (Google TypeScript Style) + Prettier
- **Semicolons**: required, **Print width**: 80 chars
- **Imports**: relative paths, GraphQL schemas imported as strings
- **Types**: explicit type definitions for Linear API objects (Initiative, Project, User)
- **Naming**: camelCase for variables/functions, PascalCase for types
- **Error handling**: use try/catch for async operations, log errors to console
