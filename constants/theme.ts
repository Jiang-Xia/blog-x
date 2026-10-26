/**
 * blog-x 莫兰迪主题令牌
 * - 6 套简约色系 × 亮/暗两套中性色
 * - 页面通过 useTheme 写入 CSS 变量；样式用 var(--x-*, fallback)
 */

/** 色系 id（存储键） */
export type ThemePaletteId =
	| 'mint'
	| 'haze'
	| 'blush'
	| 'oat'
	| 'lilac'
	| 'apricot'

/** 明暗模式 */
export type ThemeMode = 'light' | 'dark'

/** 单套完整色板（与 CSS 变量一一对应） */
export type ThemeTokens = {
	bg: string
	bg2: string
	surface: string
	ink: string
	ink2: string
	ink3: string
	line: string
	accent: string
	accentDeep: string
	accentTint: string
	peach: string
	lavender: string
	sky: string
	warm: string
	warmTint: string
	danger: string
	/** 深色底上的反色文字（按钮/chip-dark） */
	onInk: string
	/** 悬浮底栏半透明底 */
	tabBarBg: string
	tabBarBorder: string
}

/** 色系元信息（选择器展示） */
export type ThemePaletteMeta = {
	id: ThemePaletteId
	/** 中文名 */
	label: string
	/** 一句话描述 */
	desc: string
	/** 色点预览（一般取亮色 accent） */
	swatch: string
}

/** localStorage / uni.storage 键 */
export const THEME_PALETTE_KEY = 'blog_x_theme_palette'
export const THEME_MODE_KEY = 'blog_x_theme_mode'

/** 默认：青苔 + 浅色（对齐现有小卡） */
export const DEFAULT_PALETTE: ThemePaletteId = 'mint'
export const DEFAULT_MODE: ThemeMode = 'light'

/** 6 套常用简约莫兰迪色（选择器列表） */
export const THEME_PALETTE_LIST: ThemePaletteMeta[] = [
	{ id: 'mint', label: '青苔', desc: '低饱和青绿，清爽耐看', swatch: '#3db89a' },
	{ id: 'haze', label: '雾蓝', desc: '灰调雾霾蓝，冷静克制', swatch: '#6f8fad' },
	{ id: 'blush', label: '豆沙', desc: '雾粉豆沙，柔和温暖', swatch: '#c4908a' },
	{ id: 'oat', label: '燕麦', desc: '米杏燕麦，纸感中性', swatch: '#b89a72' },
	{ id: 'lilac', label: '藤紫', desc: '灰紫藤萝，安静文艺', swatch: '#9585b0' },
	{ id: 'apricot', label: '杏茶', desc: '焦糖杏橘，复古气色', swatch: '#d4a07a' },
]

/**
 * 亮色中性底（各色系共享纸感）
 * 强调色随 palette 变化
 */
const LIGHT_NEUTRAL: Pick<
	ThemeTokens,
	'bg' | 'bg2' | 'surface' | 'ink' | 'ink2' | 'ink3' | 'line' | 'onInk' | 'tabBarBg' | 'tabBarBorder' | 'warmTint'
> = {
	bg: '#f4f1ec',
	bg2: '#ebe6df',
	surface: '#ffffff',
	ink: '#1c1a17',
	ink2: '#5c574f',
	ink3: '#9a948a',
	line: 'rgba(28, 26, 23, 0.06)',
	onInk: '#ffffff',
	tabBarBg: 'rgba(255, 255, 255, 0.82)',
	tabBarBorder: 'rgba(255, 255, 255, 0.7)',
	warmTint: '#ffe8d6',
}

/**
 * 暗色中性底：压饱和、抬字色，避免死黑
 */
const DARK_NEUTRAL: Pick<
	ThemeTokens,
	'bg' | 'bg2' | 'surface' | 'ink' | 'ink2' | 'ink3' | 'line' | 'onInk' | 'tabBarBg' | 'tabBarBorder' | 'warmTint'
