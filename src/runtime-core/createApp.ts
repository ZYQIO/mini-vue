import { render } from "./renderer"
import { createVNode } from "./vnode"


export function createApp(rootComponent) {


    return {
        mount(rootContainer) {
            // 先把所有的都转换成 vnode
            // component --> vnode
            // 所有的逻辑操作都会基于 vnode(虚拟节点)

            const vnode = createVNode(rootComponent)

            render(vnode, rootContainer)

            // // 创建一个虚拟节点
            // const vnode = rootComponent.render()
            // // 创建一个真实节点
            // const realNode = document.createElement('div')
            // // 把虚拟节点转换成真实节点
            // render(vnode, realNode)
            // // 把真实节点挂载到el上
            // el.appendChild(realNode)
        }
    }
}


