import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js';

window.self = null
export const App = {
    name: 'App',
    render() {
        // emit
        return h('div', {}, [h('div', {}, "App"), h(Foo, {
            // 和element注册事件一致， 开头都有一个 on + 'xxx'
            onAdd(a, b) {
                console.log('add 父组件接受子组件触发事件----', a, b);
            },

            onAddFoo(a, b) {
                console.log('add-foo 父组件接受子组件触发事件----', a, b);
            }
        })])

    },

    setup() {
        return {}
    }

}