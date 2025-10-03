# Multiplayer Service API
The multiplayer service provides endpoints for creating and joining multiplayer games. 

# Development

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

# Deployment 

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

