import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";

export function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert
    } = options;

    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null)
    }

    // n1 --> 老的虚拟节点，如果n1不存在，那肯定就是一个初始化，反之，存在就是一个更新的逻辑
    // n2 --> 新的虚拟节点
    function patch(n1, n2, container, parentComponent) {

        const { type, shapeFlag } = n2;

        // Fragment --> 只需要渲染 children 内容
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break;
            case Text:
                processText(n1, n2, container)
                break;

            default:
                // 改造后
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent)
                }
                break;
        }

    }

    function processText(n1, n2, container) {
        const { children } = n2
        const textNode = n2.el = document.createTextNode(children)
        container.append(textNode)
    }


    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent)
    }

    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            // init
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container)
        }
    }

    function patchElement(n1, n2, container) {
        console.log('n1', n1);
        console.log('n2', n2);
        console.log('container', container);

        // props
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = n2.el = n1.el;

        patchProps(el, oldProps, newProps)
        // children

    }

    function patchProps(el, oldProps, newProps) {
        // 1. 遍历 props
        // 2. 对比 props
        // 3. 更新 props
        if (oldProps !== newProps) {
            for (let key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]
                if (prevProp !== nextProp) {
                    // 更新 props
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }

            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }

    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type))

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
            hostPatchProp(el, key, null, val)
        }

        // container.append(el)
        hostInsert(el, container)
    }

    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(null, v, container, parentComponent)
        })
    }

    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent)
    }

    function mountComponent(initialVNode: any, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container)
    }
    function setupRenderEffect(instance: any, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                // init

                const { proxy } = instance
                const subTree = instance.subTree = instance.render.call(proxy)
                // vnode -> patch; 基于返回的虚拟节点去进一步的调用patch，
                // 现在我们已经知道虚拟节点是 element 类型，下一步就是把element挂载出来
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance)

                // element  -> mount
                initialVNode.el = subTree.el;

                instance.isMounted = true
            } else {
                // update
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree;

                instance.subTree = subTree;

                patch(prevSubTree, subTree, container, instance)
            }

        })
    }


    return {
        createApp: createAppAPI(render)
    }
}


