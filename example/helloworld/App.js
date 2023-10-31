import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js';

window.self = null
export const App = {
    name: 'App',
    // .vue
    // <template></template>
    // render

    // template 需要编译能力，暂时只实现 render
    render() {
        window.self = this;

        return h("div",
            {
                id: 'root',
                class: ['red', 'hard'],
                onClick() {
                    console.log('click');
                },
                onMousedown() {
                    console.log('onMousedown');
                }
            },
            [
                h('div', {}, 'hi,' + this.msg), 
                h(Foo, { count: 1 })
            ]
            // "hi, " + this.msg
            // string
            // "hi, mini-vue" 
            // Array
            // [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'mini-vue')]
        )

    },

    setup() {
        // composition api

        return {
            msg: 'mini-vue hahhah s234'
        }
    }

}