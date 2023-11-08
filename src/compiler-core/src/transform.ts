export function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    // 1. 遍历 - 深度优先搜索
    traverseNode(root, context);

    // root.codegenNode
    createRootCodegen(root)

    // 2. 修改 text content

}

function createRootCodegen(root) {
    root.codegenNode = root.children[0]
}

function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
    }

    return context;
}

function traverseNode(node, context) {
    // 1. element
    const nodeTransforms = context.nodeTransforms;
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        transform(node)
    }

    taaverseChildren(node, context);

}
function taaverseChildren(node, context) {
    const children = node.children;

    if (children) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            traverseNode(node, context);
        }
    }
}
