import typescript from "@rollup/plugin-typescript";
import { wasm } from "@rollup/plugin-wasm";

const KILOBYTE = 1024;

export default {
    input: "src/index.ts",
    output: {
        dir: "lib",
        format: "cjs",
    },
    // 999KB should never realistically be exceeded, but I'm including
    // this comment so that this line is brought to mind if it ever is.
    plugins:[typescript(), wasm({ maxFileSize: 999 * KILOBYTE })]
};
