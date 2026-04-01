import { Button } from "@aioz-ui/core-v3/components";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import EthereumRawApp from "./modules/ethereum-raw/App";
import WagmiApp from "./modules/wagmi/App";

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "opacity-100" : "opacity-70";

export default function App() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-center gap-3">
        <NavLink to="/ethereum-raw" className={navClass}>
          <Button variant="secondary">Ethereum Raw</Button>
        </NavLink>
        <NavLink to="/wagmi" className={navClass}>
          <Button variant="secondary">Wagmi</Button>
        </NavLink>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/ethereum-raw" replace />} />
        <Route path="/ethereum-raw" element={<EthereumRawApp />} />
        <Route path="/wagmi" element={<WagmiApp />} />
        <Route path="*" element={<Navigate to="/ethereum-raw" replace />} />
      </Routes>
    </div>
  );
}
