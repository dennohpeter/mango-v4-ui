import { useEffect } from 'react'
import { useWallet, Wallet } from '@solana/wallet-adapter-react'
import mangoStore from '../../store/state'
import { Wallet as AnchorWallet } from '@project-serum/anchor'
import { notify } from '../../utils/notifications'

export const handleWalletConnect = async (wallet: Wallet) => {
  if (!wallet) {
    return
  }
  const actions = mangoStore.getState().actions

  try {
    await wallet?.adapter?.connect()
    await actions.connectMangoClientWithWallet(wallet)
    await onConnectFetchAccountData(wallet)
  } catch (e: any) {
    console.error('WALLET CONNECT ERROR:', e)
    if (e.name.includes('WalletLoadError')) {
      notify({
        title: `${wallet.adapter.name} Error`,
        type: 'error',
        description: `Please install ${wallet.adapter.name} and then reload this page.`,
      })
    }
  }
}

const onConnectFetchAccountData = async (wallet: Wallet) => {
  if (!wallet) return
  const actions = mangoStore.getState().actions
  await actions.fetchMangoAccounts(wallet.adapter as unknown as AnchorWallet)
  actions.fetchProfilePicture(wallet.adapter as unknown as AnchorWallet)
  actions.fetchWalletTokens(wallet.adapter as unknown as AnchorWallet)
}

const WalletListener = () => {
  const { disconnecting } = useWallet()

  useEffect(() => {
    const setStore = mangoStore.getState().set
    if (disconnecting) {
      setStore((state) => {
        state.mangoAccount.current = undefined
      })
    }
  }, [disconnecting])

  return null
}

export default WalletListener
