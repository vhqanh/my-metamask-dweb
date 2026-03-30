import { Button } from '@aioz-ui/core/components/button'
import { SettingsIcon } from '@aioz-ui/icon-react'
import { useEffect, useState } from 'react'
import type { Wallet } from './lib/wallet'
import { connectMetaMask, refreshMetaMask } from './lib/wallet'

export default function App() {
  const [wallet, setWallet] = useState<Wallet>({ account: null, chainId: null })
  const [loading, setLoading] = useState(false)
  const canListen = typeof window !== 'undefined'

  useEffect(() => {
    let cleanup: (() => void) | undefined
    if (!canListen) return

    ;(async () => {
      setWallet(await refreshMetaMask())
    })()

    const eth = window.ethereum
    if (!eth?.on) return

    const onAccountsChanged = (accounts: string[]) => {
      setWallet((prev) => ({ ...prev, account: accounts?.[0] ?? null }))
    }

    const onChainChanged = (chainId: string) => {
      setWallet((prev) => ({ ...prev, chainId }))
    }

    eth.on('accountsChanged', onAccountsChanged)
    eth.on('chainChanged', onChainChanged)

   cleanup = () => {
      eth.removeListener?.('accountsChanged', onAccountsChanged)
      eth.removeListener?.('chainChanged', onChainChanged)
    }

    return cleanup
  }, [])

  async function onConnect() {
    setLoading(true)
    try {
      setWallet(await connectMetaMask())
    } catch (e: unknown) {
      alert((e as Error).message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <div className="font-semibold">MetaMask Demo</div>
        </div>

        <div className="space-y-1 text-sm">
          <div>Account: {wallet.account ?? '-'}</div>
          <div>ChainId: {wallet.chainId ?? '-'}</div>
        </div>

        <Button onClick={onConnect} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
  )
}