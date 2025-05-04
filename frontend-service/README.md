# Frontend Service

The frontend is written in TypeScript using Gatsby. Styling is done with TailwindCSS and the map uses Mapbox. 

Testing uses Vitest, React Testing Library, and Playwright. 

# Running locally

### Setup environment
- Create `.env.development` file
- Add MapBox public key to `GATSBY_MAPBOX_ACCESS_TOKEN` variable in `.env.development`. 


### Install dependencies and run local server
```bash
npm install
npm run dev
# local server running on http://localhost:8000
```

### Issues
Deleting the Gatsby `./cache` directory helps with occassional local dev hicups

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
- use the `useFetch()` hook in `src/hooks/useFetch.ts` to fetch data. It's basically a simpler version of Tanstack Query. 



