// mini-vue 出口
export * from '@guide-mini-vue/runtime-dom'
import * as runtimeDom from '@guide-mini-vue/runtime-dom'
import { registerRuntimeCompiler } from '@guide-mini-vue/runtime-dom'
import { baseCompile } from '@guide-mini-vue/compiler-core'

function compileToFunction(template) {
    const { code } = baseCompile(template)

    const render = new Function('Vue', code)(runtimeDom)

    return render;

    // 例子：
    // const render = renderFunction()

    // function renderFunction(Vue) {
    //     const { toDisplayString: _toDisplayString, createElementVNode: _createElementVNode } = Vue

    //     return function render(_ctx, _cache) { return _createElementVNode('div', null, 'hi,' + _toDisplayString(_ctx.message)) }
    // }
}

registerRuntimeCompiler(compileToFunction)
