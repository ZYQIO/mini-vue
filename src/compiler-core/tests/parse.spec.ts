import { describe, expect, it } from "vitest";
import { baseParse } from "../src/parse";
import { NodeTypes } from "../src/ast";


describe('Parse', () => {
    describe('interpolation', () => {
        it('simple interpolation', () => {
            const ast = baseParse("{{ message }}")

            // root
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content: 'message'
                }
            })
        })
    })
})


