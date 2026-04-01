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
export interface ContractTransaction extends Transaction {
  contractAddress: string;
}
