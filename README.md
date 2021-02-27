# Ledgernomix

Ledgernomix is a game based on Nomic games where players can change the rules to win the game. In our version the rules are based around changing numerical values, mostly based on token redistribution per turn. The turns are based around proposals - any player can make a proposal to change the rules, when the proposal is complete, the game moves on by one turn. When the number of proposals reaches the max, the game ends are and the tokens are divided up between the players.

Future ideas include turning each game into a token backed economy so players are able to buy into games they think are running well, and cash out if they want to leave. Because each game would be a separate token, players can choose to have fair redistribution and inflation or a more competitive, non-inflationary set of rules.

Current designs
![image](https://user-images.githubusercontent.com/4549380/109387130-69aaf980-78f7-11eb-88a9-c149e2223c45.png)


This is a work in progress - the code is changing a lot so the instructions may become out of date.

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
