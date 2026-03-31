/* eslint-disable prefer-const */
import { Button } from "@aioz-ui/core-v3/components/button";
import { Input } from "@aioz-ui/core-v3/components/input";
import { Check0, SettingsIcon } from "@aioz-ui/icon-react";
import { useEffect, useState } from "react";
import {
  connectMetaMask,
  refreshMetaMask,
  sendTransaction,
  switchNetwork,
} from "./lib/wallet";
import type { NetworkKey, TxRes, Wallet } from "./types";
import { NETWORKS } from "./types";

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

  const canListen = typeof window !== "undefined";

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (!canListen) return;
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

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-5 w-5" />
        <div className="font-semibold">MetaMask Demo</div>
      </div>

      <div className="space-y-1 text-sm">
        <div>Account: {wallet.account ?? "-"}</div>
        <div>ChainId: {wallet.chainId ?? "-"}</div>
      </div>

      <Button
        variant="primary"
        onClick={onConnect}
        disabled={loading}
        rightIcon={
          loading ? undefined : wallet.account ? <Check0 /> : undefined
        }
      >
        {loading ? "Connecting..." : "Connect Wallet"}
      </Button>

      <div className="flex items-center gap-1 justify-center">
        {Object.keys(NETWORKS).map((key) => (
          <Button
            variant="secondary"
            key={key}
            onClick={() => onSwitchNetwork(key as NetworkKey)}
            disabled={loading || networkKey === key}
          >
            Switch to {key}
          </Button>
        ))}
      </div>

      <div className="flex flex-col mt-20 gap-2 w-full">
        <Input
          placeholder="Send to address"
          value={sendTo}
          onChange={(e) => setSendTo(e.target.value)}
        />
        <Input
          placeholder="Value"
          value={sendValue}
          onChange={(e) => setSendValue(e.target.value)}
        />
        <Button
          variant="primary"
          onClick={onSendTransaction}
          disabled={!wallet.account || !wallet.chainId || !sendTo || !sendValue}
        >
          Send Transaction
        </Button>
        <p className="text-stone-950">Network: {networkKey}</p>
        {txRes && (
          <div
            className={`p-2 rounded ${txRes.status === "pending" ? "bg-yellow-100 text-yellow-800" : txRes.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            Tx Hash: {txRes.hash} <br />
            Status: {txRes.status} <br />
            {txRes.msg && <>Message: {txRes.msg}</>}
          </div>
        )}
      </div>
    </div>
  );
}
