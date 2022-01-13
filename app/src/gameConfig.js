export const gameConfig = {
  cryptoEntryFee: 5,
  startBalance: 1000,
  cryptocurrency: "xDAI",
  gameCurrency: "pts",
  networks: {
    gnosis: {
      networkId: 100,
      params: {
        chainId: "0x64", // A 0x-prefixed hexadecimal string
        chainName: "Gnosis Chain",
        nativeCurrency: {
          name: "xDai",
          symbol: "xDai", // 2-6 characters long
          decimals: 18,
        },
        rpcUrls: ["https://rpc.xdaichain.com/"],
        blockExplorerUrls: ["https://blockscout.com/xdai/mainnet/"],
      },
    },
    local: {
      networkId: 5777,
      params: {
        chainId: "0x539", // A 0x-prefixed hexadecimal string
        chainName: "Local Chain",
        nativeCurrency: {
          name: "LOCAL",
          symbol: "LOCAL", // 2-6 characters long
          decimals: 18,
        },
        rpcUrls: ["https://127.0.0.1:7545"],
      },
    },
  },
};
