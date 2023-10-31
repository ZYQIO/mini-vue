'use strict';

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));
// 如果补齐数位, 就是以下的情况
// element = 1, // '0001'
// stateful_component = 1 << 1, // '0010'
// text_children = 1 << 2, // '0100'
// array_children = 1 << 3 // '1000'
// 0001
// 0100
// ------
// 0101
// 0001
// 1000
// ----
// 1001

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toLocaleUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : '';
};

const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 看看 res 是不是 object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`setter of ${key} is readonly`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

function emit(instance, event, ...args) {
    console.log('emit', event);
    const { props } = instance;
    // TPP
    // 先去写一个特定的行为, --> 然后重构成通用的行为
    // add -> Add
    // add-foo  -->  onAddFoo
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
};
const publicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // 优化前: 
        // // key --> $el
        // if (key === '$el') {
        //     return instance.vnode.el;
        // }
        // 优化后:
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
    // get({ _: instance }, key) {
    //     const { setupState, props } = instance
    //     // if (key in setupState) {
    //     //     return setupState[key]
    //     // }
    //     // if (hasOwn(setupState, key)) {
    //     //     return setupState[key]
    //     // } else if (hasOwn(props, key)) {
    //     //     return props[key]
    //     // }
    //     // // 优化前: 
    //     // // if (key === '$el') {
    //     // //     return instance.vnode.el
    //     // // }
    //     // // 优化后:
    //     // const publicGetter = publicPropertiesMap[key]
    //     // if (publicGetter) {
    //     //     return publicGetter(instance)
    //     // }
    //     // $data
    // }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    // initSlots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandles);
    // instance.proxy = new Proxy({}, {
    //     get(target, key) {
    //         const { setupState } = instance
    //         if (key in setupState) {
    //             return setupState[key]
    //         }
    //         // key --> $el
    //         if (key === '$el') {
    //             return instance.vnode.el;
    //         }
    //     },
    // })
    const { setup } = Component;
    if (setup) {
        // setup 可以返回一个function， 也可以返回一个 object
        // 如果是一个函数，我们就认为它是我们组件的一个render函数，
        // 如果返回的是一个object , 会把返回的这个object对象给注入到当前组件的上下文中
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function object
    // 基于上述两种情况作判断，
    // TODO function
    // 这里先只实现object这种情况
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    // 这里要保证组件的render是有值的
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    // patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // 会被递归调用，在这里会判断虚拟节点的类型，看看到底是component类型，还是一个element类型
    // 判断是不是 element，是就去处理element类型
    // // 改造前
    // if (typeof vnode.type === 'string') {
    //     processElement(vnode, container)
    // } else if (isObject(vnode.type)) {
    //     // 去处理组件
    //     processComponent(vnode, container)
    // }
    // 改造后
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    }
    else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 去处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    // string array
    const { children, props, shapeFlag } = vnode;
    // 改造前
    // if (typeof children === 'string') {
    //     el.textContent = children
    // } else if (Array.isArray(children)) {
    //     // 这个数组中每一个都是虚拟节点，对于每一个虚拟节点则
    //     // 需要递归调用 patch ，判断到底是一个element 还是 componen 类型
    //     mountChildren(vnode, el)
    // }
    // 改造后
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // vnode
        mountChildren(vnode, el);
    }
    // props
    for (const key in props) {
        const val = props[key];
        // 具体的 click --> 重构成通用的
        // on + Event name
        // onMousedown
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
    // document.body.appendChild(el)
}
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode -> patch; 基于返回的虚拟节点去进一步的调用patch，
    // 现在我们已经知道虚拟节点是 element 类型，下一步就是把element挂载出来
    // vnode -> element -> mountElement
    patch(subTree, container);
    // element  -> mount
    initialVNode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlg(type),
        el: null
    };
    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    return vnode;
}
function getShapeFlg(type) {
    return typeof type === 'string' ?
        ShapeFlags.ELEMENT :
        ShapeFlags.STATEFUL_COMPONENT;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先把所有的都转换成 vnode
            // component --> vnode
            // 所有的逻辑操作都会基于 vnode(虚拟节点)
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
            // // 创建一个虚拟节点
            // const vnode = rootComponent.render()
            // // 创建一个真实节点
            // const realNode = document.createElement('div')
            // // 把虚拟节点转换成真实节点
            // render(vnode, realNode)
            // // 把真实节点挂载到el上
            // el.appendChild(realNode)
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
