/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import Decimal from 'decimal.js'
import { RouteInfo } from 'types/jupiter'
import { MANGO_ROUTER_API_URL } from 'utils/constants'
import useJupiterSwapData from './useJupiterSwapData'

type SwapModes = 'ALL' | 'JUPITER' | 'MANGO'

type useQuoteRoutesPropTypes = {
  inputMint: string
  outputMint: string
  amount: string
  slippage: number
  swapMode: string
  wallet: string | undefined | null
  mode?: SwapModes
}

const fetchJupiterRoutes = async (
  inputMint = 'So11111111111111111111111111111111111111112',
  outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount = 0,
  slippage = 50,
  swapMode = 'ExactIn',
  feeBps = 0
) => {
  {
    const paramsString = new URLSearchParams({
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      amount: amount.toString(),
      slippageBps: Math.ceil(slippage * 100).toString(),
      feeBps: feeBps.toString(),
      swapMode,
    }).toString()

    const response = await fetch(
      `https://quote-api.jup.ag/v4/quote?${paramsString}`
    )

    const res = await response.json()
    const data = res.data

    return {
      routes: res.data as RouteInfo[],
      bestRoute: (data.length ? data[0] : null) as RouteInfo | null,
    }
  }
}

const fetchMangoRoutes = async (
  inputMint = 'So11111111111111111111111111111111111111112',
  outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount = 0,
  slippage = 50,
  swapMode = 'ExactIn',
  feeBps = 0,
  wallet = PublicKey.default.toBase58()
) => {
  {
    const defaultOtherAmount =
      swapMode === 'ExactIn' ? 0 : Number.MAX_SAFE_INTEGER

    const paramsString = new URLSearchParams({
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      amount: amount.toString(),
      slippage: ((slippage * 1) / 100).toString(),
      feeBps: feeBps.toString(),
      mode: swapMode,
      wallet: wallet,
      otherAmountThreshold: defaultOtherAmount.toString(),
    }).toString()

    const response = await fetch(`${MANGO_ROUTER_API_URL}/swap?${paramsString}`)

    const res = await response.json()
    const data: RouteInfo[] = res.map((route: any) => ({
      ...route,
      priceImpactPct: route.priceImpact,
      slippageBps: slippage,
      marketInfos: route.marketInfos.map((mInfo: any) => ({
        ...mInfo,
        lpFee: {
          ...mInfo.fee,
          pct: mInfo.fee.rate,
        },
      })),
      mints: route.mints.map((x: string) => new PublicKey(x)),
      instructions: route.instructions.map((ix: any) => ({
        ...ix,
        programId: new PublicKey(ix.programId),
        data: Buffer.from(ix.data, 'base64'),
        keys: ix.keys.map((key: any) => ({
          ...key,
          pubkey: new PublicKey(key.pubkey),
        })),
      })),
      routerName: 'Mango',
    }))
    return {
      routes: data,
      bestRoute: (data.length ? data[0] : null) as RouteInfo | null,
    }
  }
}

export const handleGetRoutes = async (
  inputMint = 'So11111111111111111111111111111111111111112',
  outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount = 0,
  slippage = 50,
  swapMode = 'ExactIn',
  feeBps = 0,
  wallet: string | undefined | null,
  mode: SwapModes = 'ALL'
) => {
  try {
    wallet ||= PublicKey.default.toBase58()
    const mangoRoute = fetchMangoRoutes(
      inputMint,
      outputMint,
      amount,
      slippage,
      swapMode,
      feeBps,
      wallet
    )
    const jupiterRoute = fetchJupiterRoutes(
      inputMint,
      outputMint,
      amount,
      slippage,
      swapMode,
      feeBps
    )

    const routes = []
    if (mode == 'ALL') {
      routes.push(mangoRoute)
      routes.push(jupiterRoute)
    }

    if (mode === 'MANGO') {
      routes.push(mangoRoute)
    }
    if (mode === 'JUPITER') {
      routes.push(jupiterRoute)
    }

    const results = await Promise.allSettled(routes)
    const responses = results
      .filter((x) => x.status === 'fulfilled' && x.value.bestRoute !== null)
      .map((x) => (x as any).value)

    const sortedByBiggestOutAmount = (
      responses as {
        routes: RouteInfo[]
        bestRoute: RouteInfo
      }[]
    ).sort(
      (a, b) => Number(b.bestRoute.outAmount) - Number(a.bestRoute.outAmount)
    )
    return {
      routes: sortedByBiggestOutAmount[0].routes,
      bestRoute: sortedByBiggestOutAmount[0].bestRoute,
    }
  } catch (e) {
    return {
      routes: [],
      bestRoute: null,
    }
  }
}

const useQuoteRoutes = ({
  inputMint,
  outputMint,
  amount,
  slippage,
  swapMode,
  wallet,
  mode = 'ALL',
}: useQuoteRoutesPropTypes) => {
  const { inputTokenInfo, outputTokenInfo } = useJupiterSwapData()

  const decimals =
    swapMode === 'ExactIn'
      ? inputTokenInfo?.decimals || 6
      : outputTokenInfo?.decimals || 6

  const nativeAmount =
    amount && !Number.isNaN(+amount)
      ? new Decimal(amount).mul(10 ** decimals)
      : new Decimal(0)

  const res = useQuery<
    { routes: RouteInfo[]; bestRoute: RouteInfo | null },
    Error
  >(
    ['swap-routes', inputMint, outputMint, amount, slippage, swapMode, wallet],
    async () =>
      handleGetRoutes(
        inputMint,
        outputMint,
        nativeAmount.toNumber(),
        slippage,
        swapMode,
        0,
        wallet,
        mode
      ),
    {
      cacheTime: 1000 * 60,
      staleTime: 1000 * 30,
      enabled: amount ? true : false,
      retry: 3,
    }
  )

  return amount
    ? {
        ...(res.data ?? {
          routes: [],
          bestRoute: undefined,
        }),
        isLoading: res.isLoading,
      }
    : {
        routes: [],
        bestRoute: undefined,
        isLoading: false,
      }
}

export default useQuoteRoutes