> = {
	bg: '#161513',
	bg2: '#1e1c1a',
	surface: '#242220',
	ink: '#f0ebe3',
	ink2: '#c4bdb3',
	ink3: '#8a847a',
	line: 'rgba(240, 235, 227, 0.08)',
	onInk: '#ffffff',
	tabBarBg: 'rgba(36, 34, 32, 0.92)',
	tabBarBorder: 'rgba(240, 235, 227, 0.1)',
	warmTint: '#3a322c',
}

/** 各色系强调色（亮） */
const ACCENT_LIGHT: Record<
	ThemePaletteId,
	Pick<ThemeTokens, 'accent' | 'accentDeep' | 'accentTint' | 'peach' | 'lavender' | 'sky' | 'warm' | 'danger'>
> = {
	mint: {
		accent: '#3db89a',
		accentDeep: '#2a8f76',
		accentTint: 'rgba(61, 184, 154, 0.12)',
		peach: '#f0a07a',
		lavender: '#a99ad4',
		sky: '#7eb8e8',
		warm: '#f6d9a8',
		danger: '#e8897a',
	},
	haze: {
		accent: '#6f8fad',
		accentDeep: '#557491',
		accentTint: 'rgba(111, 143, 173, 0.14)',
		peach: '#d4a090',
		lavender: '#9aa3c4',
		sky: '#8eb4d4',
		warm: '#e8d5b5',
		danger: '#d4897e',
	},
	blush: {
		accent: '#c4908a',
		accentDeep: '#a6726c',
		accentTint: 'rgba(196, 144, 138, 0.14)',
		peach: '#e0a898',
		lavender: '#c4a8b8',
		sky: '#a8b8c8',
		warm: '#ecd4b8',
		danger: '#d08078',
	},
	oat: {
		accent: '#b89a72',
		accentDeep: '#96784f',
		accentTint: 'rgba(184, 154, 114, 0.16)',
		peach: '#d4a888',
		lavender: '#b0a498',
		sky: '#9ab0b8',
		warm: '#e8d4a8',
		danger: '#c88878',
	},
	lilac: {
		accent: '#9585b0',
		accentDeep: '#766694',
		accentTint: 'rgba(149, 133, 176, 0.14)',
		peach: '#d4a898',
		lavender: '#b8a8d0',
		sky: '#a0b0d0',
		warm: '#e4d4b8',
		danger: '#c88890',
	},
	apricot: {
		accent: '#d4a07a',
		accentDeep: '#b07e58',
		accentTint: 'rgba(212, 160, 122, 0.16)',
		peach: '#e0b090',
		lavender: '#c0a898',
		sky: '#a8b8c0',
		warm: '#f0d8a8',
		danger: '#d48878',
	},
}

/** 各色系强调色（暗：略提亮便于对比） */
const ACCENT_DARK: Record<
	ThemePaletteId,
	Pick<ThemeTokens, 'accent' | 'accentDeep' | 'accentTint' | 'peach' | 'lavender' | 'sky' | 'warm' | 'danger'>
