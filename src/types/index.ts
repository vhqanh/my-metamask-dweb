export type Wallet = {
  account: string | null;
  chainId: string | null;
};

export type NetworkKey = "sepolia" | "aioz-testnet" | "ether";

export type TxRes = {
  hash: string;
  status: "pending" | "success" | "error";
  msg?: string;
} | null;

type EthereumEventMap = {
  accountsChanged: (accounts: string[]) => void;
  chainChanged: (chainId: string) => void;
};

export interface EthereumProvider {
  request: <T = unknown>(args: {
    method: string;
    params?: unknown[] | object;
  }) => Promise<T>;

  on<K extends keyof EthereumEventMap>(
    event: K,
    handler: EthereumEventMap[K],
  ): void;

  removeListener?<K extends keyof EthereumEventMap>(
    event: K,
    handler: EthereumEventMap[K],
  ): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface Network {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: NativeCurrency;
  blockExplorerUrls: string[];
}

export interface Transaction {
  from: string | null;
  to: string | null;
  value: string | null;
}

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
