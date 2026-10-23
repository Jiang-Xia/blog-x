/**
 * Tabler 图标字体加载
 * - App / Web：styles/x-base.css 的 @font-face 本地 /static/fonts
 * - 微信小程序：WXSS 不支持本地字体，须 uni.loadFontFace + 自建 HTTPS
 * 字体版本须与 components/x-icon/icons.ts 头注释一致；勿用国外 CDN（不稳）
 */

/** 线性 Tabler（上传至 blog-server static） */
const TABLER_ICONS_URL =
	'https://jiang-xia.top/x-api/blog-server/static/uploads/2026-10/28193d11434442f9b0a696ff9a29fa4c-tabler-icons.ttf'

/**
 * 面性 Tabler：上传 filled 后把完整 HTTPS 地址填到这里；空串则跳过加载
 * （当前仅上传了线性包；面性图标会回退线性字形）
 */
const TABLER_ICONS_FILLED_URL = ''

/**
 * 加载单个字体族
 * @param family CSS font-family 名
 * @param url 完整 HTTPS 字体地址（须在微信 downloadFile 合法域名内）
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
 * 其它端为空操作
 */
export function loadTablerFonts(): void {
	// #ifdef MP-WEIXIN
	loadOne('tabler-icons', TABLER_ICONS_URL)
	loadOne('tabler-icons-filled', TABLER_ICONS_FILLED_URL)
	// #endif
}
