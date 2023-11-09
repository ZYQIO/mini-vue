import { createVNode } from "./vnode"

// render
export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先把所有的都转换成 vnode
                // component --> vnode
                // 所有的逻辑操作都会基于 vnode(虚拟节点)
                const vnode = createVNode(rootComponent)

                render(vnode, rootContainer)
            }
        }
    }
}
