import { useConnection } from "wagmi";
import AccountSection from "../components/account-section";
import TransactionSection from "../components/transaction-section";
import { WalletOptions } from "../components/wallet-options";

const WagmiClient = () => {
  const connection = useConnection();
  const isConnected = connection.isConnected;
  return (
    <>
      {isConnected ? <AccountSection /> : <WalletOptions />}
      {isConnected && <TransactionSection />}
    </>
  );
};

export default WagmiClient;
