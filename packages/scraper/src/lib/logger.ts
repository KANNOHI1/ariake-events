export const createLogger = () => {
  return (message: string) => {
    const stamp = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(`[${stamp}] ${message}`);
  };
};

