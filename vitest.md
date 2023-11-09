

vitest 这个测试框架也支持全局导入，

先创建vitest.config.ts文件，然后配置：

vitest.config.ts
```js
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        globals: true,
    },
    // 配置后会有无法识别pnpm中引用包路径的问题，所以还需要配置一下别名
    // 比如无法识别这种 @guide-mini-vue/shared
    resolve: {
        alias: [
            {
                find: /@guide-mini-vue\/(\w*)/,
                replacement: path.resolve(__dirname, 'packages') + "/$1/src"
            }
        ]
    },
})
```