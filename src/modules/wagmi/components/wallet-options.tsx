import { Button } from "@aioz-ui/core-v3/components";
import { injected, useConnect, useConnectors } from "wagmi";

export function WalletOptions() {
  const connect = useConnect();
  const connectors = useConnectors();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          variant="primary"
          onClick={() => connect.mutate({ connector: injected() })}
          className="min-w-40"
        >
          {connector.name}
        </Button>
      ))}
    </div>
  );
}
