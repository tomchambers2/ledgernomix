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

Start the local Hardhat node (replaces Ganache), then deploy contracts:

```
npm run node
```

In a separate terminal:

```
npm run deploy
```

## Frontend

To run against the local Hardhat node:

```
npm run start:local
```

To run against Gnosis mainnet:

```
npm start
```

Open the game in the browser at `http://localhost:3000`

### Local development with MetaMask

When running locally, add a custom network to MetaMask:
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`

Hardhat always uses the same deterministic test accounts. Import any of these private keys into MetaMask:

| Account | Address | Private Key |
|---------|---------|-------------|
| #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| #3 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| #4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |

These are well-known test accounts — never use them on mainnet.

## Testing

```
cd backend
npm test
```

## Deployment

Set the `XDAI_PRIVATE_KEY` environment variable to the private key of the Gnosis chain account you want to use, and run deploy:mainnet

```
XDAI_PRIVATE_KEY=0xyourkey npm run deploy:mainnet
```