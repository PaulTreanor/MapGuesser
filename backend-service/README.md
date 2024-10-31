# Backend Service

## Deployment
### Sans Docker
```bash
npm install
npm start
# server is running on port: 3000 (default)
```
### With Docker
`cd backend-service/`

`docker build -t mapguesser_api:latest .`

`docker run -d --rm -p 3000:3000 --name api mapguesser_api:latest`

#### Notes
- `-d` will run the container detached
- `--rm` will remove the container once it's stopped (waste not want not)
- Specifying `--name api` is important for CD: the GitHub Actions workflow specifically uses this name to stop the currently running container before starting rebuilding and starting the new one
