/**
 * 网关 HMAC 与时间安全比较（aes 套件 HMAC-SHA256）
 */
import { CryptoJS } from '../lib/crypto-js'

/**
 * 常量时间比较两个 Hex 签名，防止时序旁路
 */
export function timingSafeEqualHex(a: string, b: string): boolean {
	const aa = (a != null ? a : '').toLowerCase()
	const bb = (b != null ? b : '').toLowerCase()
	if (aa.length != bb.length || aa.length == 0) {
		return false
	}
	let out = 0
	for (let i = 0; i < aa.length; i++) {
		out |= aa.charCodeAt(i) ^ bb.charCodeAt(i)
	}
	return out == 0
}

/**
 * HMAC-SHA256，密钥为对称 key 的原始字节（由 Hex 解码）
 */
export function hmacSha256Hex(symKeyHex: string, canonical: string): string {
	return CryptoJS.HmacSHA256(canonical, CryptoJS.enc.Hex.parse(symKeyHex))
		.toString(CryptoJS.enc.Hex)
		.toLowerCase()
}

/** 有密文时的签名规范串：iv & content & ts */
export function bodyCanonical(iv: string, content: string, ts: number | string): string {
	return iv + '&' + content + '&' + ts
}

/** 无密文（仅传 key）时的签名规范串：KEY&ts */
export function keyOnlyCanonical(ts: number | string): string {
	return 'KEY&' + ts
}
