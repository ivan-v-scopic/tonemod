// import { version } from "../version.js";
import { hasAudioContext,
// theWindow,
 } from "./context/AudioContext.js";
import { Context } from "./context/Context.js";
import { DummyContext } from "./context/DummyContext.js";
import { OfflineContext } from "./context/OfflineContext.js";
import { isAudioContext, isOfflineAudioContext, } from "./util/AdvancedTypeCheck.js";
/**
 * This dummy context is used to avoid throwing immediate errors when importing in Node.js
 */
const dummyContext = new DummyContext();
/**
 * The global audio context which is getable and assignable through
 * getContext and setContext
 */
let globalContext = dummyContext;
/**
 * Returns the default system-wide {@link Context}
 * @category Core
 */
export function getContext() {
    if (globalContext === dummyContext && hasAudioContext) {
        setContext(new Context());
    }
    return globalContext;
}
/**
 * Set the default audio context
 * @param context
 * @param disposeOld Pass `true` if you don't need the old context to dispose it.
 * @category Core
 */
export function setContext(context, disposeOld = false) {
    if (disposeOld) {
        globalContext.dispose();
    }
    if (isAudioContext(context)) {
        globalContext = new Context(context);
    }
    else if (isOfflineAudioContext(context)) {
        globalContext = new OfflineContext(context);
    }
    else {
        globalContext = context;
    }
}
/**
 * Most browsers will not play _any_ audio until a user
 * clicks something (like a play button). Invoke this method
 * on a click or keypress event handler to start the audio context.
 * More about the Autoplay policy
 * [here](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio)
 * @example
 * document.querySelector("button").addEventListener("click", async () => {
 * 	await Tone.start();
 * 	console.log("context started");
 * });
 * @category Core
 */
export function start() {
    return globalContext.resume();
}
/**
 * Log Tone.js + version in the console.
 */
// if (theWindow && !theWindow.TONE_SILENCE_LOGGING) {
// 	let prefix = "v";
// 	if (version === "dev") {
// 		prefix = "";
// 	}
// 	const printString = ` * Tone.js ${prefix}${version} * DEV MODE * `;
// 	// eslint-disable-next-line no-console
// 	console.log(`%c${printString}`, "background: #000; color: #fff");
// }
//# sourceMappingURL=Global.js.map