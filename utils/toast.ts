/**
 * 原型风格 Toast 辅助（图标名 + 标题 + 描述）
 * 本阶段用 uni.showToast 近似（原生 Toast 无法渲染 Tabler 字体）；页面也可挂载 x-toast
 */

/**
 * 弹出示意 Toast
 * @param _icon Tabler 图标名（保留参数，便于日后接自定义 x-toast；uni.showToast 不展示）
 * @param title 主标题
 * @param desc 副文案
 */
export function showXToast(_icon: string, title: string, desc: string = ''): void {
	const msg = desc.length > 0 ? title + ' · ' + desc : title
	uni.showToast({
		title: msg,
		icon: 'none',
		duration: 1800,
	})
}
