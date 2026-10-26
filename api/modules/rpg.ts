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
		// Nest：{ tickets: number }
		const tickets = await get('/rpg/lottery/tickets', null, { silent: true })
		if (tickets != null && tickets.tickets != null) {
			hero.lotteryTickets = Number(tickets.tickets)
		}
	} catch (_) {}
	return hero
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

/** 背包展示项（字段来自后端 enrich，勿本地 dict 回显） */
export type BagItem = {
	id: string
	itemCode: string
	quantity: number
	name: string
	itemType: string
	itemTypeLabel: string
	sourceLabel: string
	icon: string
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
	icon: string
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
			icon:
				cfg != null && cfg.itemTypeIcon != null
					? '' + cfg.itemTypeIcon
					: cfg != null && cfg.icon != null
						? '' + cfg.icon
						: 'gift',
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
			icon:
				cfg != null && cfg.itemTypeIcon != null
					? '' + cfg.itemTypeIcon
					: cfg != null && cfg.icon != null
						? '' + cfg.icon
						: 'paw',
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
