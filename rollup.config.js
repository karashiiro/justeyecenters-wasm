import typescript from "@rollup/plugin-typescript";
import { wasm } from "@rollup/plugin-wasm";

export default {
    input: "src/index.ts",
    output: {
        dir: "lib",
        format: "cjs",
    },
    plugins:[typescript(), wasm()]
};
