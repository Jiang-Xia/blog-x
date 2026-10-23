/**
 * Tabler 图标字体加载
 * - App / Web：styles/x-base.css 的 @font-face 本地 /static/fonts
 * - 微信小程序：**默认走 styles/tabler-mp.css 的 base64 内联子集**（subset-icons.py 生成，
 *   约 16KB，无网络依赖、无域名白名单、无 CDN 版本差）。
 *   本文件仅在需要退回「CDN 全量字体」时启用（USE_CDN_FALLBACK = true）。
 *
 * CDN 方案注意：BootCDN 3.44.0 与 icons.ts（3.49.0）有版本差，极新图标可能缺字形；
 * 自建 jiang-xia.top 需后端放行 CORS / Content-Type 后才可启用。
 */

/** true 时小程序端改用下方 HTTPS 全量字体（默认 false，用 base64 子集） */
const USE_CDN_FALLBACK = false

/** 国内 CDN：BootCDN tabler-icons@3.44.0 */
const TABLER_ICONS_URL =
	'https://cdn.bootcdn.net/ajax/libs/tabler-icons/3.44.0/fonts/tabler-icons.ttf'
const TABLER_ICONS_FILLED_URL =
	'https://cdn.bootcdn.net/ajax/libs/tabler-icons/3.44.0/fonts/tabler-icons-filled.ttf'

// 自建（后端 CORS / Content-Type 未放行前勿启用）：
// const TABLER_ICONS_URL =
// 	'https://jiang-xia.top/x-api/blog-server/static/uploads/2026-10/28193d11434442f9b0a696ff9a29fa4c-tabler-icons.ttf'
// const TABLER_ICONS_FILLED_URL = ''

// 备选国内：七牛 Staticfile（路径同 BootCDN）
// const TABLER_ICONS_URL =
// 	'https://cdn.staticfile.org/tabler-icons/3.44.0/fonts/tabler-icons.ttf'
// const TABLER_ICONS_FILLED_URL =
// 	'https://cdn.staticfile.org/tabler-icons/3.44.0/fonts/tabler-icons-filled.ttf'

/**
 * 加载单个字体族
 * @param family CSS font-family 名
 * @param url 完整 HTTPS 字体地址
 */
function loadOne(family: string, url: string): void {
	if (url.length == 0) {
		return
	}
	uni.loadFontFace({
		global: true,
		family: family,
		source: 'url("' + url + '")',
		success: () => {
			console.log('[tabler-font] loaded', family)
		},
		fail: (err) => {
			const msg = err != null && err.errMsg != null ? '' + err.errMsg : 'fail'
			console.warn('[tabler-font] load fail', family, msg)
		},
	})
}

/**
 * 微信小程序冷启动加载 Tabler 字体（须在 App.onLaunch 调用，global 才全局生效）
 * 默认空操作：字体已由 styles/tabler-mp.css base64 内联声明；
 * 仅 USE_CDN_FALLBACK = true 时走 HTTPS 全量字体（需配 downloadFile 合法域名）
 * 其它端为空操作
 */
export function loadTablerFonts(): void {
	// #ifdef MP-WEIXIN
	if (!USE_CDN_FALLBACK) {
		return
	}
	loadOne('tabler-icons', TABLER_ICONS_URL)
	loadOne('tabler-icons-filled', TABLER_ICONS_FILLED_URL)
	// #endif
}
