import { useSendTransaction, useWriteContract } from "wagmi";
import TransactionCard from "../../../shared/transaction-card";
import type { Address, TransactionFn } from "../../../types";

const abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "supply", type: "uint" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const TransactionSection = () => {
  const sendTransaction = useSendTransaction();
  const { mutate: sendTx } = sendTransaction;
  const writeContract = useWriteContract();
  const { mutate: sendMTK } = writeContract;

  const handleSendTransaction: TransactionFn = async ({
    type,
    to,
    value,
    contractAddress,
  }) => {
    try {
      switch (type) {
        case "eth": {
          return new Promise((resolve) => {
            sendTx(
              {
                to: to as Address,
                value: value as bigint,
              },
              {
                onSuccess(data) {
                  resolve({ hash: data });
                },
                onError(error) {
                  resolve({ error: error.message });
                },
              },
            );
          });
        }
        case "mtk": {
          if (!contractAddress)
            return { error: "Contract address is required" };
          return new Promise((resolve) => {
            sendMTK(
              {
                abi,
                address: contractAddress as Address,
                functionName: "transfer",
                args: [to as Address, value as bigint],
              },
              {
                onSuccess(data) {
                  resolve({ hash: data });
                },
                onError(error) {
                  resolve({ error: error.message });
                },
              },
            );
          });
        }
        default: {
          return { error: "Unknown transaction type" };
        }
      }
    } catch (err) {
      return { error: (err as Error).message };
    }
  };

  return <TransactionCard sendTransaction={handleSendTransaction} />;
};

export default TransactionSection;
