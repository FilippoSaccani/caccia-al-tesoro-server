# Treasure Hunt

## Project Description

Treasure Hunt is an interactive server-based game where players, organized in teams, search for hidden treasures on a virtual playing field. Each team must dig at different coordinates to find treasures, earning points for each discovery and losing points for unsuccessful attempts.

## Installation

Before starting the game, make sure to install all necessary dependencies:

```bash
npm install
```

## Starting the Game

To start the game, run the following command:

```bash
npm start
```

## Gameplay

### Rules & Scoring

- Sign up, search, and find all the treasures.
- Delay between digs = 2000ms
- Digging in a non-treasure cell -> 0 points
- Finding a treasure -> +100 points
- Digging in an already dug cell -> -10 points
- Digging outside the map -> Coordinate error

### API Interface

- `/signup?team=...&password=...` to register your team
- `/dig?team=...&password=...&x=...&y=...` to dig at coordinates x, y
- `/map` to view the map
- `/leaderboard` to view the leaderboard
- `/displayMap` to view the map as an HTML page

## Development Mode

To run the game in development mode, use:

```bash
npm run dev
```

## How to Play

### Interacting with the Game

To participate, each team must register via the `/signup` endpoint. After registration, teams can start searching for treasures using the `/dig` endpoint, indicating the coordinates where they wish to dig. The game map can be viewed through the `/map` endpoint, and the current leaderboard is available at the `/leaderboard` endpoint.
