export interface RequestObj {
  name: string;
  content: string;
}

export interface MyExtension {
  open: (data: RequestObj) => void;
  waitForResponse: () => Promise<string>;
}

export declare global {
  interface Window {
    myExtension: MyExtension;
  }
}
