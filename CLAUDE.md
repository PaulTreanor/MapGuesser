# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Development: `cd frontend-service && npm run dev` or `npm run start`
- Production build: `cd frontend-service && npm run build`
- Serve build: `cd frontend-service && npm run serve`

## Test Commands
Prefer running unit tests because `npm run test` and playwright tests require local dev env to be running. 

- Run unit tests: `cd frontend-service && npm run test:components` 
- Run single unit test: `cd frontend-service && npx vitest -t "test name pattern"`
- Run e2e tests: `cd frontend-service && npx playwright test`
- Run single e2e test: `cd frontend-service && npx playwright test game-run-through.test.ts`

## Type Check Commands
- Type check: `cd frontend-service && npm run typecheck`

## JavaScript/TypeScript Guidelines

### Programming Style
- Avoid using classes, prefer more functional code
- Prefer immutable variables (`const` over `let`)
- Use higher-order functions (`map`, `filter`, `reduce`, `forEach`) instead of `for` loops
- Always use strict equality (`===`)
- Limit line length to around 100 characters
- Always terminate statements with a semicolon (`;`)

### Naming & Comments
- Constants: `ALL_CAPS`
- Functions: start with a verb (e.g. `generateRoundEndTimeStamp()`)
- Boolean state: prefix with verbs (`isLoading`, `hasError`)
- Event handlers: prefix with `on` (e.g. `onSubmitButtonClick`)
- File & directory names: `camelCase` for utilities, `PascalCase` for components
- Comments: Only add if a reasonably competent junior engineer can't understand the code immediately

### Formatting
- Use tabs, not spaces
- Include trailing commas in multi-line objects/arrays
- Wrap long expressions rather than extending past 100 chars

### TypeScript Specific
- Use TypeScript with strict types and proper interfaces in dedicated types/ folders
- Use TS in new files: `.ts` and `.tsx`
- Avoid `any` or `unknown` unless absolutely necessary
- Avoid `enum`; use `const` objects or maps instead

## React Guidelines

### Component Structure
- React components use functional style with hooks
- Separate individual components into separate files
- Follow project structure: components/, utils/, objects/, hooks/ directories
- Import order: React, libraries, local imports

### Component Typing
- Do not use the `React.FC` type for components
- Type props at the parameter level:

```ts
type ComponentProps = { text: string }

const MyComponent = ({ text }: ComponentProps) => {
	// rest of component 
}
```

### Event Handlers
- Event handlers: prefix with `on` (e.g. `onSubmitButtonClick`)

## Styling
- Never use inline styles
- Use TailwindCSS to specify styles
- Use TailwindCSS in a clean well-structured idiomatic way (utilize CSS variables found in global.css)
- Pay attention to frontend-service/docs for more styling information

## Testing 
- All components and utils files must have a corresponding test file in the src/tests directory
- Tests are written in vitest for frontend and backend
- Components are tested with vitest and React Testing Library
- Use `try`/`catch` blocks for all asynchronous operations

## Backend Services 
- When possible write code in a module testable way
- When possible write code in a way that lends itself to being run locally quite easily