# Ledgernomix (nomDAO)

Ledgernomix is a game based on Nomic games where players can change the rules to win the game. In our version the rules are based around changing numerical values, mostly based on token redistribution per turn. The turns are based around proposals - any player can make a proposal to change the rules, when the proposal is complete, the game moves on by one turn. When the number of proposals reaches the max, the game ends are and the tokens are divided up between the players.

Future ideas include turning each game into a token backed economy so players are able to buy into games they think are running well, and cash out if they want to leave. Because each game would be a separate token, players can choose to have fair redistribution and inflation or a more competitive, non-inflationary set of rules.

## Frontend

```
cd app
yarn
yarn start
```

## Backend

```
cd backend
yarn
npx hardhat node
# open up a new tab
npx hardhat run scripts/deploy.js --network localhost # deploys the contract to your local hardhat network
```

After running these you can now use the game in the browser at `http://localhost:3000`

## Testing

```
cd backend
yarn test
```
