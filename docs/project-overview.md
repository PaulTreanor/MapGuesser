# Project overview 

## Other docs files 
../CLAUDE.md - general technical guidelines

## Project description

MapGuesser is a multiplayer browser session game where players are prompted with a location which they have to find on a map. Each game has a certain number of rounds, so for a given game players might have to find London, Paris, Istanbul, Galway, and Palermo on a map. 

## Current status
Currently the frontend part of the project is developed to the point where it is an OK single player game but there is currently no backend. 

## Tech stack 
- Frontend: React, Gatsby, MapBox, TailwindCSS, (in process of moving custom components to ShadCN but currently using custom components). Vitest, React testing library, Playwright
- Locations servce: Cloudflare workers, Hono