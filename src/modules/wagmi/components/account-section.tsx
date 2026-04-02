import type { ToggleTabItem } from "@aioz-ui/core-v3/components/tabs";
import { useChains, useConnection, useSwitchChain } from "wagmi";
import AccountCard from "../../../shared/account-card";

const formatChainId = (chainId?: number) => {
  if (!chainId) return "-";
  return `0x${chainId.toString(16)}`;
};

const AccountSection = () => {
  const connection = useConnection();
  const address = connection.address;
  const chainId = formatChainId(connection.chainId);
  const isConnected = connection.isConnected;
  const switchChain = useSwitchChain();
  const chains = useChains();
  const tabs: ToggleTabItem[] = chains.map((chain) => ({
    label: chain.name,
    value: formatChainId(chain.id),
  }));

  return (
    <AccountCard
      publicAddress={address}
      chainId={chainId}
      isConnected={isConnected}
      tabs={tabs}
      onSwitchNetwork={(value) =>
        switchChain.mutate({ chainId: Number(value) })
      }
    />
  );
};

export default AccountSection;
