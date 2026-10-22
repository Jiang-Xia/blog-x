/**
 * 自定义 uni-tab（tab-bar-blur）导航工具
 * 替代 pages.json 原生 tabBar 的 uni.switchTab
 */

/** 首页 */
export const TAB_HOME = 0
/** 发现 */
export const TAB_DISCOVER = 1
/** 冒险 */
export const TAB_RPG = 2
/** 我的 */
export const TAB_ME = 3

/** 当前激活 Tab（模块单例，供壳页与 goTab 共享） */
export const tabActiveIndex = ref(TAB_HOME)

/**
 * 判断当前栈顶是否为主壳页 `pages/index/index`
 */
function isOnTabShell(): boolean {
	const pages = getCurrentPages()
	if (pages.length == 0) {
		return false
	}
	const cur = pages[pages.length - 1]
	const route = cur.route != null ? cur.route : ''
	return route == 'pages/index/index'
}

/**
 * 切到指定 Tab：已在壳页则只改索引；否则 reLaunch 清栈回壳
 * @param index 0 首页 / 1 发现 / 2 冒险 / 3 我的
 */
export function goTab(index: number): void {
	const next = index < TAB_HOME || index > TAB_ME ? TAB_HOME : index
	tabActiveIndex.value = next
	if (isOnTabShell()) {
		return
	}
	uni.reLaunch({ url: '/pages/index/index?tab=' + next })
}
