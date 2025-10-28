// global.d.ts
export {};

declare global {
  interface Window {
    api: {
      close: () => void;
      minimize: () => void;
      maximize: () => void;
        devOps: () => void;
    };
  }
}
