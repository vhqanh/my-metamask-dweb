import AppLayout from "./app-layout";
import WagmiWrapper from "./app-wrapper";

export default function WagmiApp() {
  return (
    <WagmiWrapper>
      <AppLayout />
    </WagmiWrapper>
  );
}
