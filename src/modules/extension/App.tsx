import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Message,
} from "@aioz-ui/core-v3/components";
import { SettingsIcon } from "@aioz-ui/icon-react";
import { useState } from "react";

interface Response {
  type: "success" | "error" | "default";
  detail: string;
}

const ExtensionDemo = () => {
  const [response, setResponse] = useState<Response>({
    type: "default",
    detail: "",
  });
  const [sendTo, setSendTo] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendTransaction = async () => {
    const ext = (window as Window).myExtension;
    if (!ext) throw new Error("My extension not found.");
    setLoading(true);
    try {
      const result = await ext.sendTransaction({
        from: "Junie",
        to: sendTo,
        value,
      });
      setResponse({
        type: "success",
        detail: result,
      });
    } catch (e) {
      setResponse({
        type: "error",
        detail: (e as Error).message,
      });
    } finally {
      setLoading(false);
      setValue("");
      setSendTo("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-5 w-5" />
        <div className="text-title-neutral text-title-03 font-medium">
          Extension Demo
        </div>
      </div>

      <Card>
        <CardHeader className="p-6 pb-0">
          <CardTitle>Extionsion Response</CardTitle>
          <CardDescription>
            Enter any string. Each step below is derived from that same string;
            run them in order to see the output in each card.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Send to address"
              value={sendTo ?? ""}
              onChange={(e) => setSendTo(e.target.value)}
            />
            <Input
              placeholder="Value in ETH"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={handleSendTransaction}
              disabled={!sendTo || !value || loading}
            >
              Send MTK
            </Button>

            {response && (
              <Message
                className="w-full justify-between"
                size="md"
                variant={response.type}
              >
                <div className="text-caption-neutral text-caption-01">
                  Respones from Extension: {response.detail}
                </div>
              </Message>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default ExtensionDemo;
