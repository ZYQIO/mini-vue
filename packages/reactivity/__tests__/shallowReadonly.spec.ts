import { describe, it, expect, vi } from "vitest";
import { isReadonly, shallowReadonly } from "../src/reactive"

describe('shallowReadonly', () => {
    it('shoule not make non-reactive properties reactive', () => {
        const props = shallowReadonly({ n: { foo: 1 } })
        expect(isReadonly(props)).toBe(true)
        expect(isReadonly(props.n)).toBe(false)
    })

    it('shoule call console.warn when set', () => {
        console.warn = vi.fn()
        const user = shallowReadonly({
            age: 10
        })
        user.age = 11

        expect(console.warn).toHaveBeenCalled()
    })
})
