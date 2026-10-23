/**
 * 将历史 emoji / 任意字符串规范为 Tabler 图标名（供 x-icon）
 * 已是合法图标名则原样返回；未知 emoji 回退 defaultName
 */

/** 常见 emoji → Tabler 名（联调兜底；新代码请直接写图标名） */
const EMOJI_TO_ICON: Record<string, string> = {
	'📗': 'book',
	'📚': 'books',
	'💰': 'coin',
	'🧩': 'puzzle',
	'📝': 'pencil',
	'📄': 'file',
	'💭': 'message-circle',
	'💬': 'message',
	'❤️': 'heart',
	'🤍': 'heart',
	'⭐': 'star',
	'☆': 'star',
	'🔔': 'bell',
	'🦊': 'paw',
	'✨': 'sparkles',
	'💎': 'diamond',
	'🪙': 'coin',
	'🐣': 'egg',
	'🎖️': 'medal',
	'🖼️': 'frame',
	'🎫': 'ticket',
	'☀️': 'sun',
	'✅': 'circle-check',
	'📌': 'pin',
	'🎁': 'gift',
	'🎰': 'dice',
	'🏆': 'trophy',
	'📅': 'calendar',
	'🎒': 'backpack',
	'🏷️': 'tag',
	'🔗': 'link',
	'👤': 'user',
	'🛡️': 'shield',
	'🚪': 'logout',
	'📥': 'inbox',
	'🔥': 'flame',
	'🌱': 'seedling',
	'🎉': 'confetti',
	'☕': 'coffee',
	'🗺️': 'map',
	'🔁': 'repeat',
	'↩': 'arrow-back',
	'🐉': 'dragon',
	'🐟': 'fish',
	'🙂': 'mood-smile',
	'🔐': 'lock',
	'⏳': 'hourglass',
	'⚠️': 'alert-triangle',
	'❌': 'circle-x',
	'📋': 'clipboard',
	'💳': 'credit-card',
	'🐾': 'paw',
	'👋': 'hand-stop',
	'✍️': 'writing',
	'🖼': 'photo',
	'⌫': 'eraser',
	'✓': 'check',
	'↩️': 'arrow-back',
	'⌂': 'home',
	'◎': 'compass',
	'✦': 'sparkles',
	'☺': 'user',
	'⌕': 'search',
	'👍': 'thumb-up',
	'📭': 'mailbox',
}

/**
 * 是否已是 Tabler 风格图标名（小写字母数字与连字符）
 */
function looksLikeIconName(s: string): boolean {
	if (s.length == 0 || s.length > 48) return false
	return /^[a-z][a-z0-9-]*$/.test(s)
}

/**
 * 规范为 x-icon 的 name
 * @param raw emoji、图标名或空
 * @param defaultName 无法识别时的默认图标
 */
export function toIconName(raw: string, defaultName: string = 'sparkles'): string {
	if (raw == null) return defaultName
	const s = ('' + raw).trim()
	if (s.length == 0) return defaultName
	if (looksLikeIconName(s)) return s
	const mapped = EMOJI_TO_ICON[s]
	if (mapped != null) return mapped
	return defaultName
}
