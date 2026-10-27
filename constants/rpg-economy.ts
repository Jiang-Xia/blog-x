/**
 * RPG 钻石充值经济常量与金额工具
 * 对齐 blog-home-nuxt/constants/rpg-economy.ts；下单参数 amountYuan 走 POST /rpg/recharge/create
 */

/** 充值汇率：1 元 = 100 钻石 */
export const RPG_RECHARGE_RATE = 100
export const RPG_RECHARGE_RATE_TEXT = '1 元 = 100 钻石'

/** 快捷充值面额（元） */
export const RPG_RECHARGE_AMOUNT_OPTIONS: number[] = [1, 5, 10, 50]

/** 自定义充值范围（元，最少 0.01，最多两位小数） */
export const RPG_RECHARGE_MIN_YUAN = 0.01
export const RPG_RECHARGE_MAX_YUAN = 200

/** 默认选中面额（元） */
export const RPG_RECHARGE_DEFAULT_AMOUNT = 5

/** 支付宝支付说明（App 侧复制链接打开） */
export const RPG_RECHARGE_ALIPAY_HINT = '下单后复制支付宝链接，在浏览器打开完成支付'

/**
 * 充值金额归一化到分（两位小数）
 */
export function normalizeRechargeYuan(amount: number): number {
	return Math.round(amount * 100) / 100
}

/**
 * 解析自定义充值输入；非法格式返回 null
 */
export function parseRechargeYuanInput(raw: string): number | null {
	const text = raw != null ? ('' + raw).trim() : ''
	if (text.length == 0) return null
	if (!/^\d+(\.\d{1,2})?$/.test(text)) return null
	const parsed = Number.parseFloat(text)
	if (!Number.isFinite(parsed)) return null
	return normalizeRechargeYuan(parsed)
}

/**
 * 金额比较用分，避免浮点误差
 */
export function isSameRechargeYuan(a: number, b: number): boolean {
	return normalizeRechargeYuan(a) === normalizeRechargeYuan(b)
}

/**
 * 按汇率计算预计到账钻石（整数）
 */
export function calcRechargeDiamonds(amountYuan: number): number {
	return Math.round(normalizeRechargeYuan(amountYuan) * RPG_RECHARGE_RATE)
}

/**
 * 是否在允许充值区间内
 */
export function isRechargeYuanInRange(amount: number): boolean {
	const normalized = normalizeRechargeYuan(amount)
	return normalized >= RPG_RECHARGE_MIN_YUAN && normalized <= RPG_RECHARGE_MAX_YUAN
}
