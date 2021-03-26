export type Trade = {
  id: string
  ticker: string
  price: number
  type: 'BUY' | 'SELL'
  portfolio: string
}
