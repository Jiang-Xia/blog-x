/**
 * RPG 经济常量（与 blog-server constants/economy.ts / Nuxt rpg-economy 同步）
 * 仅用于 C 端展示保底进度与钻石单价，勿在前端硬编码魔法数字
 */

/** 史诗保底阈值（抽数） */
export const LOTTERY_EPIC_PITY_THRESHOLD = 90

/** 传说保底阈值（抽数） */
export const LOTTERY_LEGENDARY_PITY_THRESHOLD = 180

/** 钻石单抽消耗 */
export const LOTTERY_CURRENCY_COST = 10

/** 前端允许的最大连抽次数（与服务端 1～10 取交集，对齐 Nuxt 五连） */
export const LOTTERY_MAX_DRAW_COUNT = 5
