declare module 'paynow' {
  export class Paynow {
    constructor(integrationId: string, integrationKey: string)
    resultUrl: string
    returnUrl: string
    createPayment(reference: string, email: string): Payment
    send(payment: Payment): Promise<InitResponse>
    pollTransaction(pollUrl: string): Promise<StatusResponse>
  }

  export class Payment {
    add(description: string, amount: number): void
  }

  export interface InitResponse {
    success: boolean
    redirectUrl?: string
    pollUrl?: string
    error?: string
  }

  export interface StatusResponse {
    paid(): boolean
    status: string
    reference: string
    amount: string
  }
}
