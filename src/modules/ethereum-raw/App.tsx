/* eslint-disable prefer-const */
import { Button } from "@aioz-ui/core-v3/components";
import { Check0, SettingsIcon } from "@aioz-ui/icon-react";
import { useState } from "react";
import { NETWORKS } from "../../constant";
import { useEthereumProviderWallet } from "../../hooks/use-ethereum-provider-wallet";
import {
  connectMetaMask,
  sendMyToken,
  sendTransaction,
  switchNetwork,
} from "../../lib/wallet";
import AccountCard from "../../shared/account-card";
import TransactionCard from "../../shared/transaction-card";
import type { NetworkKey, TransactionFn } from "../../types";

export default function EthereumRawApp() {
  const { wallet, refreshWallet } = useEthereumProviderWallet();
  const [loading, setLoading] = useState(false);
  const [networkKey, setNetworkKey] =
    useState<keyof typeof NETWORKS>("Ethereum");

  async function onConnect() {
    setLoading(true);
    try {
      await connectMetaMask();
      await refreshWallet();
    } catch (e: unknown) {
      alert((e as Error).message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  const onSwitchNetwork = async (key: NetworkKey) => {
    setNetworkKey(key);
    await switchNetwork(key);
    await refreshWallet();
  };

  const handleSendTransaction: TransactionFn = async ({
    type,
    to,
    value,
    contractAddress,
  }) => {
    try {
      switch (type) {
        case "eth": {
          const res = await sendTransaction({
            type: "eth",
            from: wallet.account!,
            to,
            value,
          });

          return { hash: res.hash };
        }
        case "mtk": {
          const res = await sendMyToken({
            type: "mtk",
            from: wallet.account!,
            to,
            value,
            contractAddress: contractAddress!,
          });

          return { hash: res.hash };
        }
        default: {
          return { error: "Unknown transaction type" };
        }
      }
    } catch (err) {
      return { error: (err as Error).message };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <div className="text-title-neutral text-title-03 font-medium">
            MetaMask Demo (Raw)
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

      <AccountCard
        publicAddress={wallet.account ?? "-"}
        chainId={wallet.chainId ?? "-"}
        isConnected={wallet.account ? true : false}
        tabs={Object.keys(NETWORKS).map((key) => ({
          value: key,
          label: key,
        }))}
        onSwitchNetwork={(key) => onSwitchNetwork(key as NetworkKey)}
        networkKey={networkKey}
      />

      <TransactionCard sendTransaction={handleSendTransaction} isRaw />
    </div>
  );
}
