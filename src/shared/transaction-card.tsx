import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Message,
} from "@aioz-ui/core-v3/components";
import { ToggleTabs } from "@aioz-ui/core-v3/components/tabs";
import { useState } from "react";
import { parseEther, parseUnits } from "viem/utils";
import { TRANSACTION_TABS } from "../constant";
import type {
  Address,
  TransactionFn,
  TransactionType,
  TxStatus,
} from "../types";

interface TransactionResult {
  hash?: Address | string;
  status?: TxStatus;
  msg?: string;
}

interface Props {
  sendTransaction: TransactionFn;
  isRaw?: boolean;
}

function txVariant(status?: TxStatus) {
  if (status === "success") return "success";
  if (status === "error") return "error";
  return "warning";
}

const TransactionCard = ({ sendTransaction, isRaw = false }: Props) => {
  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState<TransactionType>("eth");
  const [sendTo, setSendTo] = useState<Address | null>(null);
  const [value, setValue] = useState("");
  const [contractAddress, setContractAddress] = useState<Address | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);

  const isToken = tabs === "mtk";

  const handleSendTransaction = async () => {
    if (!sendTo) return;

    try {
      setLoading(true);

      if (isToken) {
        const tx2 = await sendTransaction({
          type: "mtk",
          to: sendTo,
          value: isRaw ? value : parseUnits(value, 6),
          contractAddress: contractAddress!,
        });

        if (!tx2.hash) throw new Error(tx2.error);
        setResult({ hash: tx2.hash, status: "success" });
      } else {
        const tx1 = await sendTransaction({
          type: "eth",
          to: sendTo,
          value: isRaw ? value : parseEther(value),
        });

        if (!tx1.hash) throw new Error(tx1.error);

        setResult({ hash: tx1.hash, status: "success" });
      }
    } catch (err) {
      setResult({ status: "error", msg: (err as Error).message });
    } finally {
      setLoading(false);
      setContractAddress(null);
      setSendTo(null);
      setValue("");
    }
  };

  return (
    <Card>
      <CardHeader className="p-6 pb-0">
        <CardTitle>Transaction</CardTitle>
        <CardDescription>
          Choose an asset and submit a transfer via MetaMask.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <ToggleTabs
            items={TRANSACTION_TABS}
            value={tabs}
            onValueChange={(v) => setTabs(v as typeof tabs)}
            className="w-full"
            size="md"
          />

          <div className="flex flex-col gap-3">
            <Input
              placeholder="Send to address"
              value={sendTo ?? ""}
              onChange={(e) => setSendTo(e.target.value as Address)}
            />
            {isToken && (
              <Input
                placeholder="Contract address"
                value={contractAddress ?? ""}
                onChange={(e) =>
                  setContractAddress(e.target.value as `0x${string}`)
                }
              />
            )}
            <Input
              placeholder="Value in ETH"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={handleSendTransaction}
              disabled={
                loading || !sendTo || !value || (isToken && !contractAddress)
              }
            >
              {isToken ? "Send MTK" : "Send Transaction"}
            </Button>

            {result && (
              <Message
                className="w-full justify-between"
                size="md"
                variant={txVariant(result.status)}
              >
                <span className="break-all">
                  {result.hash ? `Tx: ${result.hash}` : result.msg}
                </span>
              </Message>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