> = {
	mint: {
		accent: '#5ecfb0',
		accentDeep: '#3db89a',
		accentTint: 'rgba(94, 207, 176, 0.16)',
		peach: '#e0a888',
		lavender: '#b8a8d8',
		sky: '#8ec0e8',
		warm: '#e0c890',
		danger: '#e89888',
	},
	haze: {
		accent: '#8aadc8',
		accentDeep: '#6f8fad',
		accentTint: 'rgba(138, 173, 200, 0.16)',
		peach: '#d8a898',
		lavender: '#a8b0d0',
		sky: '#98c0e0',
		warm: '#d8c498',
		danger: '#d89888',
	},
	blush: {
		accent: '#d4a8a0',
		accentDeep: '#c4908a',
		accentTint: 'rgba(212, 168, 160, 0.16)',
		peach: '#e8b8a8',
		lavender: '#d0b8c8',
		sky: '#b8c8d8',
		warm: '#e0c8a0',
		danger: '#e09890',
	},
	oat: {
		accent: '#d0b48c',
		accentDeep: '#b89a72',
		accentTint: 'rgba(208, 180, 140, 0.16)',
		peach: '#e0b898',
		lavender: '#c0b8a8',
		sky: '#a8c0c8',
		warm: '#e8d4a0',
		danger: '#d89888',
	},
	lilac: {
		accent: '#b0a0c8',
		accentDeep: '#9585b0',
		accentTint: 'rgba(176, 160, 200, 0.16)',
		peach: '#e0b8a8',
		lavender: '#c8b8e0',
		sky: '#b0c0e0',
		warm: '#e0d0a8',
		danger: '#d898a0',
	},
	apricot: {
		accent: '#e0b890',
		accentDeep: '#d4a07a',
		accentTint: 'rgba(224, 184, 144, 0.16)',
		peach: '#e8c0a0',
		lavender: '#d0b8a8',
		sky: '#b8c8d0',
		warm: '#f0dcb0',
		danger: '#e09888',
	},
}

/**
 * 是否合法色系 id
 */
export function isThemePaletteId(v: unknown): v is ThemePaletteId {
	return (
		v === 'mint' ||
		v === 'haze' ||
		v === 'blush' ||
		v === 'oat' ||
		v === 'lilac' ||
		v === 'apricot'
	)
}

/**
 * 是否合法明暗模式
 */
export function isThemeMode(v: unknown): v is ThemeMode {
	return v === 'light' || v === 'dark'
}

/**
 * 按色系 + 明暗拼完整令牌
 */
export function resolveThemeTokens(palette: ThemePaletteId, mode: ThemeMode): ThemeTokens {
	const neutral = mode === 'dark' ? DARK_NEUTRAL : LIGHT_NEUTRAL
	const accent = mode === 'dark' ? ACCENT_DARK[palette] : ACCENT_LIGHT[palette]
	return {
		bg: neutral.bg,
		bg2: neutral.bg2,
		surface: neutral.surface,
		ink: neutral.ink,
		ink2: neutral.ink2,
		ink3: neutral.ink3,
		line: neutral.line,
		onInk: neutral.onInk,
		tabBarBg: neutral.tabBarBg,
		tabBarBorder: neutral.tabBarBorder,
		warmTint: neutral.warmTint,
		accent: accent.accent,
		accentDeep: accent.accentDeep,
		accentTint: accent.accentTint,
		peach: accent.peach,
		lavender: accent.lavender,
		sky: accent.sky,
		warm: accent.warm,
		danger: accent.danger,
	}
}

/**
 * 令牌 → 内联 CSS 变量字符串（挂到页面根 view :style）
 * 子组件 var(--x-*) 可继承；App/小程序均支持
 */
export function tokensToCssVars(t: ThemeTokens): string {
	return (
		'--x-bg:' +
		t.bg +
		';--x-bg-2:' +
		t.bg2 +
		';--x-surface:' +
		t.surface +
		';--x-ink:' +
		t.ink +
		';--x-ink-2:' +
		t.ink2 +
		';--x-ink-3:' +
		t.ink3 +
		';--x-line:' +
		t.line +
		';--x-accent:' +
		t.accent +
		';--x-accent-deep:' +
		t.accentDeep +
		';--x-accent-tint:' +
		t.accentTint +
		';--x-peach:' +
		t.peach +
		';--x-lavender:' +
		t.lavender +
		';--x-sky:' +
		t.sky +
		';--x-warm:' +
		t.warm +
		';--x-warm-tint:' +
		t.warmTint +
		';--x-danger:' +
		t.danger +
		';--x-on-ink:' +
		t.onInk +
		';--x-tab-bar-bg:' +
		t.tabBarBg +
		';--x-tab-bar-border:' +
		t.tabBarBorder +
		';'
	)
}
