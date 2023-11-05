import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";

export function createRenderer(options) {
    const {
        createElement,
        patchProp,
        insert
    } = options;

    function render(vnode, container) {
        // patch
        patch(vnode, container, null)
    }

    function patch(vnode, container, parentComponent) {
        
        const { type, shapeFlag } = vnode;

        // Fragment --> 只需要渲染 children 内容
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent)
                break;
            case Text:
                processText(vnode, container)
                break;

            default:
                // 改造后
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parentComponent)
                }
                break;
        }

    }

    function processText(vnode, container) {
        const { children } = vnode
        const textNode = vnode.el = document.createTextNode(children)
        container.append(textNode)
    }


    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent)
    }

    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }

    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = createElement(vnode.type))

        // string array
        const { children, props, shapeFlag } = vnode;

        // 改造后
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {

            el.textContent = children;
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // vnode
            mountChildren(vnode, el, parentComponent)
        }

        // props
        for (const key in props) {
            const val = props[key]
            // 具体的 click --> 重构成通用的
            // on + Event name
            // onMousedown
            patchProp(el, key, val)
        }

        // container.append(el)
        insert(el, container)
    }

    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(v, container, parentComponent)
        })
    }

    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }

    function mountComponent(initialVNode: any, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container)
    }
    function setupRenderEffect(instance: any, initialVNode, container) {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        // vnode -> patch; 基于返回的虚拟节点去进一步的调用patch，
        // 现在我们已经知道虚拟节点是 element 类型，下一步就是把element挂载出来
        // vnode -> element -> mountElement
        patch(subTree, container, instance)

        // element  -> mount
        initialVNode.el = subTree.el;
    }


    return {
        createApp: createAppAPI(render)
    }
}


