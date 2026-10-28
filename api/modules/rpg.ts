/**
 * RPG API（对齐 blog-home-uniapp / blog-home-nuxt api/rpg）
 */
import { get, post } from '../request'
import {
	mapDrawResults,
	mapLotteryHistory,
	mapLotteryPool,
	mapRankRows,
	mapRpgHero,
	mapRpgQuests,
} from '../adapters/rpg'
import type {
	DrawResult,
	LotteryCurrency,
	LotteryPoolItem,
	LotteryRecord,
	RankRow,
	RpgHero,
	RpgQuest,
} from '../../types/rpg'
import { resolveStaticUrl } from '../../utils/static-url'

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
		// Nest：{ tickets: number }
		const tickets = await get('/rpg/lottery/tickets', null, { silent: true })
		if (tickets != null && tickets.tickets != null) {
			hero.lotteryTickets = Number(tickets.tickets)
		}
	} catch (_) {}
	return hero
}

/** 活动海报摘要（对齐 /rpg/activities/current） */
export type RpgActivityPoster = {
	code: string
	name: string
	description: string
	posterUrl: string
	activityType: string
	expBuffRate: number
}

/**
 * 当前活动概览 → 优先赛季海报，否则取限时第一条有海报的
 */
export async function fetchActivityPoster(): Promise<RpgActivityPoster | null> {
	try {
		const res = await get('/rpg/activities/current', null, { silent: true })
		if (res == null) return null
		const pick = (a: any): RpgActivityPoster | null => {
			if (a == null) return null
			const url = a.posterUrl != null ? ('' + a.posterUrl).trim() : ''
			return {
				code: a.code != null ? '' + a.code : '',
				name: a.name != null ? '' + a.name : '',
				description: a.description != null ? '' + a.description : '',
				posterUrl: url,
				activityType: a.activityType != null ? '' + a.activityType : '',
				expBuffRate: a.expBuffRate != null ? Number(a.expBuffRate) : 1,
			}
		}
		const season = pick(res.season)
		if (season != null && (season.posterUrl.length > 0 || season.name.length > 0)) {
			return season
		}
		const limited = res.limitedTime
		if (Array.isArray(limited)) {
			for (let i = 0; i < limited.length; i++) {
				const row = pick(limited[i])
				if (row != null && row.name.length > 0) return row
			}
		}
		return null
	} catch (_) {
		return null
	}
}

/** 签到摘要（对齐 Nest getSignInfo） */
export type SignInfoSummary = {
	signedToday: boolean
	/** 连续签到天数 */
	streakDays: number
	/** 累计签到天数 */
	totalSignDays: number
	/** YYYY-MM-DD，未签过为空 */
	lastSignDate: string
}

/**
 * 签到信息（Nest：signedToday / consecutiveSignDays / totalSignDays / lastSignDate）
 */
