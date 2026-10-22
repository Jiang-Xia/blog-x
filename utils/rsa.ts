/**
 * RSA 公钥加密（对齐 blog-home-nuxt utils/jsencrypt）
 * 网关 aes 封 key / 登录密码加密共用
 */
import { CryptoJS } from './lib/crypto-js'
import { JSEncrypt } from './lib/jsencrypt'
import { serverPublicKey } from './ssh'

/**
 * RSA 加密明文，默认输出 Hex 小写（与 Nest gateway 互通）
 * @param word 明文
 * @param pubKey PEM 公钥
 */
export function rsaEncrypt(word: string, pubKey: string = serverPublicKey): string {
	const encrypt = new JSEncrypt()
	encrypt.setPublicKey(pubKey)
	const encrypted = encrypt.encrypt(word) as string
	if (encrypted == null || encrypted === false || encrypted.length == 0) {
		throw new Error('RSA encrypt failed')
	}
	// jsencrypt 默认 Base64 → Hex 小写
	return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(encrypted)).toLowerCase()
}
