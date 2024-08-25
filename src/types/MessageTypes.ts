export enum eMsgReqType {
  storeUserId
}

export type eMsgReq = {
  type: eMsgReqType
  userId?: number
}

export enum iMsgReqType {
  fetchCertificateChain,
  sendUserActionInfo,
  fetchTestWebsites,
  frontEndRequestUserSaveSite,

  //for react ui
  siteDataRefresh,
  openNewTab,
  fetchCookieInfo
}

export type iMsgReq = {
  type: iMsgReqType
  webDomain?: string
  user_id?: string
  timestamp?: string
  event?: number
  url?: string
  comment: string
}
