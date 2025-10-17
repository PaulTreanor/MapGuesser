# Multiplayer Service API
The multiplayer service provides endpoints for creating and joining multiplayer games.

## API Endpoints

### GET /health
Simple health check endpoint that returns a status response.

**Response:**
```json
{
  "status": "ok"
}
```

### POST /create-game
Creates a new multiplayer game. Requires authentication via Clerk.

**Authentication:** Required (Clerk JWT token in `Authorization` header)

**Request Body:**
```json
{
  "timer": 60000
}
```

**Response:**
```json
{
  "gameCode": "ABC123",
  "timer": 60000,
  "gameOwnerId": "user_123"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token

### GET /join-game/:code
Resolves room data from a join code.

**URL Parameters:**
- `code`: The 6-character game code (case-insensitive, automatically uppercased)

**Response:**
```json
{
  "roomId": "ABC123",
  "status": "...",
  "expiresAt": "...",
  "wsUrl": "...",
  "gameOwnerId": "user_12345678"
}
```


## Development

**Add env vars**

Create `.dev.vars` file in multiplayer-service directory root. Add keys:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Run service**
```bash
npm install
npm run dev
# available at http://localhost:8788
```

## Deployment 

**Add env vars to Cloudflare**

Run these commands and add the keys:
```bash
wrangler secret put CLERK_PUBLISHABLE_KEY
wrangler secret put CLERK_SECRET_KEY
```

**Deploy service**
```bash
npm run deploy
```