export async function fetchSignInfo(): Promise<SignInfoSummary> {
	const res = await get('/rpg/sign-info', null, { silent: true })
	const last = res != null && res.lastSignDate != null ? '' + res.lastSignDate : ''
	return {
		signedToday: res != null && res.signedToday === true,
		streakDays: res != null && res.consecutiveSignDays != null ? Number(res.consecutiveSignDays) : 0,
		totalSignDays: res != null && res.totalSignDays != null ? Number(res.totalSignDays) : 0,
		lastSignDate: last.length >= 10 ? last.substring(0, 10) : last,
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
 * 抽奖奖池（后台配置；含 iconUrl / 稀有度展示字段）
 */
export async function fetchLotteryPool(): Promise<LotteryPoolItem[]> {
	const res = await get('/rpg/lottery/pool')
	return mapLotteryPool(res)
}

/**
 * 执行抽奖（1～5 次前端常用；支付：ticket 券 / currency 钻石）
 * 副作用：扣券或钻石、写抽奖记录、推进保底
 */
export async function lotteryDraw(
	count = 1,
	currency: LotteryCurrency = 'ticket',
): Promise<DrawResult[]> {
	const res = await post('/rpg/lottery/draw', { count, currency })
	return mapDrawResults(res)
}

/**
 * 抽奖历史（需登录；分页 list）
 */
export async function fetchLotteryHistory(page = 1, pageSize = 20): Promise<LotteryRecord[]> {
	const res = await get('/rpg/lottery/history', { page, pageSize })
	return mapLotteryHistory(res)
}

/**
 * 排行榜（对齐 Nuxt getRpgLeaderboard；默认总榜 + 经验）
 * @param myUid 用于高亮「我」；0 不标记
 */
export async function fetchLeaderboard(
	type: string = 'exp',
	limit = 50,
	period: string = 'total',
	myUid: number = 0,
): Promise<RankRow[]> {
	const res = await get('/rpg/leaderboard', { type, limit, period })
	return mapRankRows(res, myUid, type)
}

/**
 * 钻石充值下单（支付宝；返回 outTradeNo + universalLink/scheme）
 * @param amountYuan 充值金额（元，0.01~200，最多两位小数）
 */
export function createRpgRecharge(amountYuan: number): Promise<any> {
	return post('/rpg/recharge/create', { amountYuan })
}

/**
 * 充值状态轮询（silent；PAID/fulfilled 后刷新余额）
 */
export function getRpgRechargeStatus(outTradeNo: string): Promise<any> {
	return get('/rpg/recharge/status', { out_trade_no: outTradeNo }, { silent: true })
}

/** 背包展示项（字段来自后端 enrich，勿本地 dict 回显） */
export type BagItem = {
	id: string
	itemCode: string
	quantity: number
	name: string
	itemType: string
	itemTypeLabel: string
	sourceLabel: string
	/** 后端 rpg_item_config.icon 键，无 iconUrl 时走 x-icon */
	icon: string
	/** 管理端上传图标 URL（/static/rpgAssets/itemIcon/*），有则优先图片 */
	iconUrl: string
	/** 管理端上传背景 URL（/static/rpgAssets/itemBg/*） */
	bgUrl: string
	/** 是否可穿戴（title / avatar_frame） */
	equippable: boolean
}

/** 当前装扮槽（code / pet 来自 loadout 嵌套 config，勿本地 map） */
export type BagLoadout = {
	titleCode: string
	titleName: string
	frameCode: string
	frameName: string
	/** 出战宠物实例 id，0 表示未出战 */
	petId: number
	petName: string
}

/** 我的宠物实例（字段来自 /rpg/pets enrich） */
export type BagPet = {
	id: number
	petCode: string
	name: string
	level: number
	/** 后端宠物配置 icon 键，无 iconUrl 时走 x-icon */
	icon: string
	/** 管理端上传图标 URL，有则优先图片 */
	iconUrl: string
	/** 管理端上传背景 URL */
	bgUrl: string
}

/**
 * 背包列表：GET /rpg/inventory → { items }
 */
export async function fetchInventory(itemType?: string): Promise<BagItem[]> {
	const query = itemType != null && itemType.length > 0 ? { itemType } : null
	const res = await get('/rpg/inventory', query)
	const arr = res != null && res.items != null ? res.items : []
	const list: BagItem[] = []
	for (let i = 0; i < arr.length; i++) {
		const row = arr[i]
		const cfg = row.config != null ? row.config : null
		const type = cfg != null && cfg.itemType != null ? '' + cfg.itemType : ''
		const equippable = type == 'title' || type == 'avatar_frame'
		list.push({
			id: row.id != null ? '' + row.id : '' + i,
			itemCode: row.itemCode != null ? '' + row.itemCode : '',
			quantity: row.quantity != null ? Number(row.quantity) : 1,
			name: cfg != null && cfg.name != null ? '' + cfg.name : row.itemCode != null ? '' + row.itemCode : '物品',
			itemType: type,
			itemTypeLabel: cfg != null && cfg.itemTypeLabel != null ? '' + cfg.itemTypeLabel : type.length > 0 ? type : '其他',
			sourceLabel: row.sourceLabel != null ? '' + row.sourceLabel : '',
			// 图标：iconUrl 优先，否则物品 icon 键走 x-icon
			icon:
				cfg != null && cfg.icon != null
					? '' + cfg.icon
					: 'gift',
			iconUrl:
				cfg != null && cfg.iconUrl != null && ('' + cfg.iconUrl).length > 0
					? resolveStaticUrl('' + cfg.iconUrl)
					: '',
			bgUrl:
				cfg != null && cfg.bgUrl != null && ('' + cfg.bgUrl).length > 0
					? resolveStaticUrl('' + cfg.bgUrl)
					: '',
			equippable,
		})
	}
	return list
}

/**
 * 装备栏详情：GET /rpg/loadout（Nest LoadoutDetailVo：titleCode + title / avatarFrame / pet）
 */
export async function fetchLoadout(): Promise<BagLoadout> {
	const res = await get('/rpg/loadout', null, { silent: true })
	if (res == null) {
		return { titleCode: '', titleName: '', frameCode: '', frameName: '', petId: 0, petName: '' }
	}
	const title = res.title
	const frame = res.avatarFrame
	const pet = res.pet
	const petCfg = pet != null ? pet.config : null
	const petIdRaw = res.petId != null ? Number(res.petId) : 0
	const nick = pet != null && pet.nickname != null ? '' + pet.nickname : ''
	return {
		titleCode: res.titleCode != null ? '' + res.titleCode : '',
		titleName: title != null && title.name != null ? '' + title.name : '',
		frameCode: res.avatarFrameCode != null ? '' + res.avatarFrameCode : '',
		frameName: frame != null && frame.name != null ? '' + frame.name : '',
		petId: petIdRaw > 0 ? petIdRaw : 0,
		petName:
			nick.length > 0
				? nick
				: petCfg != null && petCfg.name != null
					? '' + petCfg.name
					: '',
	}
}

/**
 * 我的宠物：GET /rpg/pets（裸数组）
 */
export async function fetchMyPets(): Promise<BagPet[]> {
	const res = await get('/rpg/pets', null, { silent: true })
	const arr = Array.isArray(res) ? res : []
	const list: BagPet[] = []
	for (let i = 0; i < arr.length; i++) {
		const row = arr[i]
		const cfg = row.config != null ? row.config : null
		const nick = row.nickname != null ? '' + row.nickname : ''
		list.push({
			id: row.id != null ? Number(row.id) : 0,
			petCode: row.petCode != null ? '' + row.petCode : '',
			name:
				nick.length > 0
					? nick
					: cfg != null && cfg.name != null
						? '' + cfg.name
						: row.petCode != null
							? '' + row.petCode
							: '宠物',
			level: row.level != null ? Number(row.level) : 1,
			// 图标：iconUrl 优先，否则宠物 icon 键走 x-icon
			icon:
				cfg != null && cfg.icon != null
					? '' + cfg.icon
					: 'paw',
			iconUrl:
				cfg != null && cfg.iconUrl != null && ('' + cfg.iconUrl).length > 0
					? resolveStaticUrl('' + cfg.iconUrl)
					: '',
			bgUrl:
				cfg != null && cfg.bgUrl != null && ('' + cfg.bgUrl).length > 0
					? resolveStaticUrl('' + cfg.bgUrl)
					: '',
		})
	}
	return list
}

/**
 * 穿戴：POST /rpg/loadout/equip（称号/头像框传 itemCode；宠物传 petId）
 */
export function equipLoadout(slot: string, itemCode: string = '', petId: number = 0): Promise<any> {
	const body: Record<string, any> = { slot }
	if (slot == 'pet') {
		body.petId = petId
	} else {
		body.itemCode = itemCode
	}
	return post('/rpg/loadout/equip', body)
}

/**
 * 卸下：POST /rpg/loadout/unequip
 */
export function unequipLoadout(slot: string): Promise<any> {
	return post('/rpg/loadout/unequip', { slot })
}

/**
 * 社交加油（免费，每日上限；目标 +HP）
 * 对齐 Nuxt socialCheer → POST /rpg/social/cheer
 */
export function socialCheer(targetUid: number): Promise<any> {
	return post('/rpg/social/cheer', { targetUid })
}

/**
 * 扔鸡蛋（耗钻，每日上限；目标 -HP）
 * 对齐 Nuxt socialEgg → POST /rpg/social/egg
 */
export function socialEgg(targetUid: number): Promise<any> {
	return post('/rpg/social/egg', { targetUid })
}

/**
 * 送鲜花（耗钻，每日上限；目标声望）
 * 对齐 Nuxt socialFlower → POST /rpg/social/flower
 */
export function socialFlower(targetUid: number): Promise<any> {
	return post('/rpg/social/flower', { targetUid })
}
