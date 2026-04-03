import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../../config/wagmi-config.ts";
import WagmiClient from "./components/wagmi-client.tsx";

const AppLayout = () => {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <WagmiClient />
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default AppLayout;
