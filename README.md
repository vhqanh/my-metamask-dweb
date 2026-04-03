# my-metamask-dweb

A small React demo that connects to **MetaMask** and exercises **connect**, **network switch**, **native ETH transfer**, and **ERC-20 `transfer`**. The app is intentionally split into two implementations so reviewers can compare **raw `window.ethereum` (EIP-1193)** with **wagmi v3 + viem**.

## Prerequisites

- **Node.js** (version aligned with your team standard; project uses Vite 8 + React 19).
- **MetaMask** (or another injected wallet compatible with the same JSON-RPC surface).
- **`aioz-ui` linked packages** — `package.json` uses `link:aioz-ui/packages/...`. Clone or place the `aioz-ui` workspace next to this repo (or adjust links) so `npm install` resolves `@aioz-ui/*`.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

| Script    | Purpose                          |
| --------- | -------------------------------- |
| `npm run dev` | Dev server                     |
| `npm run build` | Typecheck + production build |
| `npm run lint`  | ESLint                       |
| `npm run preview` | Preview production build   |

## Project structure (application code)

Only the paths under `src/` are the app; `aioz-ui/` is local UI/design-system source consumed via `file:` / `link:` dependencies.

```
src/
├── main.tsx                 # Entry: ThemeProvider, Router
├── App.tsx                  # Top nav + routes
├── index.css / App.css      # Global styles
├── config/
│   └── wagmi-config.ts      # Chains, injected MetaMask connector, HTTP transports
├── constant/
│   └── index.ts             # Networks for raw switch/add chain, tab labels
├── types/
│   └── index.ts             # Wallet, networks, TransactionFn, Window.ethereum typing
├── lib/
│   └── wallet.ts            # Raw MetaMask: connect, switch chain, send ETH, send token
├── hooks/
│   └── use-ethereum-provider-wallet.ts  # Account/chain state + provider events (raw + wagmi sync helper)
├── shared/
│   ├── account-card.tsx     # Shared wallet/network UI
│   └── transaction-card.tsx  # Shared send form (ETH + MTK); raw vs wagmi value shapes
└── modules/
    ├── ethereum-raw/
    │   └── App.tsx          # Raw stack: connect, switch via lib/wallet, TransactionCard isRaw
    └── wagmi/
        ├── App.tsx          # WagmiProvider + QueryClientProvider shell
        └── components/
            ├── wagmi-client.tsx       # Connected vs wallet picker
            ├── wallet-options.tsx     # useConnect + connectors
            ├── account-section.tsx    # AccountCard + useSwitchChain
            └── transaction-section.tsx # useSendTransaction + useWriteContract
```

## Routes

| Path            | What it is                                      |
| --------------- | ----------------------------------------------- |
| `/`             | Redirects to `/ethereum-raw`                    |
| `/ethereum-raw` | Raw `window.ethereum` demo                      |
| `/wagmi`        | wagmi + TanStack Query demo                     |

## How this was built (for reviewers)

1. **Vite + React + TypeScript** — fast local dev; strict separation of routes and modules.
2. **Dual implementation** — same product goals, two stacks:
   - **Raw:** `lib/wallet.ts` calls `eth_requestAccounts`, `wallet_switchEthereumChain` / `wallet_addEthereumChain`, `eth_sendTransaction`, and a minimal hex-encoded `transfer` calldata for the token path. `useEthereumProviderWallet` keeps address/chain in sync with `accountsChanged` / `chainChanged`.
   - **Wagmi:** `config/wagmi-config.ts` registers chains and an **injected** connector targeting MetaMask. `account-section` switches chain with `useSwitchChain`; `transaction-section` uses `useSendTransaction` and `useWriteContract` with a small inline ABI for `transfer`.
3. **Shared UI** — `AccountCard` and `TransactionCard` live in `shared/` to avoid duplicating layout; the **raw** path passes `isRaw` into `TransactionCard` so amounts stay as decimal strings there, while the **wagmi** path passes viem-parsed `bigint`s through the same `TransactionFn` shape.
4. **Design system** — `@aioz-ui/core-v3`, `@aioz-ui/icon-react`, and `@aioz-ui/styles` supply components and theming (`ThemeProvider` in `main.tsx`).
5. **Chains** — wagmi config uses `mainnet`, `sepolia`, and `aioz` from `wagmi/chains`. Raw network metadata for switching lives in `constant/index.ts` (Sepolia, AIOZ testnet, Ethereum mainnet keys).

## Reviewer guide: what to read in order

1. **`src/types/index.ts`** — contracts used across modules (`Wallet`, `TransactionFn`, `NetworkKey`).
2. **`src/lib/wallet.ts`** + **`src/hooks/use-ethereum-provider-wallet.ts`** — raw flow and event wiring.
3. **`src/modules/ethereum-raw/App.tsx`** — composition of connect, switch, and shared cards.
4. **`src/config/wagmi-config.ts`** + **`src/modules/wagmi/App.tsx`** + **`components/wagmi-client.tsx`** — wagmi shell.
5. **`src/modules/wagmi/components/account-section.tsx`** + **`transaction-section.tsx`** — chain switch and writes.
6. **`src/shared/transaction-card.tsx`** — where raw vs wagmi inputs diverge (`isRaw`, `parseEther` / `parseUnits`).

## Suggested manual test checklist (PR / QA)

- [ ] **Ethereum Raw:** Connect; switch each network tab; confirm address and chain id update (including after changing account or chain in MetaMask).
- [ ] **Ethereum Raw:** Send a small **ETH** amount on a test network you control; confirm MetaMask prompts and a tx hash appears.
- [ ] **Ethereum Raw:** **MTK** path: valid contract + recipient + amount; confirm transaction submits (environment-dependent).
- [ ] **Wagmi:** Connect via injected wallet; switch chains from tabs; reconnect behavior when switching account (if applicable).
- [ ] **Wagmi:** ETH send and token **transfer** succeed on the chosen chain with correct decimals expectations (token path assumes **6** decimals in the shared card unless you change constants).

## Notes

- This repo is a **demo**, not a production wallet product: no backend, no persisted sessions, limited validation of addresses and chain/network alignment before sends.
- **Public RPC endpoints** in config/constants are convenience defaults; for reliability or rate limits, reviewers may substitute their own URLs or env-based configuration in follow-up work.
