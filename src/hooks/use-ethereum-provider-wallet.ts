import { useCallback, useEffect, useRef, useState } from "react";
import { refreshMetaMask } from "../lib/wallet";
import type { Wallet } from "../types";

export function useEthereumProviderWallet(): {
  wallet: Wallet;
  refreshWallet: () => Promise<void>;
} {
  const [wallet, setWallet] = useState<Wallet>({
    account: null,
    chainId: null,
  });

  const refreshWallet = useCallback(async () => {
    setWallet(await refreshMetaMask());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    void refreshWallet();

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

    return () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged);
      eth.removeListener?.("chainChanged", onChainChanged);
    };
  }, [refreshWallet]);

  return { wallet, refreshWallet };
}

export function useEthereumProviderSync(onSync: () => void) {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = window.ethereum;
    if (!eth?.on) return;

    const notify = () => {
      onSyncRef.current();
    };

    eth.on("accountsChanged", notify);
    eth.on("chainChanged", notify);

    return () => {
      eth.removeListener?.("accountsChanged", notify);
      eth.removeListener?.("chainChanged", notify);
    };
  }, []);
}
