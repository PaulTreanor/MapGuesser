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

## Code Style Guidelines
- Use TypeScript with strict types and proper interfaces in dedicated types/ folders
- React components use functional style with hooks
- Follow project structure: components/, utils/, objects/, hooks/ directories
- Component naming: PascalCase (Game.tsx); utilities: camelCase (gameUtils.ts)
- Import order: React, libraries, local imports
- Test all components with proper mocking strategy 

## General JS/TS coding guidelines
- Prefer immutable code (const, not let) 
- Use ALL_CAPS naming convention for constants
- Don't add comments to a piece of code if a reasonably competant junior engineer could just read the code and understand what it does. If a piece of code is not obvious then add a comment
- Use tabs, not spaces

## Backend services 
- When possible write code in a module testable way
- When possible write code in a way that lends itself to being run locally quite easily

## React
- In general seperate individual components into separate files 
- For TS React components add types in this style: 

```ts
const myComponent = ({
	myProperty
}): {
	myProperty: type
} => {
	// rest of component 
}
```

## Styling
- Never use inline styles
- Use TailwindCSS to specify styles
- Use TailwindCSS in a clean well-structured idiomatic way. ie. utilise CSS variables found in global.css
- pay attention to frontend-service/docs for more styling information

## Testing 
- All components and utils files must have a corresponding test file in the src/tests directory. 
- Tests are written in vitest for frontend and backend
- Components are tested with vitest and React Testing Library