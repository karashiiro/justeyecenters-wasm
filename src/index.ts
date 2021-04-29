import { Go } from "./wasm_exec";

if (!WebAssembly.instantiateStreaming) {
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

const go = new Go();

let mod: WebAssembly.Module;
let inst: WebAssembly.Instance;
WebAssembly.instantiateStreaming(fetch("lib.wasm"), go.importObject)
    .then((result) => {
        mod = result.module;
        inst = result.instance;
    })
    .catch(console.error);

export async function run() {
    await go.run(inst);
    inst = await WebAssembly.instantiate(mod, go.importObject);
}