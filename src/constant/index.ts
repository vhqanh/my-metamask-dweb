import type { Network, NetworkKey } from "../types";

export const account1 = "0x190A4F1111843Ed5ad55aABFe5970530d30e05E4";
export const account2 = "0x41C4740428e14ADb91698682dccf04867CF75Da2";

export const MyTokenContract = {
  address: "0x783D6e575E74970b4d3BB892a00E74e9bf5A9781",
  decimal: 6,
};

export const NETWORKS: Record<NetworkKey, Network> = {
  sepolia: {
    chainId: "0xaa36a7",
    chainName: "Sepolia Testnet",
    rpcUrls: ["https://rpc.sepolia.org"],
    nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  "aioz-testnet": {
    chainId: "0x6571",
    chainName: "AIOZ Testnet",
    rpcUrls: ["https://eth-ds.testnet.aioz.network"],
    nativeCurrency: { name: "AIOZ", symbol: "AIOZ", decimals: 18 },
    blockExplorerUrls: ["https://testnet.explorer.aioz.network"],
  },
  ether: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    rpcUrls: [""],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://etherscan.io"],
  },
};

export const TRANSACTION_TABS = [
  { value: "eth", label: "ETH" },
  { value: "mtk", label: "MTK" },
];
