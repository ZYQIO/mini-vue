import { describe, it, expect } from "vitest";
import { add } from "../index";

describe('测试', () => {
    it('init', () => {
        // expect(1).toBe(1)
        expect(add(1, 1)).toBe(2)
    })
})
