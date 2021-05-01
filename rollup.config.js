import typescript from "@rollup/plugin-typescript";
import { wasm } from "@rollup/plugin-wasm";

const KILOBYTE = 1024;
const MEGABYTE = 1024 * KILOBYTE;

export default {
    input: "src/index.ts",
    output: {
        dir: "lib",
        format: "cjs",
    },
    // 99MB should never realistically be exceeded, but I'm including
    // this comment so that this line is brought to mind if it ever is.
    plugins:[typescript(), wasm({ maxFileSize: 99 * MEGABYTE })]
};
