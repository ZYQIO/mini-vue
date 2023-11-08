import { describe, expect, it } from "vitest";
import { baseParse } from "../src/parse";
import { generate } from "../src/codegen";
import { transform } from "../src/transform";
import { transformExpression } from "../src/transforms/transformExpression";


describe('codegen', () => {
    it('string', () => {
        const ast = baseParse('hi')
        transform(ast)
        const { code } = generate(ast)

        console.log('code ------', code);


        // 快照 （string）
        // 1. 抓bug
        // 2. 有意更新快照
        expect(code).toMatchSnapshot()
    })

    it('interpolation', () => {
        const ast = baseParse('{{message}}')
        transform(ast, {
            nodeTransforms: [transformExpression]
        })
        const { code } = generate(ast)

        expect(code).toMatchSnapshot()
    })
})
