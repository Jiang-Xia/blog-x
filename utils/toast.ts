/**
 * 原型风格 Toast 辅助（emoji + 标题 + 描述）
 * 本阶段用 uni.showToast 近似；页面也可挂载 x-toast 组件
 */

/**
 * 弹出示意 Toast
 * @param emoji 表情
 * @param title 主标题
 * @param desc 副文案
 */
export function showXToast(emoji: string, title: string, desc: string = ''): void {
	const msg = desc.length > 0 ? emoji + ' ' + title + ' · ' + desc : emoji + ' ' + title
	uni.showToast({
		title: msg,
		icon: 'none',
		duration: 1800,
	})
}
