# Ledgernomix

This is a work in progress - the app is shifting so may not run correctly

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
