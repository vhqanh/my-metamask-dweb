import { CURVE_N } from "../../constant/key-generation";

export const encodeText = (value: string) => {
  const enc = new TextEncoder();
  return enc.encode(value);
};

export const toHex = (bytes: Uint8Array) => {
  return Array.from(bytes)
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
};

export const bytesToBinary = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join("");
};

export const bytesToBigInt = (bytes: Uint8Array): bigint => {
  const hex = toHex(bytes);
  return BigInt("0x" + hex);
};

export const bigIntTo32Bytes = (value: bigint): Uint8Array<ArrayBuffer> => {
  const hex = value.toString(16).padStart(64, "0");
  const out: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(32));
  for (let i = 0; i < 32; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

export const concatUint8Arrays = (...arrays: Uint8Array[]): Uint8Array => {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};

export const isZeroModuloCurveOrder = (value: bigint) => {
  return value % CURVE_N === 0n;
};

// Helper: serialize uint32 (big-endian)
export const ser32 = (i: number): Uint8Array => {
  const buf = new Uint8Array(4);
  buf[0] = (i >>> 24) & 0xff;
  buf[1] = (i >>> 16) & 0xff;
  buf[2] = (i >>> 8) & 0xff;
  buf[3] = i & 0xff;
  return buf;
};
