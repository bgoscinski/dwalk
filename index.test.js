const rewire = require("rewire")
const index = rewire("./index")
const getDirents = index.__get__("getDirents")
// @ponicode
describe("getDirents", () => {
    test("0", () => {
        let callFunction = () => {
            getDirents(10, 10, "python")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            getDirents(0, 0, "C++")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            getDirents(-10, "bar", "javascript")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            getDirents(0, -1, "lua")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            getDirents("Ms.", "Ms.", "lua")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            getDirents(NaN, NaN, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
