# Multiplayer Service API
The multiplayer service provides endpoints for creating and joining multiplayer games.

The service consists of a Workers REST API that can spin a Durable Object for each game instance. The Durable Objects use websockets to connect to each player in a game. 

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

### GET /ws/:gameCode
WebSocket endpoint for connecting to a game room. Upgrades the HTTP connection to a WebSocket and forwards it to the appropriate GameRoom Durable Object.

**URL Parameters:**
- `gameCode`: The 6-character game code (case-insensitive, automatically uppercased)

**Connection:**
```javascript
const ws = new WebSocket('wss://service-domain.com/ws/ABC123');
```

**Initial Response:**
Upon successful connection, the server immediately sends a welcome message:
```json
{
  "type": "connected",
  "message": "Connected to game room",
  "timestamp": 1234567890
}
```

**Sending Messages:**
After connecting, clients should send a `player_join` message to register:
```json
{
  "type": "player_join",
  "playerId": "user_123",
  "playerName": "John Doe",
  "isGuest": false
}
```

**Receiving Messages:**
- `players_update`: Broadcast when players join/leave
- `game_starting`: Broadcast when the game begins
- `echo`: Server echoes back unrecognized message types

**Error Responses:**
- `426 Upgrade Required`: Request was not a WebSocket upgrade request
- `400 Bad Request`: Missing game code parameter


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

