# Ledgernomix (nomDAO)

Ledgernomix is a game of political economy, played on a
blockchain, with real cryptocurrency.

Play with your friends in real time, like a board game, or
over a longer time, like correspondence chess. Either way,
you'll need a minimum of 3 players, or ideally between 4
and 7.

Each game of Ledgernomix is a distributed autonomous
organisation, or DAO, governed by a contract that exists
on the blockchain. You can also think of it as a
self-contained model economy and model parliament, with
you and your friends as the members.

Ledgernomix is influenced by Peter Suber's game Nomic (1982) and Lizzie
Magie's The Landlord's Game (AKA Monopoly). While it is intended to
actually work as a game, it's also an art project about the potentials
and pitfalls of decentralised systems.

## Backend

Start Ganache blockchain

```
yarn deploy
```

## Frontend

```
yarn start
```

After running these you can now use the game in the browser at `http://localhost:3000`

## Testing

```
cd backend
yarn test
```

## Deployment

Set the `XDAI_PRIVATE_KEY` environment variable to the private key of the Gnosis chain account you want to use

Run
```
yarn deploy:mainnet
```
