import type { Transaction, TxRes, Wallet } from '../types/index'
import { NETWORKS } from '../types/index'

export async function connectMetaMask(): Promise<Wallet> {
  const eth = window.ethereum
  if (!eth) throw new Error("MetaMask not found")

  const [accounts, chainId] = await Promise.all([
    eth.request<string[]>({ method: "eth_requestAccounts" }),
    eth.request<string>({ method: "eth_chainId" }),
  ])

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
  
  const [accounts, chainId] = await Promise.all([
    eth.request<string[]>({ method: "eth_requestAccounts" }),
    eth.request<string>({ method: "eth_chainId" }),
  ])

  return {
    account: accounts[0] ?? null,
    chainId: chainId ?? null,
  }
}

export const switchNetwork = async (network: keyof typeof NETWORKS) => {
  const eth = window.ethereum
  if (!eth) throw new Error("MetaMask not found")

  const targetNetwork = NETWORKS[network]
  if (!targetNetwork) throw new Error("Unsupported network")

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetNetwork.chainId }],
    })
  } catch (switchError: unknown) {
    if ((switchError as { code?: number }).code === 4902) {
      try {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: targetNetwork.chainId,
              chainName: targetNetwork.chainName,
              rpcUrls: targetNetwork.rpcUrls,
              nativeCurrency: targetNetwork.nativeCurrency,
              blockExplorerUrls: targetNetwork.blockExplorerUrls,
            },
          ],
        })
      } catch (addError) {
        throw new Error(
          `Failed to add network ${network}: ${
            (addError as Error).message ?? String(addError)
          }`
        )
      }
    } else {
      throw new Error(
        `Failed to switch to network ${network}: ${
          (switchError as Error).message ?? String(switchError)
        }`
      )
    }
  }
}

export const parseEtherToHexWei = (value: string) => {
  if (!/^\d*\.?\d+$/.test(value)) {
    throw new Error("Invalid number format");
  }
  const [integerPart, decimalPart = ""] = value.split(".");
  const paddedDecimal = (decimalPart + "0".repeat(18)).slice(0, 18);
  const weiString = integerPart + paddedDecimal;
  const normalized = weiString.replace(/^0+/, "") || "0";
  const weiBigInt = BigInt(normalized);
  return "0x" + weiBigInt.toString(16);
}

export const sendTransaction = async (tx: Transaction): Promise<TxRes> => {
  const eth = window.ethereum
  if (!eth) throw new Error("MetaMask not found")
  if(!tx.from || !tx.to || !tx.value){
    throw new Error('Transaction fields cannot be empty')
    }
  try {
    const txHash: string = await eth.request<string>({
      method: "eth_sendTransaction",
      params: [{
        ...tx,
        value: parseEtherToHexWei(tx.value ?? "0")
      ,
      }]
    })

    return { hash: txHash, status: 'pending' }
  } catch (error) {
    throw new Error(
      `Failed to send transaction: ${(error as Error).message ?? String(error)}`
    )
  }
}