const queue: any[] = [];
const activePreFlusCbs: any[] = [];
const p = Promise.resolve()
let isFlushPending = false;

export function nextTick(fn?) {
    return fn ? p.then(fn) : p;
}

export function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job)
    }

    queueFlush()
}

export function queuePreFlushCb(job) {
    activePreFlusCbs.push(job)

    queueFlush()
}

function queueFlush() {

    if (isFlushPending) return
    isFlushPending = true;

    nextTick(flushJobs)
}

function flushJobs() {
    isFlushPending = false;

    flushPreFlushCbs();

    // component render
    let job;
    while ((job = queue.shift())) {
        job && job();
    } 
}

function flushPreFlushCbs() {
    for (let i = 0; i < activePreFlusCbs.length; i++) {
        activePreFlusCbs[i]();
    }
}
