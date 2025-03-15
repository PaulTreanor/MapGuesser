# Backend Service

## Deployment
### Sans Docker
```bash
npm install
npm start
# server is running on port: 3000 (default)
```
### With Docker (Compose)

From the root folder:
```bash
docker compose up --build -d
```

This will create containers for both the reverse proxy (nginx), and the backend service.

Nginx is listening on port 80 and at the `/api` prefix.

So `curl localhost/api/health` will return "Ok"

and `docker compose down` when you're done
