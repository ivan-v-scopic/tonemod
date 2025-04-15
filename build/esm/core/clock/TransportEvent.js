import { noOp } from "../util/Interface.js";
/**
 * TransportEvent is an internal class used by {@link TransportClass}
 * to schedule events. Do no invoke this class directly, it is
 * handled from within Tone.Transport.
 */
export class TransportEvent {
    /**
     * @param transport The transport object which the event belongs to
     */
    constructor(transport, opts) {
        /**
         * The unique id of the event
         */
        this.id = TransportEvent._eventId++;
        /**
         * The remaining value between the passed in time, and Math.floor(time).
         * This value is later added back when scheduling to get sub-tick precision.
         */
        this._remainderTime = 0;
        /**
         * Tracks the last time this event was invoked to prevent duplicate firings
         */
        this._lastInvokedTime = -Infinity;
        /**
         * The minimum time in seconds that must pass before allowing an event to be invoked again
         */
        this._dedupThreshold = 0.05; // 50ms threshold
        const options = Object.assign(TransportEvent.getDefaults(), opts);
        this.transport = transport;
        this.callback = options.callback;
        this._once = options.once;
        this.time = Math.floor(options.time);
        this._remainderTime = options.time - this.time;
    }
    static getDefaults() {
        return {
            callback: noOp,
            once: false,
            time: 0,
        };
    }
    /**
     * Get the time and remainder time.
     */
    get floatTime() {
        return this.time + this._remainderTime;
    }
    /**
     * Invoke the event callback.
     * @param  time  The AudioContext time in seconds of the event
     */
    invoke(time) {
        if (this.callback) {
            // Implement deduplication logic
            const now = this.transport.now();
            // Only invoke if sufficient time has passed since last invocation
            // or if this is the first invocation
            if (now - this._lastInvokedTime > this._dedupThreshold) {
                const tickDuration = this.transport.bpm.getDurationOfTicks(1, time);
                this.callback(time + this._remainderTime * tickDuration);
                this._lastInvokedTime = now;
                if (this._once) {
                    this.transport.clear(this.id);
                }
            }
        }
    }
    /**
     * Clean up
     */
    dispose() {
        this.callback = undefined;
        return this;
    }
}
/**
 * Current ID counter
 */
TransportEvent._eventId = 0;
//# sourceMappingURL=TransportEvent.js.map