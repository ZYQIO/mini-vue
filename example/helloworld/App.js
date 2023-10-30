import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
    // .vue
    // <template></template>
    // render

    // template 需要编译能力，暂时只实现 render

    render() {

        return h("div",
            {
                id: 'root',
                class: ['red', 'hard']
            },
            // "hi, " + this.msg
            // string
            // "hi, mini-vue" 
            // Array
            [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'mini-vue')]
        )

    },

    setup() {
        // composition api

        return {
            msg: 'mini-vue'
        }
    }

}