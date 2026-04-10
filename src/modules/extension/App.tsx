import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aioz-ui/core-v3/components";
import { SettingsIcon } from "@aioz-ui/icon-react";
import { useEffect, useState } from "react";
import { extensionResponse } from "./extension.action";

const requestOpenExtension = () => {
  const ext = (window as Window).myExtension;
  if (!ext) throw new Error("My extension not found.");
  ext.open({ name: "Junie", content: "Have a nice day." });
};

const ExtensionDemo = () => {
  const [response, setResponse] = useState("");

  useEffect(() => {
    let flag = false;
    const listenFromExtension = async () => {
      const res = await extensionResponse();
      if (res) setResponse(res);
    };

    listenFromExtension();

    return () => {
      flag = true;
    };
  }, []);

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
          <Button variant="primary" onClick={requestOpenExtension}>
            Open Extension
          </Button>
          <div className="text-caption-neutral text-caption-01">
            Respones from Extension: {response}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default ExtensionDemo;
