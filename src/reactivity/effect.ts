import { extend } from "../shared";


let activeEffect;
let shouleTrack;
class ReactiveEffect {
    private _fn: any;
    // deps: any[];
    scheduler: Function | undefined;
    deps: any[] = []; // 添加初始值
    active = true;
    onStop?: () => void;
    constructor(fn, scheduler?: Function | undefined) {
        this._fn = fn;

        this.scheduler = scheduler;
    }

    run() {
        if (!this.active) {
            return this._fn()
        }

        shouleTrack = true
        activeEffect = this;

        const result = this._fn();

        // reset 
        shouleTrack = false;

        return result;
    }

    stop() {
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false;
        }
    }
}

function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect)
    });

    effect.deps.length = 0
}

const targetMap = new Map()
export function track(target, key) {
    if (!isTracking()) return;

    // target -> key -> deo
    let depsMap = targetMap.get(target)

    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }


    trackEffects(dep);
}

export function trackEffects(dep: any) {
    // 如果已经在dep中，那么不需要重复收集
    if (dep.has(activeEffect)) return;

    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}

export function isTracking() {
    return shouleTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)

    triggerEffects(dep);
}

export function triggerEffects(dep: any) {
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

export function effect(fn, options: any = {}) {

    const _effect = new ReactiveEffect(fn, options.scheduler);

    extend(_effect, options)

    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner._effect = _effect;

    return runner;
}

export function stop(runner) {
    runner._effect.stop()
}