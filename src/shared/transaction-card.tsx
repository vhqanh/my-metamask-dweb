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
import { TRANSACTION_TABS } from "../constant";
import type { Address, TxStatus } from "../types";

const DECIMAL_CONTRACT = 6;

type TransactionFn = (param: {
  to: Address;
  value?: bigint;
  contractAdress?: Address;
}) => Promise<{ hash?: Address; error?: string }>;

interface TransactionResult {
  hash?: Address;
  status?: TxStatus;
  msg?: string;
}

interface Props {
  sendTransaction: TransactionFn;
}

function txVariant(status?: TxStatus) {
  if (status === "success") return "success";
  if (status === "error") return "error";
  return "warning";
}

const TransactionCard = ({ sendTransaction }: Props) => {
  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState<"eth" | "mtk">("eth");
  const [sendTo, setSendTo] = useState<Address | null>(null);
  const [value, setValue] = useState("");
  const [contractAddress, setContractAddress] = useState<Address | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);

  const handleSendTransaction = async () => {
    if (!sendTo) return;
    try {
      setLoading(true);

      const res = await sendTransaction({
        to: sendTo,
        value: BigInt(
          Math.floor(parseFloat(value ?? "0") * Math.pow(10, DECIMAL_CONTRACT)),
        ),
        contractAdress: tabs === "mtk" ? contractAddress! : undefined,
      });

      if (res.hash) setResult({ hash: res.hash, status: "success" });
      else setResult({ status: "error", msg: res.error });
    } finally {
      setLoading(false);
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

          {tabs === "eth" && (
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Send to address"
                value={sendTo ?? ""}
                onChange={(e) => setSendTo(e.target.value as Address)}
              />
              <Input
                placeholder="Value in ETH"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Button
                variant="primary"
                onClick={handleSendTransaction}
                disabled={loading || !sendTo || !value}
              >
                Send transaction
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
          )}

          {tabs === "mtk" && (
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Send to address"
                value={sendTo ?? ""}
                onChange={(e) => setSendTo(e.target.value as `0x${string}`)}
              />
              <Input
                placeholder="Contract address"
                value={contractAddress ?? ""}
                onChange={(e) =>
                  setContractAddress(e.target.value as `0x${string}`)
                }
              />
              <Input
                placeholder="Value in MTK"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Button
                variant="primary"
                //onClick={onSendMTK}
                disabled={loading || !contractAddress || !sendTo}
              >
                Send MTK
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
