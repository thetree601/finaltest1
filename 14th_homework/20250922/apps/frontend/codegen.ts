// @ts-nocheck
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://main-practice.codebootcamp.co.kr/graphql",
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  generates: {
    "src/commons/graphql/": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;
