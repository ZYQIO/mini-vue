import { isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"


export function render(vnode, container) {
    // patch
    patch(vnode, container)
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

        processElement(vnode, container)

    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 去处理组件
        processComponent(vnode, container)
    }

}

function processElement(vnode, container) {
    mountElement(vnode, container)
}

function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type))

    // string array
    const { children, props, shapeFlag } = vnode

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
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // vnode
        mountChildren(vnode, el)
    }

    // props
    for (const key in props) {
        
        const val = props[key]
        // 具体的 click --> 重构成通用的
        // on + Event name
        // onMousedown

        const isOn = (key: string) => /^on[A-Z]/.test(key)

        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase()
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val)
        }
    }

    container.append(el)

    // document.body.appendChild(el)
}

function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container)
    })
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(initialVNode: any, container) {
    const instance = createComponentInstance(initialVNode)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
}
function setupRenderEffect(instance: any, initialVNode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)

    // vnode -> patch; 基于返回的虚拟节点去进一步的调用patch，
    // 现在我们已经知道虚拟节点是 element 类型，下一步就是把element挂载出来
    // vnode -> element -> mountElement
    patch(subTree, container)

    // element  -> mount
    initialVNode.el = subTree.el;
}

