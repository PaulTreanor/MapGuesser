# Multiplayer Service API
The multiplayer service provides endpoints for creating and joining multiplayer games. 

## Development
```bash
npm install
npm run dev
# available at http://localhost:8788
```


## Deployment 
```bash
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
