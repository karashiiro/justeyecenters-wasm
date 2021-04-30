import { Go } from "./wasm_exec";

declare namespace __justeyecenters {
    function getEyeCenter(image: string): Promise<string>;
};

if (!WebAssembly.instantiateStreaming) {
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

const go = new Go();

let mod: WebAssembly.Module;
let inst: WebAssembly.Instance;

const wasmLoad = WebAssembly.instantiateStreaming(fetch("lib.wasm"), go.importObject)
    .then((result) => {
        mod = result.module;
        inst = result.instance;
    })
    .catch(console.error);

const init = (async () => {
    await wasmLoad;
    await go.run(inst!);
    inst = await WebAssembly.instantiate(mod!, go.importObject);
})();

export async function getEyeCenter(image: string): Promise<any> {
    await init;
    return await __justeyecenters.getEyeCenter(image);
}