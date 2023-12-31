import { describe, it, expect, vi } from "vitest";
import { computed } from "../src/computed"
import { reactive } from "../src/reactive"

describe('computed', () => {

    it('happy path', () => {
        const user = reactive({
            age: 1
        })

        const age = computed(() => {
            return user.age;
        })

        expect(age.value).toBe(1)
    })

    it('should computed lazily', () => {
        const value = reactive({
            foo: 1
        })

        const getter = vi.fn(() => {
            return value.foo
        })

        const cValue = computed(getter)

        // lazy
        expect(getter).not.toHaveBeenCalled()


        expect(cValue.value).toBe(1)
        expect(getter).toHaveBeenCalledTimes(1)

        // should not computed again
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(1)

        // should not computed until needed
        value.foo = 2 // trigger --> effect --> get 重新执行
        expect(getter).toHaveBeenCalledTimes(1)

        // not it should computed
        expect(cValue.value).toBe(2)
        expect(getter).toHaveBeenCalledTimes(2)

        // // should not computed again
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(2)
    })

})


