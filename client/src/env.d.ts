interface ImportMetaEnv {
  readonly: string;
  readonly VITE_STRINGEE_API_KEY_SID: string;
  readonly VITE_STRINGEE_API_KEY_SECRET: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_STRINGEE_HOTLINE_NUMBER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
