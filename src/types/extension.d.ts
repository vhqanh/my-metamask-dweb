export interface TxRequest {
  from: string;
  to: string;
  value: string;
}

export interface MyExtension {
  sendTransaction: (tx: TxRequest) => Promise<string>;
}

export declare global {
  interface Window {
    myExtension: MyExtension;
  }
}
