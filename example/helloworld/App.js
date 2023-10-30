import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
    // .vue
    // <template></template>
    // render

    // template 需要编译能力，暂时只实现 render

    render() {

        return h("div", "hi, " + this.msg)

    },

    setup() {
        // composition api

        return {
            msg: 'mini-vue'
        }
    }

}