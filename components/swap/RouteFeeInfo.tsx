import { SwitchHorizontalIcon } from '@heroicons/react/solid'
import { RouteInfo, TransactionFeeInfo } from '@jup-ag/core'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import mangoStore from '../../store/state'
import { TokenInfo } from '../../types/jupiter'
import { formatDecimal } from '../../utils/numbers'

type RouteFeeInfoProps = {
  selectedRoute: RouteInfo
  amountIn: number
  amountOut: number
  outputTokenInfo: TokenInfo
  inputTokenSymbol: string
  showRoutesModal: () => void
}

const RouteFeeInfo = ({
  selectedRoute,
  amountIn,
  amountOut,
  outputTokenInfo,
  inputTokenSymbol,
  showRoutesModal,
}: RouteFeeInfoProps) => {
  const { t } = useTranslation(['common', 'trade'])
  const tokens = mangoStore.getState().jupiterTokens
  const connected = mangoStore((s) => s.connected)

  const [depositAndFee, setDepositAndFee] = useState<TransactionFeeInfo>()
  const [swapRate, setSwapRate] = useState<boolean>(false)
  const [feeValue, setFeeValue] = useState<number | null>(null)

  useEffect(() => {
    const getDepositAndFee = async () => {
      const fees = await selectedRoute?.getDepositAndFee()
      if (fees) {
        setDepositAndFee(fees)
      }
    }
    if (selectedRoute && connected) {
      getDepositAndFee()
    }
  }, [selectedRoute, connected])

  return (
    <div className="space-y-4 px-1">
      <div className="mb-4 flex items-center justify-between">
        <h3>{t('trade:review-trade')}</h3>
      </div>
      {/* <div className="flex items-center justify-between">
        <p className="text-th-fgd-3">{t('liquidity')}</p>
        <Button
          className="pt-1 pb-1 pl-3 pr-3"
          onClick={showRoutesModal}
          secondary
        >
          <p className="overflow-ellipsis whitespace-nowrap text-th-fgd-1">
            {selectedRoute?.marketInfos.map((info, index) => {
              let includeSeparator = false
              if (
                selectedRoute?.marketInfos.length > 1 &&
                index !== selectedRoute?.marketInfos.length - 1
              ) {
                includeSeparator = true
              }
              return (
                <p key={index}>{`${info.amm.label} ${
                  includeSeparator ? 'x ' : ''
                }`}</p>
              )
            })}
          </p>
        </Button>
      </div> */}
      {amountOut && amountIn ? (
        <div className="flex justify-between">
          <p className="text-th-fgd-3">{t('trade:rate')}</p>
          <div>
            <div className="flex items-center justify-end">
              <p className="text-right font-bold text-th-fgd-1">
                {swapRate ? (
                  <>
                    1 {inputTokenSymbol} ≈{' '}
                    {formatDecimal(amountOut / amountIn, 6)}{' '}
                    {outputTokenInfo?.symbol}
                  </>
                ) : (
                  <>
                    1 {outputTokenInfo?.symbol} ≈{' '}
                    {formatDecimal(amountIn / amountOut, 6)} {inputTokenSymbol}
                  </>
                )}
              </p>
              <SwitchHorizontalIcon
                className="default-transition ml-1 h-4 w-4 cursor-pointer text-th-fgd-3 hover:text-th-fgd-2"
                onClick={() => setSwapRate(!swapRate)}
              />
            </div>
            {/* {tokenPrices?.outputTokenPrice && tokenPrices?.inputTokenPrice ? (
              <div
                className={`text-right ${
                  ((amountIn / amountOut -
                    tokenPrices?.outputTokenPrice /
                      tokenPrices?.inputTokenPrice) /
                    (amountIn / amountOut)) *
                    100 <=
                  0
                    ? 'text-th-green'
                    : 'text-th-red'
                }`}
              >
                {Math.abs(
                  ((amountIn / amountOut -
                    tokenPrices?.outputTokenPrice /
                      tokenPrices?.inputTokenPrice) /
                    (amountIn / amountOut)) *
                    100
                ).toFixed(1)}
                %{' '}
                <span className="text-th-fgd-4">{`${
                  ((amountIn / amountOut -
                    tokenPrices?.outputTokenPrice /
                      tokenPrices?.inputTokenPrice) /
                    (amountIn / amountOut)) *
                    100 <=
                  0
                    ? 'Cheaper'
                    : 'More expensive'
                } CoinGecko`}</span>
              </div>
            ) : null} */}
          </div>
        </div>
      ) : null}
      <div className="flex justify-between">
        <p className="text-th-fgd-3">{t('trade:minimum-received')}</p>
        {outputTokenInfo?.decimals ? (
          <p className="text-right font-bold text-th-fgd-1">
            {formatDecimal(
              selectedRoute?.outAmountWithSlippage /
                10 ** outputTokenInfo.decimals || 1,
              6
            )}{' '}
            {outputTokenInfo?.symbol}
          </p>
        ) : null}
      </div>
      <div className="flex justify-between">
        <p className="text-th-fgd-3">{t('trade:health-impact')}</p>
        <p className="text-right font-bold text-th-fgd-1">0%</p>
      </div>
      <div className="flex justify-between">
        <p className="text-th-fgd-3">{t('trade:est-liq-price')}</p>
        <p className="text-right font-bold text-th-fgd-1">N/A</p>
      </div>
      <div className="flex justify-between">
        <p className="text-th-fgd-3">{t('trade:slippage')}</p>
        <p className="text-right font-bold text-th-fgd-1">
          {selectedRoute?.priceImpactPct * 100 < 0.1
            ? '< 0.1%'
            : `~ ${(selectedRoute?.priceImpactPct * 100).toFixed(4)}%`}
        </p>
      </div>
      {typeof feeValue === 'number' ? (
        <div className="flex justify-between">
          <p className="text-th-fgd-3">{t('fee')}</p>
          <div className="flex items-center">
            <p className="text-right font-bold text-th-fgd-1">
              ≈ ${feeValue?.toFixed(2)}
            </p>
          </div>
        </div>
      ) : (
        selectedRoute?.marketInfos.map((info, index) => {
          const feeToken = tokens.find(
            (item) => item?.address === info.lpFee?.mint
          )
          return (
            <div className="flex justify-between" key={index}>
              <p className="text-th-fgd-3">
                {t('trade:fees-paid-to', {
                  route: info?.amm?.label,
                })}
              </p>
              {feeToken?.decimals && (
                <p className="text-right font-bold text-th-fgd-1">
                  {(
                    info.lpFee?.amount / Math.pow(10, feeToken.decimals)
                  ).toFixed(6)}{' '}
                  {feeToken?.symbol} ({info.lpFee?.pct * 100}%)
                </p>
              )}
            </div>
          )
        })
      )}
      {/* {connected ? (
        <>
          <div className="flex justify-between">
            <span>{t('swap:transaction-fee')}</span>
            <div className="text-right text-th-fgd-1">
              {depositAndFee
                ? depositAndFee?.signatureFee / Math.pow(10, 9)
                : '-'}{' '}
              SOL
            </div>
          </div>
          {depositAndFee?.ataDepositLength ||
          depositAndFee?.openOrdersDeposits?.length ? (
            <div className="flex justify-between">
              <div className="flex items-center">
                <span>{t('deposit')}</span>
                <Tooltip
                  content={
                    <>
                      {depositAndFee?.ataDepositLength ? (
                        <div>{t('need-ata-account')}</div>
                      ) : null}
                      {depositAndFee?.openOrdersDeposits?.length ? (
                        <div className="mt-2">
                          {t('swap:serum-requires-openorders')}{' '}
                          <a
                            href="https://docs.google.com/document/d/1qEWc_Bmc1aAxyCUcilKB4ZYpOu3B0BxIbe__dRYmVns/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t('swap:heres-how')}
                          </a>
                        </div>
                      ) : null}
                    </>
                  }
                  placement={'left'}
                >
                  <InformationCircleIcon className="ml-1.5 h-3.5 w-3.5 cursor-help text-th-primary" />
                </Tooltip>
              </div>
              <div>
                {depositAndFee?.ataDepositLength ? (
                  <div className="text-right text-th-fgd-1">
                    {depositAndFee?.ataDepositLength === 1
                      ? t('swap:ata-deposit-details', {
                          cost: (
                            depositAndFee?.ataDeposit / Math.pow(10, 9)
                          ).toFixed(5),
                          count: depositAndFee?.ataDepositLength,
                        })
                      : t('swap:ata-deposit-details_plural', {
                          cost: (
                            depositAndFee?.ataDeposit / Math.pow(10, 9)
                          ).toFixed(5),
                          count: depositAndFee?.ataDepositLength,
                        })}
                  </div>
                ) : null}
                {depositAndFee?.openOrdersDeposits?.length ? (
                  <div className="text-right text-th-fgd-1">
                    {depositAndFee?.openOrdersDeposits.length > 1
                      ? t('swap:serum-details_plural', {
                          cost: (
                            sum(depositAndFee?.openOrdersDeposits) /
                            Math.pow(10, 9)
                          ).toFixed(5),
                          count: depositAndFee?.openOrdersDeposits.length,
                        })
                      : t('swap:serum-details', {
                          cost: (
                            sum(depositAndFee?.openOrdersDeposits) /
                            Math.pow(10, 9)
                          ).toFixed(5),
                          count: depositAndFee?.openOrdersDeposits.length,
                        })}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null} */}
    </div>
  )
}

export default RouteFeeInfo