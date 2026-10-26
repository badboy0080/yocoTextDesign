import {
  clampGridN,
  gridRows,
  snapToGrid,
  clampBlock,
} from "../public/layout-grid.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(clampGridN(12) === 12, "默认 12");
assert(clampGridN(5) === 6, "下限 6");
assert(clampGridN(30) === 24, "上限 24");
assert(clampGridN(12.6) === 13, "四舍五入");
assert(clampGridN(NaN) === 12, "非法回默认");

assert(gridRows(12, 3, 4) === 16, "3:4 → M=16");
assert(gridRows(12, 1, 1) === 12, "1:1 → M=12");
assert(gridRows(12, 16, 9) === 7, "16:9 → M=7");
assert(gridRows(0, 3, 4) === 1, "M 至少 1");

const near = snapToGrid(4.1, 3.1, 12, 16);
assert(Math.abs(near.x - 0) < 1e-9 && Math.abs(near.y - 0) < 1e-9, "靠近 0 交点应吸附");
const pastHalf = snapToGrid(4.1, 3.2, 12, 16);
assert(Math.abs(pastHalf.y - 6.25) < 1e-9, "3.2 已过 16 行半格 3.125，吸到下一行");
const mid = snapToGrid(100 / 24 + 0.1, 0, 12, 16); // 略过半格中点偏右 → 下一列
assert(Math.abs(mid.x - 100 / 12) < 1e-6, "过半格吸到下一列");

const clamped = clampBlock(120, 120, 20, 20);
assert(clamped.x <= 99 && clamped.y <= 99, "拖出画布要钳住");
const corner = clampBlock(-50, -50, 20, 20);
assert(corner.x >= -19 && corner.y >= -19, "至少留可见一角");

console.log("check-layout-grid: ok");
