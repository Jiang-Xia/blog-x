/**
 * HTTP 加密网关客户端入口（与 Nest / Nuxt gateway-crypto 协议对齐）
 *
 * - 开关：api/config OPEN_ENCRYPT（是否走 /encrypt）
 * - 套件：api/config GATEWAY_CRYPTO=aes（须与 Nest app_gatewayCrypto 一致）
 * - 密文 / IV / encKey / sign 等 Hex 统一小写
 */
import { GATEWAY_CRYPTO } from '../../api/config'
import { CryptoJS } from '../lib/crypto-js'
import { bodyCanonical, keyOnlyCanonical, timingSafeEqualHex } from './hmac'
import { logTimingSince } from './log'
import { suiteAes } from './suite-aes'
import type {
	GatewayAlg,
	GatewayCryptoSuite,
	GatewayRequestEnvelope,
	GatewayResponseEnvelope,
	GatewaySession,
} from './types'
import { GATEWAY_HEADER } from './types'

export { GATEWAY_HEADER }
export type { GatewayAlg, GatewayRequestEnvelope, GatewayResponseEnvelope, GatewaySession }

/**
 * 读取前端网关套件（blog-x 当前仅 aes；配置为 gm 时仍回落 aes 并打日志）
 */
export function getGatewayAlg(): GatewayAlg {
	const raw = (GATEWAY_CRYPTO != null ? '' + GATEWAY_CRYPTO : 'aes').toLowerCase()
	if (raw == 'gm') {
		console.warn('[gateway-crypto] gm 尚未实现，回落 aes；请与 Nest app_gatewayCrypto=aes 对齐')
		return 'aes'
	}
	return 'aes'
}

/**
 * 获取当前套件实现
 */
export function getSuite(alg: GatewayAlg = getGatewayAlg()): GatewayCryptoSuite {
	return suiteAes
}

/** CSPRNG 生成 Hex 小写 */
function randomHex(byteLen: number): string {
	return CryptoJS.lib.WordArray.random(byteLen).toString(CryptoJS.enc.Hex).toLowerCase()
}

/**
 * 为有 JSON body 的请求生成网关信封，并返回会话（供解密响应）
 * @param plainBody 业务明文对象（将 JSON.stringify）
 */
export function createGatewayEnvelope(plainBody: any): {
	envelope: GatewayRequestEnvelope
	session: GatewaySession
} {
	const t0 = Date.now()
	const alg = getGatewayAlg()
	const suite = getSuite(alg)
	const symKeyHex = randomHex(suite.symKeyBytes)
	const iv = randomHex(16)
	const ts = Date.now()
	const content = suite.symEncrypt(JSON.stringify(plainBody), symKeyHex, iv)
	const sign = suite.hmac(symKeyHex, bodyCanonical(iv, content, ts))
	const encKey = suite.publicEncrypt(symKeyHex)
	logTimingSince('createGatewayEnvelope(' + alg + ') total', t0)
	return {
		envelope: { alg, encKey, iv, content, ts, sign },
		session: { alg, symKeyHex },
	}
}

/**
 * 无 JSON body（GET/DELETE）时生成请求头 + 会话
 */
export function createGatewayKeyHeaders(): {
	headers: Record<string, string>
	session: GatewaySession
} {
	const t0 = Date.now()
	const alg = getGatewayAlg()
	const suite = getSuite(alg)
	const symKeyHex = randomHex(suite.symKeyBytes)
	const ts = Date.now()
	const encKey = suite.publicEncrypt(symKeyHex)
	const sign = suite.hmac(symKeyHex, keyOnlyCanonical(ts))
	logTimingSince('createGatewayKeyHeaders(' + alg + ') total', t0)
	const headers: Record<string, string> = {}
	headers[GATEWAY_HEADER.alg] = alg
	headers[GATEWAY_HEADER.encKey] = encKey
	headers[GATEWAY_HEADER.ts] = '' + ts
	headers[GATEWAY_HEADER.sign] = sign
	return {
		headers,
		session: { alg, symKeyHex },
	}
}

/**
 * 验签并解密响应信封（用 session.symKeyHex + 响应里的新 iv）
 */
export function openGatewayEnvelope(payload: GatewayResponseEnvelope, session: GatewaySession): any {
	const t0 = Date.now()
	if (payload == null || payload.content == null || payload.iv == null || payload.sign == null || payload.ts == null) {
		throw new Error('invalid gateway response envelope')
	}
	const alg = payload.alg != null ? payload.alg : session.alg
	const suite = getSuite(alg)
	const expect = suite.hmac(session.symKeyHex, bodyCanonical(payload.iv, payload.content, payload.ts))
	if (!timingSafeEqualHex(expect, '' + payload.sign)) {
		throw new Error('gateway response sign invalid')
	}
	const plain = suite.symDecrypt(payload.content, session.symKeyHex, payload.iv)
	logTimingSince('openGatewayEnvelope(' + alg + ') total', t0)
	return JSON.parse(plain)
}

/**
 * 按套件加密登录密码字段（aes→RSA），输出小写 Hex
 */
export function encryptLoginPassword(plainPassword: string): string {
	const t0 = Date.now()
	const alg = getGatewayAlg()
	const out = getSuite(alg).publicEncrypt(plainPassword)
	logTimingSince('encryptLoginPassword(' + alg + ')', t0)
	return out
}
