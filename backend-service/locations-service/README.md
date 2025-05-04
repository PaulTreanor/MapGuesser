# Locations Service API

The Locations Service provides endpoints for retrieving location data for the MapGuesser application.

## API Endpoints

### GET /health
Simple health check endpoint that returns a status response.

### GET /locations
Returns all available locations in the database.

### GET /locations/random
Returns random locations from the database.

Query Parameters:
- `count`: Number of random locations to return (default: 1)

## Development

```txt
npm install
npm run dev
```

## Deployment

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
