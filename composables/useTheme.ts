/**
 * 主题状态：莫兰迪色系 + 明暗模式
 * - 持久化 uni.storage；冷启动 App.onLaunch → initTheme
 * - 副作用：写 CSS 变量（页面根 :style）、导航栏/窗口底色
 */
import {
	DEFAULT_MODE,
	DEFAULT_PALETTE,
	isThemeMode,
	isThemePaletteId,
	resolveThemeTokens,
	THEME_MODE_KEY,
	THEME_PALETTE_KEY,
	THEME_PALETTE_LIST,
	tokensToCssVars,
	type ThemeMode,
	type ThemePaletteId,
	type ThemeTokens,
} from '../constants/theme'

export {
	DEFAULT_MODE,
	DEFAULT_PALETTE,
	THEME_PALETTE_LIST,
	isThemeMode,
	isThemePaletteId,
	resolveThemeTokens,
	tokensToCssVars,
} from '../constants/theme'
export type { ThemeMode, ThemePaletteId, ThemePaletteMeta, ThemeTokens } from '../constants/theme'

/** 当前色系（模块单例，多页共享） */
const paletteId = ref<ThemePaletteId>(DEFAULT_PALETTE)
/** 当前明暗 */
const mode = ref<ThemeMode>(DEFAULT_MODE)
/** 是否已从 storage 初始化 */
let inited = false

/**
 * 从 storage 读取偏好（非法值回落默认）
 */
function readStored(): { palette: ThemePaletteId; mode: ThemeMode } {
	let palette: ThemePaletteId = DEFAULT_PALETTE
	let m: ThemeMode = DEFAULT_MODE
	try {
		const p = uni.getStorageSync(THEME_PALETTE_KEY)
		if (isThemePaletteId(p)) palette = p
	} catch (_) {}
	try {
		const raw = uni.getStorageSync(THEME_MODE_KEY)
		if (isThemeMode(raw)) m = raw
	} catch (_) {}
	return { palette, mode: m }
}

/**
 * 同步原生导航栏 / 窗口背景（二级页非 custom 导航时可见）
 */
function syncNativeChrome(tokens: ThemeTokens, isDark: boolean): void {
	try {
		uni.setNavigationBarColor({
			frontColor: isDark ? '#ffffff' : '#000000',
			backgroundColor: tokens.bg,
			animation: { duration: 0, timingFunc: 'easeIn' },
		})
	} catch (_) {}
	try {
		uni.setBackgroundColor({
			backgroundColor: tokens.bg,
			backgroundColorTop: tokens.bg,
			backgroundColorBottom: tokens.bg,
		})
	} catch (_) {}
}

/**
 * 应用当前 palette+mode：落盘 + 刷原生 chrome
 */
function applyCurrent(): void {
	const tokens = resolveThemeTokens(paletteId.value, mode.value)
	try {
		uni.setStorageSync(THEME_PALETTE_KEY, paletteId.value)
		uni.setStorageSync(THEME_MODE_KEY, mode.value)
	} catch (_) {}
	syncNativeChrome(tokens, mode.value === 'dark')
}

/**
 * 冷启动初始化（幂等）
 */
export function initTheme(): void {
	if (inited) {
		applyCurrent()
		return
	}
	const stored = readStored()
	paletteId.value = stored.palette
	mode.value = stored.mode
	inited = true
	applyCurrent()
}

/**
 * 设置莫兰迪色系
 */
export function setPalette(id: ThemePaletteId): void {
	if (!isThemePaletteId(id)) return
	paletteId.value = id
	applyCurrent()
}

/**
 * 设置明暗模式
 */
export function setMode(next: ThemeMode): void {
	if (!isThemeMode(next)) return
	mode.value = next
	applyCurrent()
}

/**
 * 切换明暗
 */
export function toggleMode(): void {
	mode.value = mode.value === 'dark' ? 'light' : 'dark'
	applyCurrent()
}

/**
 * 页面级主题 API（单例）
 * 根节点须 :style="themeCssVars"，子树才能继承 CSS 变量
 */
export function useTheme() {
	const tokens = computed((): ThemeTokens => {
		return resolveThemeTokens(paletteId.value, mode.value)
	})
	/** 挂到页面/主壳根 view */
	const themeCssVars = computed((): string => {
		return tokensToCssVars(tokens.value)
	})
	const isDark = computed((): boolean => mode.value === 'dark')
	const paletteMeta = computed(() => {
		const list = THEME_PALETTE_LIST
		for (let i = 0; i < list.length; i++) {
			if (list[i].id === paletteId.value) return list[i]
		}
		return list[0]
	})

	return {
		paletteId,
		mode,
		tokens,
		themeCssVars,
		isDark,
		paletteMeta,
		paletteList: THEME_PALETTE_LIST,
		setPalette,
		setMode,
		toggleMode,
		initTheme,
		/** 路由进入后补刷导航栏（页面 style 可能覆盖） */
		syncNativeChrome: () => {
			syncNativeChrome(tokens.value, mode.value === 'dark')
		},
	}
}
