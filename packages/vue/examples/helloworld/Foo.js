import { h, getCurrentInstance } from '../../dist/guide-mini-vue.esm.js'

export const Foo = {
    name: 'Foo',
    setup(props) {
        const instance = getCurrentInstance()
        console.log('foo: ', instance);

        console.log(props);
        props.count++
        return {}
    },
    render() {
        return h("div", {}, "foo: " + this.count)
    }
}
