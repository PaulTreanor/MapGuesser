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

```bash
npm install
npm run dev
# available at http://localhost:8787
```

## Database

This service uses Cloudflare D1, a serverless SQL database that runs at the edge.

### Database Schema

The database has a single table called `locations` with the following structure:

```sql
CREATE TABLE locations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	location TEXT NOT NULL,
	latitude REAL NOT NULL,
	longitude REAL NOT NULL,
	difficulty TEXT,
	continent TEXT
);
```

### Migrations

Migrations are stored in the `migrations/` directory with numbered filenames (ie. `0000_initial.sql`).

To apply migrations:

```bash
# Apply migrations to local development database
wrangler d1 migrations apply locations-db

# Apply migrations to production database
wrangler d1 migrations apply locations-db --remote
```

### Seeding the Database

The initial location data is stored in `data/initial-locations.json` and can be loaded into the database using the seeding scripts. These convert the JSON data into SQL statements and execute them against the D1 database.

To seed the database:

```bash
# Generate seed SQL and seed the local database
npm run seed

# Generate seed SQL and seed the remote (production) database
npm run seed:remote
```

### Verifying Database Data

You can verify the database has been correctly seeded by running queries:

```bash
# Check count of records in local database
wrangler d1 execute locations-db --local --command="SELECT COUNT(*) FROM locations"

# View sample data from local database
wrangler d1 execute locations-db --local --command="SELECT * FROM locations LIMIT 5"

# Same commands for remote database (add --remote flag)
wrangler d1 execute locations-db --remote --command="SELECT COUNT(*) FROM locations"
```

### Local vs Remote Development

- Local development uses a SQLite database on your machine
- Production uses the actual Cloudflare D1 database
- Always test with local database first before applying changes to remote

## Testing

Tests use Vitest and are in the `src/tests`.

```bash
npm test
```

## Deployment

```bash
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```bash
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
