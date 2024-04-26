export {};

declare global {
  interface Window {
    ethereum: any; // replace 'any' with the actual type of 'ethereum'
  }
}