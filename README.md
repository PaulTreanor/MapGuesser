# Mapguesser.com 

[mapguesser.com](https://www.mapguesser.com/) is a game where you are asked to show exactly where a place is on a map. 

Scores are based on how far your guess is from the city's real location, so lower scores are better. There is 5 rounds per game and you want your final score as close to 0 as possible, like golf.


## Running locally
Running frontend locally: [Frontend README.md](./frontend-service/README.md)

Running locations service Locally: [Locations Service README.md](./backend-service/locations-service/README.md)

## Setting up git hooks 
The pre-commit test hook is in the `./githooks/pre-commit` file.

### Add the pre-commit hook
```bash
cp ./githooks/pre-commit ./.git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit
```
