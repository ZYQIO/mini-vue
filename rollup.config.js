// import pkg from './package.json' assert { type: "json" };
import typescript from '@rollup/plugin-typescript'

export default {
    input: './packages/vue/src/index.ts',
    output: [
        {
            format: "cjs",
            file: 'packages/vue/dist/guide-mini-vue.cjs.js'
        },
        {
            format: "es",
            file: "packages/vue/dist/guide-mini-vue.esm.js"
        }
    ],

    // rollup 打包时不支持识别ts, 需要用官方提供的插件 npm i @rollup/plugin-typescript
    plugins: [typescript()]
}

