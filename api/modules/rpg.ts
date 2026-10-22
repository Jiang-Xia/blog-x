/**
 * RPG API（对齐 blog-home-uniapp / blog-home-nuxt api/rpg）
 */
import { get, post } from '../request'
import { mapLotteryCells, mapRankRows, mapRpgHero, mapRpgQuests } from '../adapters/rpg'
import type { LotteryCell, RankRow, RpgHero, RpgQuest } from '../../types/rpg'

/**
 * 拉取冒险中心英雄区（status + weather）
 */
export async function fetchRpgHero(): Promise<RpgHero> {
	const status = await get('/rpg/status')
	let weather: any = null
	try {
		weather = await get('/rpg/weather-buff', null, { silent: true })
	} catch (_) {
		weather = null
	}
	const hero = mapRpgHero(status, weather)
	try {
		const tickets = await get('/rpg/lottery/tickets', null, { silent: true })
		if (tickets != null) {
			const n =
				typeof tickets === 'number'
					? tickets
					: tickets.count != null
						? Number(tickets.count)
						: tickets.tickets != null
							? Number(tickets.tickets)
							: hero.lotteryTickets
			hero.lotteryTickets = n
		}
	} catch (_) {}
	return hero
}

/**
 * 签到信息（是否今日已签）
 */
export async function fetchSignInfo(): Promise<{ signedToday: boolean; streakDays: number }> {
	const res = await get('/rpg/sign-info', null, { silent: true })
	return {
		signedToday:
			res != null &&
			(res.signedToday === true || res.todaySigned === true || res.hasSigned === true),
		streakDays: res != null && res.signDays != null ? Number(res.signDays) : 0,
	}
}

/**
 * 每日签到
 */
export function rpgSignIn(): Promise<any> {
	return post('/rpg/sign')
}

/**
 * 我的任务
 */
export async function fetchMyQuests(): Promise<RpgQuest[]> {
	const res = await get('/rpg/my-quests')
	return mapRpgQuests(res)
}

/**
 * 领取任务
 */
export function claimQuest(questCode: string): Promise<any> {
	return post('/rpg/quest/claim', { questCode })
}

/**
 * 抽奖奖池
 */
export async function fetchLotteryPool(): Promise<LotteryCell[]> {
	const res = await get('/rpg/lottery/pool')
	return mapLotteryCells(res)
}

/**
 * 抽一次
 */
export function lotteryDraw(count = 1, currency: 'ticket' | 'currency' = 'ticket'): Promise<any> {
	return post('/rpg/lottery/draw', { count, currency })
}

/**
 * 排行榜
 */
export async function fetchLeaderboard(
	type: string = 'exp',
	limit = 20,
	period: string = 'week',
): Promise<RankRow[]> {
	const res = await get('/rpg/leaderboard', { type, limit, period })
	return mapRankRows(res)
}

/**
 * 充值下单
 */
export function createRpgRecharge(amountYuan: number): Promise<any> {
	return post('/rpg/recharge/create', { amountYuan })
}

/**
 * 充值状态轮询
 */
export function getRpgRechargeStatus(outTradeNo: string): Promise<any> {
	return get('/rpg/recharge/status', { out_trade_no: outTradeNo }, { silent: true })
}
