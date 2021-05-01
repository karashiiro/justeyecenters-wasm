import "./wasm_exec";
import jec from "./lib.wasm";

declare class Go {
    importObject: any;

    run(inst: WebAssembly.Instance): Promise<any>;
};

declare namespace __justeyecenters {
    function getEyeCenter(frame: string, left: number, top: number, right: number, bottom: number): Promise<string>;
};

export interface Rect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

if (!WebAssembly.instantiateStreaming) {
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

const go = new Go();

let inst: WebAssembly.Instance | undefined;
let mod: WebAssembly.Module | undefined;
const wasmLoad = jec()
    .then((wasmModule: WebAssembly.Module) => {
        mod = wasmModule;
    })
    .catch(console.error);

const init = (async () => {
    await wasmLoad;
    if (inst == null) {
        try {
            inst = await WebAssembly.instantiate(mod!, go.importObject);
            go.run(inst);
        } catch (err) {
            console.error(err);
        }
    }
})();

export async function getEyeCenter(frame: string, bounds: Rect): Promise<{ x: number; y: number; }> {
    await init;
    return JSON.parse(
        await __justeyecenters.getEyeCenter(frame, bounds.left, bounds.top, bounds.right, bounds.bottom)
    );
}