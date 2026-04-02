import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@aioz-ui/core-v3/components";
import type { ToggleTabItem } from "@aioz-ui/core-v3/components/tabs";
import { ToggleTabs } from "@aioz-ui/core-v3/components/tabs";
import type { Address } from "../types";

interface Props {
  publicAddress?: Address;
  chainId: string;
  isConnected: boolean;
  tabs: ToggleTabItem[];
  onSwitchNetwork: (params: number | string) => void;
}

const AccountCard = ({
  publicAddress,
  chainId,
  isConnected,
  tabs,
  onSwitchNetwork,
}: Props) => {
  return (
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
              color={isConnected ? "success" : "warning"}
              variant="secondary"
              showIcon={false}
            >
              {isConnected ? "Connected" : "Not connected"}
            </Badge>
            <Badge
              color={chainId ? "info" : "warning"}
              variant="secondary"
              showIcon={false}
            >
              ChainId: {chainId ?? "-"}
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
              <code className="break-all">{publicAddress ?? "-"}</code>
            </CardContent>
          </Card>

          <Card className="border border-border-neutral shadow-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Network</CardTitle>
              <CardDescription>Switch the active chain.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <ToggleTabs
                items={tabs}
                value={chainId}
                onValueChange={(value) => onSwitchNetwork(value)}
              />
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
