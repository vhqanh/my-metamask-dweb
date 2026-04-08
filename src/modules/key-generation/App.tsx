import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Message,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@aioz-ui/core-v3/components";
import { SettingsIcon } from "@aioz-ui/icon-react";
import { useRef, useState } from "react";
import slip0044 from "../../assets/slip-0044.json";
import { STEP_DEFS } from "../../constant/key-generation";
import {
  deriveMnemonicToSeed,
  derivePath,
  digestKeyAndGenerateMnemonicPhrase,
  getAddressFromPrivateKey,
  getRandomEntropy,
  seedToMasterKey,
} from "../../lib/key-generation/key-generation";
import type {
  AccountItem,
  ChainRef,
  Slip0044Item,
  StepId,
} from "../../types/key-generation";

const KeyGenApp = () => {
  const [value, setValue] = useState("");
  const [selectedCoinType, setSelectedCoinType] = useState<number>(60);
  const [outputs, setOutputs] = useState<Partial<Record<StepId, string>>>({});
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const standards: Slip0044Item[] = slip0044;
  const selectedStandard: Slip0044Item = standards.find(
    (item) => item.coinType === selectedCoinType,
  ) ?? {
    coinType: 60,
    symbol: "ETH",
    name: "Ethereum",
  };
  const chainRef = useRef<ChainRef>({
    bytesByStep: {},
    textByStep: {},
    extendedByStep: {},
    nextChildIndex: 0,
  });

  const resetOutputs = () => {
    chainRef.current = {
      bytesByStep: {},
      textByStep: {},
      extendedByStep: {},
      nextChildIndex: 0,
    };
    setAccounts([]);
    setOutputs({});
  };

  const runStep = async (id: StepId) => {
    const passphrase = value.trim();

    if (id !== 1 && outputs[(id - 1) as StepId] === undefined) return;

    switch (id) {
      case 1: {
        const res = getRandomEntropy();
        chainRef.current.bytesByStep[1] = res.raw;
        setOutputs((p) => ({ ...p, 1: res.hex }));
        break;
      }
      case 2: {
        const prevRaw = chainRef.current.bytesByStep[1];
        if (!prevRaw) return;

        const phrase = await digestKeyAndGenerateMnemonicPhrase(prevRaw);
        if (phrase == null) return;

        chainRef.current.textByStep[2] = phrase;
        setOutputs((p) => ({ ...p, 2: phrase }));
        break;
      }
      case 3: {
        const mnemonic = chainRef.current.textByStep[2] ?? outputs[2] ?? "";
        if (!mnemonic) return;

        const seed = await deriveMnemonicToSeed(mnemonic, passphrase);
        if (!seed) return;

        chainRef.current.bytesByStep[3] = seed.raw;
        setOutputs((p) => ({ ...p, 3: seed.hex }));
        break;
      }
      case 4: {
        const seed = chainRef.current.bytesByStep[3];
        if (!seed) return;

        const result = await seedToMasterKey(seed);
        if (!result) return;

        chainRef.current.bytesByStep[4] = result.key.raw;
        chainRef.current.extendedByStep[4] = result;
        chainRef.current.nextChildIndex = 0;
        setOutputs((p) => ({ ...p, 4: result.key.hex }));
        break;
      }
      case 5:
      case 6: {
        const isStep5 = id === 5;
        const master = chainRef.current.extendedByStep[4];
        if (!master) return;

        const childIndex = isStep5 ? 0 : chainRef.current.nextChildIndex;
        const childPath = `m/44'/${selectedCoinType}'/0'/0/${childIndex}`;
        const child = await derivePath(master, childPath);
        if (!child) return;

        const address = getAddressFromPrivateKey(child.key.raw);
        chainRef.current.bytesByStep[id] = child.key.raw;
        chainRef.current.extendedByStep[id] = child;
        chainRef.current.nextChildIndex = childIndex + 1;

        const account: AccountItem = {
          index: childIndex,
          privateKey: child.key.hex,
          address,
        };

        if (isStep5) {
          setOutputs((p) => ({
            ...p,
            5: `${childPath} | ${child.key.hex} | ${address}`,
          }));
          setAccounts([account]);
        } else {
          setAccounts((prev) => [...prev, account]);
          setOutputs((p) => ({
            ...p,
            6: `Added account #${childIndex} (${childPath})`,
          }));
        }
        break;
      }
      default:
        break;
    }
  };

  const canRun = (id: StepId): boolean => {
    if (id === 1) return !!value;
    if (id === 6) return !!outputs[5];
    return !!outputs[(id - 1) as StepId];
  };

  const onInputChange = (next: string) => {
    setValue(next);
    resetOutputs();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <div className="text-title-neutral text-title-03 font-medium">
            MetaMask Demo - Key Generation
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="p-6 pb-0">
          <CardTitle>Input string</CardTitle>
          <CardDescription>
            Enter any string. Each step below is derived from that same string;
            run them in order to see the output in each card.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Input
              placeholder="Passphrase (optional)"
              value={value}
              onChange={(e) => onInputChange(e.target.value)}
            />
            <div className="space-y-1">
              <div className="text-caption-neutral text-caption-01">
                SLIP-0044 standard (optional)
              </div>
              <Select
                value={String(selectedCoinType)}
                onValueChange={(next) => {
                  const n = Number(next);
                  setSelectedCoinType(Number.isFinite(n) ? n : 60);
                  resetOutputs();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a coin type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Standards</SelectLabel>
                    {standards.map((item) => (
                      <SelectItem
                        showCheckIcon={false}
                        key={item.coinType}
                        value={String(item.coinType)}
                      >
                        {item.name} ({item.symbol}) - {item.coinType}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="text-caption-neutral text-caption-01">
                Using: {selectedStandard.name} ({selectedStandard.symbol})
                coin_type {selectedStandard.coinType}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {STEP_DEFS.map((step) => {
          const out = outputs[step.id];
          const enabled = canRun(step.id);

          return (
            <Card key={step.id} className="flex flex-col">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-base">
                  Step {step.id}: {step.name}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3 p-6 pt-0">
                <p className="text-caption-neutral text-caption-01">
                  {step.algorithm}
                </p>
                <Button
                  variant="neutral"
                  disabled={!enabled}
                  onClick={() => runStep(step.id)}
                >
                  {step.id === 6 ? "Add account" : `Run step ${step.id}`}
                </Button>
                {out !== undefined && (
                  <code className="break-all text-left text-xs">{out}</code>
                )}
                {step.id === 6 &&
                  accounts.map((account) => (
                    <Message
                      key={`${account.index}-${account.address}`}
                      className="w-full p-2 rounded-md"
                      variant="success"
                    >
                      <div className="text-xs break-all">
                        #{account.index}: {account.address} (
                        {account.privateKey})
                      </div>
                    </Message>
                  ))}
                {!enabled && value.trim() && step.id > 1 && (
                  <Message className="w-full p-2 rounded-md" variant="warning">
                    Run step {step.id - 1} first.
                  </Message>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default KeyGenApp;
