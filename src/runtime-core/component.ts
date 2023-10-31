import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandles } from "./componentPublicInstance";


export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { }
    }

    component.emit = emit.bind(null, component) as any;

    return component;
}

export function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props)
    // initSlots

    setupStatefulComponent(instance)

}

export function setupStatefulComponent(instance) {

    const Component = instance.type;

    // ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandles)
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
        })
        handleSetupResult(instance, setupResult)
    }

}

function handleSetupResult(instance, setupResult: any) {
    // function object
    // 基于上述两种情况作判断，

    // TODO function

    // 这里先只实现object这种情况
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }

    // 这里要保证组件的render是有值的
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;

    instance.render = Component.render
}
