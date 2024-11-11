# Workflows
## Backend-Service Continuous Deployment Workflow
This presumes the service is already running on your server on a docker compose network (see: <a href="../../backend-service/README.md">../../backend-service.README.md</a>)
### Only runs on closed pull requests to main that affect `/backend-service`
- can also be ran manually by `workflow_dispatch:` (useful for testing)
```yaml
on:
  pull_request:
    types: [closed]
    branches:
      - main
    paths:
      - 'backend-service/**'
  workflow_dispatch:
```

### GitHub Actions Boilerplate Checkout and Copy SSH Keys
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Rebuild and deploy backend container
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        SSH_HOST: ${{ secrets.SSH_HOST }}
        SSH_USER: ${{ secrets.SSH_USER }}
```

### Blue-Green Deployment SSH Steps
- copy SSH details from repository secrets
```yaml
      run: |
        echo "$SSH_PRIVATE_KEY" | tr -d '\r' > id_rsa
        chmod 600 id_rsa
        ssh -o StrictHostKeyChecking=no -i id_rsa $SSH_USER@$SSH_HOST << 'EOF'
```
- pull updated repo and stop the `backend-service-green` container
```yaml
          cd MapGuesser/
          git pull origin main
          docker compose stop backend-service-green
```
- rebuild `backend-service-green` with updated code (`-d` for detached)
```yaml
          docker compose up -d --build backend-service-green
```
- stop `backend-service-blue` container and force reload nginx configuration so it doesn't hang trying to access `backend-service-blue`
```yaml
          docker compose stop backend-service-blue
          docker exec reverse-proxy nginx -s reload
```
- rebuild `backend-service blue` and reload nginx conf again
```yaml
          docker compose up -d --build backend-service-blue
          docker exec reverse-proxy nginx -s reload
        EOF
```