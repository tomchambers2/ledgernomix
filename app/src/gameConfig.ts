export const gameConfig = {
  cryptoEntryFee: 5.0,
  startBalance: 1000,
  cryptocurrency: "xDAI",
  gameCurrency: "pts",
  networks: {
    gnosis: {
      networkId: 100,
      params: {
        chainId: "0x64", // A 0x-prefixed hexadecimal string
        chainName: "Gnosis",
        nativeCurrency: {
          name: "xDAI",
          symbol: "xDAI", // 2-6 characters long
          decimals: 18,
        },
        rpcUrls: ["https://rpc.gnosischain.com/"],
        blockExplorerUrls: ["https://blockscout.com/xdai/mainnet/"],
      },
    },
    local: {
      networkId: 31337,
      params: {
        chainId: "0x7a69", // A 0x-prefixed hexadecimal string
        chainName: "Local Chain",
        nativeCurrency: {
          name: "LOCAL",
          symbol: "LOCAL", // 2-6 characters long
          decimals: 18,
        },
        rpcUrls: ["http://127.0.0.1:8545"],
      },
    },
  },
};
