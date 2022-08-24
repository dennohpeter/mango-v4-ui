import { Transition } from '@headlessui/react'
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/solid'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { Fragment, useMemo, useState } from 'react'
import { useViewport } from '../../hooks/useViewport'

import mangoStore from '../../store/mangoStore'
import { formatDecimal, formatFixedDecimals } from '../../utils/numbers'
import { breakpoints } from '../../utils/theme'
import { IconButton } from '../shared/Button'
import ContentBox from '../shared/ContentBox'
import InfoTooltip from '../shared/InfoTooltip'

const TokenList = () => {
  const { t } = useTranslation('common')
  const [showTokenDetails, setShowTokenDetails] = useState('')
  const group = mangoStore((s) => s.group)
  const jupiterTokens = mangoStore((s) => s.jupiterTokens)
  const { width } = useViewport()
  const showTableView = width ? width > breakpoints.md : false

  const banks = useMemo(() => {
    if (group) {
      const rawBanks = Array.from(group?.banksMapByName, ([key, value]) => ({
        key,
        value,
      }))
      return rawBanks
    }
    return []
  }, [group])

  const handleShowTokenDetails = (name: string) => {
    showTokenDetails ? setShowTokenDetails('') : setShowTokenDetails(name)
  }

  return (
    <ContentBox hideBorder hidePadding className="mt-0 md:mt-4">
      {showTableView ? (
        <table className="-mt-1 min-w-full">
          <thead>
            <tr>
              <th className="text-left">{t('token')}</th>
              <th className="text-right">{t('price')}</th>
              <th className="text-right">Total Deposits</th>
              <th className="text-right">Total Borrows</th>
              <th className="">
                <div className="flex items-center justify-end">
                  <span>Utilization</span>
                  <InfoTooltip
                    content={
                      'The percentage of deposits that have been lent out.'
                    }
                  />
                </div>
              </th>
              <th className="">
                <div className="flex items-center justify-center">
                  <span>{t('rates')}</span>
                  <InfoTooltip
                    content={
                      'The deposit rate (green) will automatically be paid on positive balances and the borrow rate (red) will automatically be charged on negative balances.  '
                    }
                  />
                </div>
              </th>
              <th className="">
                <div className="flex items-center justify-center">
                  <span>Asset Weight</span>
                  {/* <InfoTooltip
                    content={
                      'The loan-to-value (LTV) ratio is how much you can borrow against your deposits.'
                    }
                  /> */}
                </div>
              </th>
              <th className="">
                <div className="flex items-center justify-center">
                  <span>Liability Weight</span>
                  {/* <InfoTooltip
                    content={
                      'The loan-to-value (LTV) ratio is how much you can borrow against your deposits.'
                    }
                  /> */}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {banks.map(({ key, value }) => {
              const bank = value[0]
              const oraclePrice = bank.uiPrice

              let logoURI
              if (jupiterTokens.length) {
                logoURI = jupiterTokens.find(
                  (t) => t.address === bank.mint.toString()
                )!.logoURI
              }

              return (
                <tr key={key}>
                  <td className="">
                    <div className="flex items-center">
                      <div className="mr-2.5 flex flex-shrink-0 items-center">
                        {logoURI ? (
                          <Image alt="" width="26" height="26" src={logoURI} />
                        ) : (
                          <QuestionMarkCircleIcon className="h-7 w-7 text-th-fgd-3" />
                        )}
                      </div>
                      <p>{bank.name}</p>
                    </div>
                  </td>
                  <td className="">
                    <div className="flex flex-col text-right">
                      <p>{formatFixedDecimals(oraclePrice, true)}</p>
                    </div>
                  </td>

                  <td className="">
                    <div className="flex flex-col text-right">
                      <p>{formatFixedDecimals(bank.uiDeposits())}</p>
                    </div>
                  </td>
                  <td className="">
                    <div className="flex flex-col text-right">
                      <p>{formatFixedDecimals(bank.uiBorrows())}</p>
                    </div>
                  </td>
                  <td className="">
                    <div className="flex flex-col text-right">
                      <p>
                        {bank.uiDeposits() > 0
                          ? formatDecimal(
                              (bank.uiBorrows() / bank.uiDeposits()) * 100,
                              1,
                              { fixed: true }
                            )
                          : '0.0'}
                        %
                      </p>
                    </div>
                  </td>
                  <td className="">
                    <div className="flex justify-center space-x-2">
                      <p className="text-th-green">
                        {formatDecimal(bank.getDepositRateUi(), 2, {
                          fixed: true,
                        })}
                        %
                      </p>
                      <span className="text-th-fgd-4">|</span>
                      <p className="text-th-red">
                        {formatDecimal(bank.getBorrowRateUi(), 2, {
                          fixed: true,
                        })}
                        %
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className="text-center">
                      <p>{bank.initAssetWeight.toFixed(2)}</p>
                    </div>
                  </td>
                  <td>
                    <div className="text-center">
                      <p>{bank.initLiabWeight.toFixed(2)}</p>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <div className="mt-4 space-y-2">
          {banks.map(({ key, value }) => {
            const bank = value[0]
            const oraclePrice = bank.uiPrice
            let logoURI
            if (jupiterTokens.length) {
              logoURI = jupiterTokens.find(
                (t) => t.address === bank.mint.toString()
              )!.logoURI
            }
            return (
              <div key={key} className="rounded-md border border-th-bkg-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2.5 flex flex-shrink-0 items-center">
                      {logoURI ? (
                        <Image alt="" width="24" height="24" src={logoURI} />
                      ) : (
                        <QuestionMarkCircleIcon className="h-7 w-7 text-th-fgd-3" />
                      )}
                    </div>
                    <div>
                      <p>{bank.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IconButton
                      onClick={() => handleShowTokenDetails(bank.name)}
                    >
                      <ChevronDownIcon
                        className={`${
                          showTokenDetails === bank.name
                            ? 'rotate-180'
                            : 'rotate-360'
                        } h-6 w-6 flex-shrink-0 text-th-fgd-1`}
                      />
                    </IconButton>
                  </div>
                </div>
                <Transition
                  appear={true}
                  show={showTokenDetails === bank.name}
                  as={Fragment}
                  enter="transition ease-in duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition ease-out"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-th-bkg-3 pt-4">
                    <div className="col-span-1">
                      <p className="text-xs text-th-fgd-3">{t('price')}</p>
                      <p className="font-bold">
                        ${formatDecimal(oraclePrice, 2)}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-th-fgd-3">{t('rates')}</p>
                      <p className="space-x-2 font-bold">
                        <span className="text-th-green">
                          {formatDecimal(bank.getDepositRate().toNumber(), 2)}%
                        </span>
                        <span className="font-normal text-th-fgd-4">|</span>
                        <span className="text-th-red">
                          {formatDecimal(bank.getBorrowRate().toNumber(), 2)}%
                        </span>
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-th-fgd-3">{t('liquidity')}</p>
                      <p className="font-bold">
                        {formatDecimal(
                          bank.uiDeposits() - bank.uiBorrows(),
                          bank.mintDecimals
                        )}
                      </p>
                    </div>
                  </div>
                </Transition>
              </div>
            )
          })}
        </div>
      )}
    </ContentBox>
  )
}

export default TokenList