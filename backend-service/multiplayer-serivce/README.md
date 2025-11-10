# Multiplayer Service API
The multiplayer service provides endpoints for creating and joining multiplayer games.

The service consists of a Workers REST API that can spin a Durable Object for each game instance. The Durable Objects use websockets to connect to each player in a game.

## Architecture

**Game Registry (D1 Database)**
- Tracks legitimately created games in the `games` table
- Prevents users from creating games via arbitrary join URLs
- Games are registered when created via `/create-game`
- Join attempts validate against registry (returns 404 if game doesn't exist) 

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
Creates a new multiplayer game. The client supplies the host identity so the creator can be marked as the lobby host.

**Request Body:**
```json
{
  "timer": 60000,
  "hostId": "guest_123456"
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

- `400 Bad Request`: Missing `hostId`

### GET /join-game/:code
Resolves room data from a join code. Validates that the game exists in the registry.

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

**Error Responses:**
- `404 Not Found`: Game code not found in registry (game doesn't exist or expired)

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

**Run service**
```bash
npm install
npm run dev
# available at http://localhost:8788
```

**Database**

You can't do anything locally with a D1 DB until you have a `database_id` in `wranger.json` so run this first:

```bash
npx wrangler d1 create mapguesser-game-registry
```

Then apply migrations: 
```bash
npx wrangler --config wrangler.json d1 migrations apply mapguesser_game_registry --local 
npx wrangler --config wrangler.json d1 migrations apply mapguesser_game_registry --remote
```

Then deploy: 
```bash
npx wrangler deploy
```

## Deployment

**Deploy service**
```bash
npm run deploy
```

