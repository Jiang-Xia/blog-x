/**
 * 国际算法套件（客户端）：AES-256-CBC + RSA 封 key + HMAC-SHA256
 * 与 Nest / Nuxt suite-aes 互通；密文 Hex 统一小写
 */
import { CryptoJS } from '../lib/crypto-js'
import { rsaEncrypt } from '../rsa'
import { hmacSha256Hex } from './hmac'
import { logTimingSince } from './log'
import type { GatewayCryptoSuite } from './types'

/**
 * RSA 公钥加密明文（symKey Hex 或登录密码），输出 Hex 小写
 */
function rsaPublicEncrypt(plainUtf8: string): string {
	const t0 = Date.now()
	const out = rsaEncrypt(plainUtf8).toLowerCase()
	logTimingSince('rsa publicEncrypt', t0)
	return out
}

/** AES-256-CBC 加密 → Hex 小写 */
function aesEncryptHex(plain: string, symKeyHex: string, ivHex: string): string {
	const t0 = Date.now()
	const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plain), CryptoJS.enc.Hex.parse(symKeyHex), {
		iv: CryptoJS.enc.Hex.parse(ivHex),
		padding: CryptoJS.pad.Pkcs7,
	})
	const out = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toLowerCase()
	logTimingSince('aes encrypt', t0)
	return out
}

/** AES-256-CBC 解密 */
function aesDecryptHex(cipherHex: string, symKeyHex: string, ivHex: string): string {
	const t0 = Date.now()
	const params = CryptoJS.lib.CipherParams.create({
		ciphertext: CryptoJS.enc.Hex.parse(cipherHex),
	})
	const out = CryptoJS.AES.decrypt(params, CryptoJS.enc.Hex.parse(symKeyHex), {
		iv: CryptoJS.enc.Hex.parse(ivHex),
		padding: CryptoJS.pad.Pkcs7,
	}).toString(CryptoJS.enc.Utf8)
	logTimingSince('aes decrypt', t0)
	return out
}

export const suiteAes: GatewayCryptoSuite = {
	alg: 'aes',
	symKeyBytes: 32,
	publicEncrypt: rsaPublicEncrypt,
	symEncrypt: aesEncryptHex,
	symDecrypt: aesDecryptHex,
	hmac: hmacSha256Hex,
}
