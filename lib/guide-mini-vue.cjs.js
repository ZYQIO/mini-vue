'use strict';

const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps
    // initSlots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // setup 可以返回一个function， 也可以返回一个 object
        // 如果是一个函数，我们就认为它是我们组件的一个render函数，
        // 如果返回的是一个object , 会把返回的这个object对象给注入到当前组件的上下文中
        const setupResult = setup();
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
    debugger;
    // 会被递归调用，在这里会判断虚拟节点的类型，看看到底是component类型，还是一个element类型
    // 判断是不是 element，是就去处理element类型
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 去处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    // string array
    const { children, props } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // 这个数组中每一个都是虚拟节点，对于每一个虚拟节点则
        // 需要递归调用 patch ，判断到底是一个element 还是 componen 类型
        mountChildren(vnode, el);
    }
    // props
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
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
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    // vnode -> patch; 基于返回的虚拟节点去进一步的调用patch，
    // 现在我们已经知道虚拟节点是 element 类型，下一步就是把element挂载出来
    // vnode -> element -> mountElement
    patch(subTree, container);
}

function createVNode(type, props, children) {
    return {
        type,
        props,
        children
    };
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
