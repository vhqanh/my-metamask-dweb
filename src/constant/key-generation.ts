import type { StepDef } from "../types/key-generation";

// CURVE_N is the order of the elliptic curve group used by secp256k1
export const CURVE_N = BigInt(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
);

export const HARDENED_OFFSET = 0x80000000;

export const STEP_DEFS: StepDef[] = [
  {
    id: 1,
    name: "Entropy",
    description:
      "Generate cryptographically secure random bytes (128-bit for 12-word mnemonic). This is the root randomness of the wallet.",
    algorithm: "entropy = crypto.getRandomValues(16 bytes)",
  },
  {
    id: 2,
    name: "Generate to 12 words",
    description:
      "Convert entropy to mnemonic using BIP39. Append checksum (first bits of SHA-256 of entropy), split into 11-bit groups, and map to wordlist.",
    algorithm:
      "entropy → SHA-256 → checksum → concat → split 11-bit → wordlist (BIP39)",
  },
  {
    id: 3,
    name: "Derive mnemonic to seed",
    description:
      "Convert mnemonic into seed using PBKDF2 with HMAC-SHA512. Optional passphrase adds extra security.",
    algorithm:
      "seed = PBKDF2(mnemonic, 'mnemonic'+passphrase, 2048, 64 bytes, HMAC-SHA512)",
  },
  {
    id: 4,
    name: "Master Private Key",
    description:
      "Generate master private key and chain code from seed using HMAC-SHA512. This is the root of the HD wallet tree.",
    algorithm:
      "I = HMAC-SHA512('Bitcoin seed', seed) → IL (master key), IR (chain code)",
  },
  {
    id: 5,
    name: "First child key + address",
    description:
      "Derive the first account/address using BIP44 path. Apply CKDpriv through each level, then generate public key and Ethereum address.",
    algorithm:
      "m/44'/coin_type'/0'/0/0 → CKDpriv → secp256k1 → keccak256 → address",
  },
  {
    id: 6,
    name: "Add account continuously",
    description:
      "Generate additional accounts by incrementing the address index. Each index produces a new private key and address from the same path root.",
    algorithm: "m/44'/coin_type'/0'/0/i (i = 0,1,2...)",
  },
];
