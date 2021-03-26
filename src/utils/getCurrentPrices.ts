export const getCurrentPrices = async (
  tickers: ReadonlyArray<string>
): Promise<{
  [ticker: string]: number
}> => {
  // INFO: magical function that returns the current prices of all tickers
  return tickers.reduce<Record<string, number>>((acc, curr) => {
    acc[curr] = 100
    return acc
  }, {})
}
