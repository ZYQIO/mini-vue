import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
    private _value: any;
    public dep;
    private _rawValue: any;
    public __v_isRef = true;
    constructor(value) {
        this._rawValue = value;
        this._value = convert(value)
        // value --> reactive
        // 1. 看看value是不是对象，如果是，用reactive包裹一下
        this.dep = new Set()
    }

    get value() {
        trackRefValue(this);
        return this._value


    }

    set value(newVal) {
        // 一定先去修改了 value 的值

        // newValue -> this._value
        // hasChanged
        // 对比的时候，注意可能是个对象
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = convert(newVal)

            triggerEffects(this.dep);
        };

    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}

export function ref(value) {
    return new RefImpl(value)
}

export function isRef(ref) {
    return !!ref.__v_isRef;
}

export function unRef(ref) {
    // 看看是不是一个ref对象，是就返回 ref 的 value
    return isRef(ref) ? ref.value : ref;
}
