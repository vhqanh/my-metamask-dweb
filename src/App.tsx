/* eslint-disable prefer-const */
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Message,
  Separator,
  ToggleTabs,
} from "@aioz-ui/core-v3/components";
import { Check0, SettingsIcon } from "@aioz-ui/icon-react";
import { useEffect, useState } from "react";
import { NETWORKS, TRANSACTION_TABS } from "./constant";
import {
  connectMetaMask,
  refreshMetaMask,
  sendMyToken,
  sendTransaction,
  switchNetwork,
} from "./lib/wallet";
import type { NetworkKey, TxRes, Wallet } from "./types";

function txVariant(status: NonNullable<TxRes>["status"]) {
  if (status === "success") return "success";
  if (status === "error") return "error";
  return "warning";
}

export default function App() {
  const [wallet, setWallet] = useState<Wallet>({
    account: null,
    chainId: null,
  });
  const [loading, setLoading] = useState(false);
  const [txRes, setTxRes] = useState<TxRes>(null);
  const [sendTo, setSendTo] = useState("");
  const [sendValue, setSendValue] = useState("");
  const [networkKey, setNetworkKey] = useState<keyof typeof NETWORKS>("ether");
  const [sendTab, setSendTab] = useState<"eth" | "mtk">("eth");

  const [tokenTo, setTokenTo] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenTxRes, setTokenTxRes] = useState<TxRes>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (typeof window === "undefined") return;
    (async () => {
      setWallet(await refreshMetaMask());
    })();

    const eth = window.ethereum;
    if (!eth?.on) return;

    const onAccountsChanged = (accounts: string[]) => {
      setWallet((prev) => ({ ...prev, account: accounts?.[0] ?? null }));
    };

    const onChainChanged = (chainId: string) => {
      setWallet((prev) => ({ ...prev, chainId }));
    };

    eth.on("accountsChanged", onAccountsChanged);
    eth.on("chainChanged", onChainChanged);

    cleanup = () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged);
      eth.removeListener?.("chainChanged", onChainChanged);
    };

    return cleanup;
  }, []);

  async function onConnect() {
    setLoading(true);
    try {
      setWallet(await connectMetaMask());
    } catch (e: unknown) {
      alert((e as Error).message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  const onSwitchNetwork = async (key: NetworkKey) => {
    setNetworkKey(key);
    await switchNetwork(key);
    setWallet(await refreshMetaMask());
  };

  const onSendTransaction = async () => {
    const res = await sendTransaction({
      from: wallet.account,
      to: sendTo,
      value: sendValue,
    });
    setTxRes(res);
  };

  const onSendMTK = async () => {
    const res = await sendMyToken({
      from: wallet.account,
      to: tokenTo,
      value: amount,
      contractAddress,
    });
    setTokenTxRes(res);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <div className="text-title-neutral text-title-03 font-medium">
            MetaMask Demo
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onConnect}
          disabled={loading}
          rightIcon={
            loading ? undefined : wallet.account ? <Check0 /> : undefined
          }
        >
          {loading ? "Connecting..." : wallet.account ? "Connected" : "Connect"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-title-neutral text-title-04 font-medium">
                Wallet status
              </div>
              <div className="text-body-02 text-content-sec">
                Connect, switch network, and send a test transaction.
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
              <Badge
                color={wallet.account ? "success" : "warning"}
                variant="secondary"
                showIcon={false}
              >
                {wallet.account ? "Connected" : "Not connected"}
              </Badge>
              <Badge
                color={wallet.chainId ? "info" : "warning"}
                variant="secondary"
                showIcon={false}
              >
                ChainId: {wallet.chainId ?? "-"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="border border-border-neutral shadow-none">
              <CardHeader className="p-6 pb-0">
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Your connected address (if any).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <code className="break-all">{wallet.account ?? "-"}</code>
              </CardContent>
            </Card>

            <Card className="border border-border-neutral shadow-none">
              <CardHeader className="p-6 pb-0">
                <CardTitle>Network</CardTitle>
                <CardDescription>Switch the active chain.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <ToggleTabs
                  items={Object.keys(NETWORKS).map((key) => ({
                    value: key,
                    label: key,
                  }))}
                  value={networkKey}
                  onValueChange={(key) =>
                    void onSwitchNetwork(key as NetworkKey)
                  }
                />
                <div className="text-body-02 text-content-sec">
                  Current: <span className="font-medium">{networkKey}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

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
              value={sendTab}
              onValueChange={(v) => setSendTab(v as typeof sendTab)}
              className="w-full"
              size="md"
            />

            {sendTab === "eth" && (
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Send to address"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                />
                <Input
                  placeholder="Value in ETH"
                  value={sendValue}
                  onChange={(e) => setSendValue(e.target.value)}
                />
                <Button
                  variant="primary"
                  onClick={onSendTransaction}
                  disabled={
                    loading ||
                    !wallet.account ||
                    !wallet.chainId ||
                    !sendTo ||
                    !sendValue
                  }
                >
                  Send transaction
                </Button>

                {txRes && (
                  <Message
                    className="w-full justify-between"
                    size="md"
                    variant={txVariant(txRes.status)}
                  >
                    <span className="break-all">
                      Tx: {txRes.hash} · {txRes.status}
                      {txRes.msg ? ` · ${txRes.msg}` : ""}
                    </span>
                  </Message>
                )}
              </div>
            )}

            {sendTab === "mtk" && (
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Send to address"
                  value={tokenTo}
                  onChange={(e) => setTokenTo(e.target.value)}
                />
                <Input
                  placeholder="Contract address"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
                <Input
                  placeholder="Value in MTK"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                  variant="primary"
                  onClick={onSendMTK}
                  disabled={
                    loading ||
                    !wallet.account ||
                    !wallet.chainId ||
                    !contractAddress ||
                    !amount ||
                    !tokenTo
                  }
                >
                  Send MTK
                </Button>

                {tokenTxRes && (
                  <Message
                    className="w-full justify-between"
                    size="md"
                    variant={txVariant(tokenTxRes.status)}
                  >
                    <span className="break-all">
                      Tx: {tokenTxRes.hash} · {tokenTxRes.status}
                      {tokenTxRes.msg ? ` · ${tokenTxRes.msg}` : ""}
                    </span>
                  </Message>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
