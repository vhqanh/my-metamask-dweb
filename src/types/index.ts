export type Wallet = {
  account: string | null;
  chainId: string | null;
};

export type Address = `0x${string}`;
export type TxStatus = "pending" | "success" | "error";
export type TransactionType = "eth" | "mtk";

export type NetworkKey = "Sepolia" | "Aioz-Testnet" | "Ethereum";

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

export type TransactionFn = (param: {
  type: TransactionType;
  from?: Address | string;
  to: Address | string;
  value?: bigint | string;
  contractAddress?: Address | string;
}) => Promise<{ hash?: Address | string; error?: string }>;
