// global.d.ts
// 三斜线指令：直接引入user.d.ts，将其所有声明注入全局
/// <reference path="./user.d.ts" />

// 必须加这行！让文件成为模块，否则无法全局暴露（TS语法要求）
export { };