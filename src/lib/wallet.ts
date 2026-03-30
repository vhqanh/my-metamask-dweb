export type Wallet = {
    account: string|null;
    chainId: string | null
}

type EthereumEventMap = {
  accountsChanged: (accounts: string[]) => void
  chainChanged: (chainId: string) => void
}

export interface EthereumProvider {
  request: <T = unknown>(args: {
    method: string
    params?: unknown[] | object
  }) => Promise<T>

  on<K extends keyof EthereumEventMap>(
    event: K,
    handler: EthereumEventMap[K]
  ): void

  removeListener?<K extends keyof EthereumEventMap>(
    event: K,
    handler: EthereumEventMap[K]
  ): void
}

declare global {
    interface Window {
        ethereum?: EthereumProvider
    }
}

export async function connectMetaMask(): Promise<Wallet> {
  const eth = window.ethereum
  if (!eth) throw new Error("MetaMask not found")

  const accounts = await eth.request<string[]>({
    method: "eth_requestAccounts",
  })

  const chainId = await eth.request<string>({
    method: "eth_chainId",
  })

  return {
    account: accounts[0] ?? null,
    chainId: chainId ?? null,
  }
}

export async function refreshMetaMask():Promise<Wallet> {
  const eth = window.ethereum
  if(!eth) return {
    account:null,
    chainId: null
  }
    const accounts = await eth.request<string[]>({
    method: "eth_requestAccounts",
  })

  const chainId = await eth.request<string>({
    method: "eth_chainId",
  })

  return {
    account: accounts[0] ?? null,
    chainId: chainId ?? null,
  }
}

