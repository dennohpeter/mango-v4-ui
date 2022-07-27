import React, { Fragment } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
// import { WalletReadyState } from '@solana/wallet-adapter-base'
// import uniqBy from 'lodash/uniqBy'
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/solid'
import { Menu, Transition } from '@headlessui/react'

const WalletSelect = () => {
  const { wallet, wallets, select } = useWallet()

  // const installedWallets = useMemo(() => {
  //   const installed: Wallet[] = []

  //   for (const wallet of wallets) {
  //     if (wallet.readyState === WalletReadyState.Installed) {
  //       installed.push(wallet)
  //     }
  //   }

  //   return installed?.length ? installed : wallets
  // }, [wallets])

  // const displayedWallets = useMemo(() => {
  //   return uniqBy([...installedWallets, ...wallets], (w) => {
  //     return w.adapter.name
  //   })
  // }, [wallets, installedWallets])

  // if (!wallets?.length) {
  //   return null
  // }

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button
            className={`flex h-full w-14 cursor-pointer items-center justify-center rounded-none bg-transparent text-white hover:brightness-[1.1] focus:outline-none`}
          >
            <ChevronDownIcon
              className={`default-transition h-6 w-6 ${
                open ? 'rotate-180 transform' : 'rotate-360 transform'
              }`}
            />
          </Menu.Button>
          <Transition
            appear={true}
            show={open}
            as={Fragment}
            enter="transition-all ease-in duration-200"
            enterFrom="opacity-0 transform scale-75"
            enterTo="opacity-100 transform scale-100"
            leave="transition ease-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Menu.Items className="absolute top-[68px] right-0 z-20 w-44 rounded-md border border-th-bkg-3 bg-th-bkg-1 px-4 py-2.5 outline-none">
              {wallets?.map((wallet, index) => (
                <Menu.Item key={index}>
                  <button
                    className="flex w-full flex-row items-center justify-between rounded-none py-1.5 font-normal focus:outline-none md:hover:cursor-pointer md:hover:text-th-primary"
                    onClick={() => {
                      select(wallet.adapter.name)
                    }}
                  >
                    <div className="flex items-center">
                      <img
                        src={wallet.adapter.icon}
                        className="mr-2 h-5 w-5"
                        alt={`${wallet.adapter.name} icon`}
                      />
                      {wallet.adapter.name}
                    </div>
                  </button>
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default WalletSelect
