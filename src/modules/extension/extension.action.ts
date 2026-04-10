export const extensionResponse = async () => {
  const ext = (window as Window).myExtension;
  if (!ext) throw new Error("My extension not found.");

  try {
    const result = await ext.waitForResponse();
    return result;
  } catch (error) {
    console.error((error as Error).message);
  }
};
