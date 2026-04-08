export type ChainRef = {
  bytesByStep: Partial<Record<StepId, ResultKey["raw"]>>;
  textByStep: Partial<Record<StepId, string>>;
  extendedByStep: Partial<Record<StepId, ExtendedPrivateKey>>;
  nextChildIndex: number;
};

export type AccountItem = {
  index: number;
  privateKey: string;
  address: string;
};

export type Slip0044Item = {
  coinType: number;
  symbol: string;
  name: string;
};

export interface ResultKey {
  raw: Uint8Array<ArrayBuffer>;
  hex: string;
}

export type ExtendedPrivateKey = {
  key: ResultKey;
  chainCode: ResultKey;
};

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export type StepDef = {
  id: StepId;
  name: string;
  description: string;
  algorithm: string;
};
