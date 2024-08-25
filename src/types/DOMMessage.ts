export enum DOMMessageType {
  GET_DOM,
  TOGGLE_EXTENSION_PAGE
}
export type RequestPayload = {
  type: DOMMessageType
  data: any
}

export type DOMMessageResponse = {
  title: string
  headlines: string[]
}
