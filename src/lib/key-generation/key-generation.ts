import * as secp from "@noble/secp256k1";
import { keccak256 } from "viem";
import data from "../../assets/en.json";
import { HARDENED_OFFSET } from "../../constant/key-generation";
import type { ExtendedPrivateKey, ResultKey } from "../../types/key-generation";
import {
  bytesToBigInt,
  bytesToBinary,
  concatUint8Arrays,
  encodeText,
  isZeroModuloCurveOrder,
  ser32,
  toHex,
} from "./helpers";

const raw = Object.keys(data)[0];
const wordlist = raw.split("\n");

export const getRandomEntropy = (): ResultKey => {
  const byteLength = 128 / 8;
  const bytes = new Uint8Array(byteLength);
  self.crypto.getRandomValues(bytes);

  return {
    raw: bytes,
    hex: [...bytes].map((item) => item.toString(16).padStart(2, "0")).join(""),
  };
};

export const digestKeyAndGenerateMnemonicPhrase = async (
  entropy: Uint8Array,
) => {
  if (typeof window === "undefined") throw new Error("Window is undefined.");
  try {
    const entropyForDigest = new Uint8Array(entropy);

    const hashBuffer = await window.crypto.subtle.digest(
      "SHA-256",
      entropyForDigest,
    );
    const hashArray = new Uint8Array(hashBuffer);

    const checksumBits = (hashArray[0] >> 4).toString(2).padStart(4, "0");
    const entropyBits = bytesToBinary(entropyForDigest);

    const fullBits = entropyBits + checksumBits;

    const chunks: string[] = [];
    for (let i = 0; i < fullBits.length; i += 11) {
      chunks.push(fullBits.slice(i, i + 11));
    }

    const convertedChunks = chunks.map((item) => parseInt(item, 2));

    const wordArray = convertedChunks.map((item) => wordlist[item]);

    return wordArray.join(" ");
  } catch (error) {
    console.error(
      "Failed to generate mnemonic phrase: ",
      (error as Error).message,
    );
  }
};

//BIP-39
export const deriveMnemonicToSeed = async (
  twelveWords: string,
  password = "",
): Promise<ResultKey | undefined> => {
  if (typeof window === "undefined") return;
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encodeText(twelveWords.normalize("NFKD")),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const saltBytes = encodeText(("mnemonic" + password).normalize("NFKD"));
  const key = await window.crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 2048, hash: "SHA-512" },
    keyMaterial,
    512,
  );
  const result = new Uint8Array(key);
  return {
    raw: result,
    hex: toHex(result),
  };
};

const extendedKeyFromHmacSha512 = async (
  hmacKeyMaterial: Uint8Array,
  message: Uint8Array,
): Promise<ExtendedPrivateKey> => {
  const hmacKey = await window.crypto.subtle.importKey(
    "raw",
    new Uint8Array(hmacKeyMaterial),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );

  const hmacSignature = await window.crypto.subtle.sign(
    "HMAC",
    hmacKey,
    new Uint8Array(message),
  );

  const signView = new Uint8Array(hmacSignature);
  const leftView = signView.slice(0, 32);
  const rightView = signView.slice(32, 64);

  if (isZeroModuloCurveOrder(bytesToBigInt(leftView)))
    throw new Error("Master key invalid - entropy không hợp lệ với secp256k1");

  return {
    key: {
      raw: leftView,
      hex: toHex(leftView),
    },
    chainCode: {
      raw: rightView,
      hex: toHex(rightView),
    },
  };
};

// BIP-32
export const seedToMasterKey = async (
  seed: Uint8Array<ArrayBuffer>,
): Promise<ExtendedPrivateKey | undefined> => {
  if (typeof window === "undefined") return;
  const keyBytes = encodeText("Bitcoin seed");
  return extendedKeyFromHmacSha512(keyBytes, new Uint8Array(seed));
};

// BIP-44
export const deriveChildKey = async (
  parent: ExtendedPrivateKey,
  index: number,
): Promise<ExtendedPrivateKey | undefined> => {
  const { key: parentKey, chainCode: parentChainCode } = parent;

  let data: Uint8Array;
  if (index >= HARDENED_OFFSET) {
    data = concatUint8Arrays(
      new Uint8Array([0x00]),
      parentKey.raw,
      ser32(index),
    );
  } else {
    const publicKey = secp.getPublicKey(parentKey.raw);
    data = concatUint8Arrays(publicKey, ser32(index));
  }

  return extendedKeyFromHmacSha512(parentChainCode.raw, data);
};

export const derivePath = async (
  parent: ExtendedPrivateKey,
  path: string,
): Promise<ExtendedPrivateKey | undefined> => {
  if (!path.startsWith("m/")) {
    throw new Error(`Invalid derivation path: ${path}`);
  }
  let current = parent;
  const segments = path.split("/").slice(1);

  for (const seg of segments) {
    if (!seg) continue;
    if (seg === "m") continue;
    const hardened = seg.endsWith("'");
    const index = parseInt(seg.replace("'", ""), 10);
    if (Number.isNaN(index)) {
      throw new Error(`Invalid path segment: ${seg}`);
    }

    const childIndex = hardened ? index + HARDENED_OFFSET : index;

    const nextNode = await deriveChildKey(current, childIndex);
    if (nextNode) current = nextNode;
  }
  return current;
};

export const getAddressFromPrivateKey = (privateKey: Uint8Array): string => {
  const publicKey = secp.getPublicKey(privateKey, false);
  const publicKeyNoPrefix = publicKey.slice(1);
  const hash = keccak256(publicKeyNoPrefix);
  return "0x" + hash.slice(-40);
};
