export interface ChromeCookie {
  domain: string
  expirationDate?: number
  hostOnly: boolean
  httpOnly: boolean
  name: string
  path: string
  sameSite: 'no_restriction' | 'lax' | 'strict'
  secure: boolean
  session: boolean
  storeId: string
  value: string
}
