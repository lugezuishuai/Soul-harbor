/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_PATH: string;
  readonly VITE_SERVICE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
