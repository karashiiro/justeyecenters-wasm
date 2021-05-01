import "./wasm_exec";
import jec from "./lib.wasm";

declare class Go {
    importObject: any;

    run(inst: WebAssembly.Instance): Promise<any>;
};

declare namespace __justeyecenters {
    function getEyeCenter(args: { image: string; bounds: { left: number; top: number; right: number; bottom: number; } }): Promise<string>;
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

let inst: WebAssembly.Instance;

const wasmLoad = jec()
    .then((instance: WebAssembly.Instance) => {
        inst = instance;
    })
    .catch(console.error);

const init = (async () => {
    await wasmLoad;
    await go.run(inst!);
})();

export async function getEyeCenter(frame: string, bounds: Rect): Promise<{ x: number; y: number; }> {
    await init;
    return JSON.parse(await __justeyecenters.getEyeCenter({
        image: frame,
        bounds,
    }));
}