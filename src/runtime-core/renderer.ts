import { createComponentInstance, setupComponent } from "./component"


export function render(vnode, container) {
    // patch
    patch(vnode, container)
}

function patch(vnode, container) {

    // 会被递归调用，在这里会判断虚拟节点的类型，看看到底是component类型，还是一个element类型

    // 判断是不是 element，是就去处理element类型
    // processElement()

    // 去处理组件
    processComponent(vnode, container)

}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode)

    setupComponent(instance)
    setupRenderEffect(instance, container)
}
function setupRenderEffect(instance: any, container) {
    const subTree = instance.render()

    // vnode -> patch; 基于返回的虚拟节点去进一步的调用patch，
    // 现在我们已经知道虚拟节点是 element 类型，下一步就是把element挂载出来
    // vnode -> element -> mountElement
    patch(subTree, container)
}

