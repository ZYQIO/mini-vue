import { proxyRefs, shallowReadonly } from "@guide-mini-vue/reactivity";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandles } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";


export function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        next: null,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { }
    }

    component.emit = emit.bind(null, component) as any;

    return component;
}

export function setupComponent(instance) {

    initProps(instance, instance.vnode.props)

    initSlots(instance, instance.vnode.children)

    setupStatefulComponent(instance)
}

export function setupStatefulComponent(instance) {

    const Component = instance.type;

    // ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandles)

    const { setup } = Component;

    if (setup) {
        serCurrentInstance(instance)
        // setup 可以返回一个function， 也可以返回一个 object
        // 如果是一个函数，我们就认为它是我们组件的一个render函数，
        // 如果返回的是一个object , 会把返回的这个object对象给注入到当前组件的上下文中
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })

        serCurrentInstance(null)

        handleSetupResult(instance, setupResult)
    }

}

function handleSetupResult(instance, setupResult: any) {
    // function object
    // 基于上述两种情况作判断，

    // TODO function

    // 这里先只实现object这种情况
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult)
    }

    // 这里要保证组件的render是有值的
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;

    // template --> 编译
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template)
        }
    }

    instance.render = Component.render
}

let currentInstance = null
export function getCurrentInstance() {
    return currentInstance;
}

export function serCurrentInstance(instance) {
    currentInstance = instance;
}

let compiler;
export function registerRuntimeCompiler(_compiler) {
    compiler = _compiler
}
