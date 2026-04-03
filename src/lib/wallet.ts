import { DECIMAL_CONTRACT, NETWORKS } from "../constant";
import type { TransactionFn, Wallet } from "../types/index";

export async function connectMetaMask(): Promise<Wallet> {
  const eth = window.ethereum;
  if (!eth) throw new Error("MetaMask not found");

  const [accounts, chainId] = await Promise.all([
    eth.request<string[]>({ method: "eth_requestAccounts" }),
    eth.request<string>({ method: "eth_chainId" }),
  ]);

  return {
    account: accounts[0] ?? null,
    chainId: chainId ?? null,
  };
}

export async function refreshMetaMask(): Promise<Wallet> {
  const eth = window.ethereum;
  if (!eth)
    return {
      account: null,
      chainId: null,
    };

  const [accounts, chainId] = await Promise.all([
    eth.request<string[]>({ method: "eth_requestAccounts" }),
    eth.request<string>({ method: "eth_chainId" }),
  ]);

  return {
    account: accounts[0] ?? null,
    chainId: chainId ?? null,
  };
}

export const switchNetwork = async (network: keyof typeof NETWORKS) => {
  const eth = window.ethereum;
  if (!eth) throw new Error("MetaMask not found");

  const targetNetwork = NETWORKS[network];
  if (!targetNetwork) throw new Error("Unsupported network");

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetNetwork.chainId }],
    });
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
        });
      } catch (addError) {
        throw new Error(
          `Failed to add network ${network}: ${
            (addError as Error).message ?? String(addError)
          }`,
        );
      }
    } else {
      throw new Error(
        `Failed to switch to network ${network}: ${
          (switchError as Error).message ?? String(switchError)
        }`,
      );
    }
  }
};

export const sendTransaction: TransactionFn = async ({ from, to, value }) => {
  const eth = window.ethereum;
  if (!eth) throw new Error("MetaMask not found");
  if (!from || !to || !value) {
    throw new Error("Transaction fields cannot be empty");
  }

  const valueWei = BigInt(Math.floor(parseFloat(String(value ?? "0")) * 1e18));
  const valueHex = "0x" + valueWei.toString(16);

  try {
    const txHash: string = await eth.request<string>({
      method: "eth_sendTransaction",
      params: [
        {
          from,
          to,
          value: valueHex,
        },
      ],
    });

    return { hash: txHash, status: "pending" };
  } catch (error) {
    throw new Error(
      `Failed to send transaction: ${(error as Error).message ?? String(error)}`,
    );
  }
};

const pad32 = (hex: string) => {
  return hex.replace(/^0x/, "").padStart(64, "0");
};

const encodeFunctionTransfer = (addressTo: string, value: bigint) => {
  const methodId = "a9059cbb";

  const addressToPadded = pad32(addressTo);
  const valueHex = value.toString(16);
  const valuePadded = pad32(valueHex);

  return "0x" + methodId + addressToPadded + valuePadded;
};

export const sendMyToken: TransactionFn = async ({
  from,
  to,
  value,
  contractAddress,
}) => {
  const eth = window.ethereum;
  if (!eth) throw new Error("MetaMask not found");
  if (!from || !contractAddress || !value || !to) {
    alert("Transaction fields cannot be empty");
    throw new Error("Transaction fields cannot be empty");
  }

  const data = encodeFunctionTransfer(
    to ?? "",
    BigInt(
      Math.floor(
        parseFloat(String(value ?? "0")) * Math.pow(10, DECIMAL_CONTRACT),
      ),
    ),
  );

  try {
    const txHash: string = await eth.request<string>({
      method: "eth_sendTransaction",
      params: [
        {
          from,
          to: contractAddress,
          data,
        },
      ],
    });

    return { hash: txHash, status: "pending" };
  } catch (error) {
    throw new Error(
      `Failed to send MTK: ${(error as Error).message ?? String(error)}`,
    );
  }
};
