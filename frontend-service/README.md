# Frontend Service

The frontend is written in TypeScript using Gatsby. Styling is done with TailwindCSS and the map uses Mapbox. 

Testing uses Vitest, React Testing Library, and Playwright. 

# Running locally

### Setup environment
- Create/update the following environment files:
  - `.env.development` - For development with deployed backend APIs
  - `.env.local` - For development with local backend APIs
- Required environment variables:
  - `GATSBY_MAPBOX_ACCESS_TOKEN` - MapBox public key
  - `GATSBY_API_URL` - Base URL for backend APIs

### Install dependencies and run local server

#### Development with deployed backend
```bash
npm install
npm run dev
# local server running on http://localhost:8000, using deployed backend
```

#### Development with local backend
```bash
npm install
npm run dev:local
# local server running on http://localhost:8000, using local backend at http://localhost:8787
```

Make sure your backend services are running:
```bash
cd ../backend-service/locations-service
npm run dev
# API runs on http://localhost:8787
```

### Issues
Deleting the Gatsby `./cache` directory helps with occasional local dev hiccups

# Components and Styling

See the [Components Documentation](./docs/components.md) for information on UI components and the [Style Guide](./docs/style-guide.md) for design patterns.

# Running tests
There are component/unit tests (RTL and Vitest) and E2E tests with Playwright. 

### Run all tests
```
npm run test
```

### Run only component and unit tests
```
npx vitest
```

### Run only E2E tests
```
npx playwright test

# Run in headed mode (for debugging)
npx playwright test --headed
```

# Custom helpers in codebase

### Data fetching 
- Use the `useFetch()` hook in `src/hooks/useFetch.ts` to fetch data. It's basically a simpler version of Tanstack Query.

### Environment Configuration
- The application uses environment-specific configuration via:
  - `.env.development` - Default development environment (deployed backend)
  - `.env.local` - Local development environment (local backend)
  - `.env.production` - Production environment
- API endpoints are defined in `src/objects/endpoints.ts` and automatically use the correct base URL
- Environment switching is controlled via the `GATSBY_ACTIVE_ENV` variable in npm scripts

