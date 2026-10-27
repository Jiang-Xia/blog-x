/**
 * 同名方法 mock 挡板（类 shopkeeper-cli apis/mocks）
 * USE_MOCK=true 或 applyMocks 合并时覆盖 createApi 方法
 */
import {
	homeArticles,
	lotteryHistorySeed,
	lotteryPoolSeed,
	rankRows,
	rpgHeroSeed,
} from '../../mock/data'
import type { ApiFn } from '../createApi'

/**
 * 返回可覆盖 $apis 的 mock 方法表
 */
export function createMockOverrides(): Record<string, ApiFn> {
	return {
		getArticleList: async () => {
			return { list: homeArticles, pagination: { total: homeArticles.length } }
		},
		getLotteryPool: async () => {
			return lotteryPoolSeed
		},
		getLotteryHistory: async () => {
			return {
				list: lotteryHistorySeed,
				pagination: { total: lotteryHistorySeed.length, page: 1, pageSize: 20, totalPages: 1 },
			}
		},
		getRpgStatus: async () => {
			return {
				level: rpgHeroSeed.level,
				exp: 0,
				nextLevelExp: rpgHeroSeed.expToNext,
				currency: rpgHeroSeed.diamonds,
				coin: rpgHeroSeed.coins,
				lotteryTickets: rpgHeroSeed.lotteryTickets,
				signDays: rpgHeroSeed.streakDays,
				nickname: rpgHeroSeed.travelerName,
				lotteryPityCounter: rpgHeroSeed.lotteryPityCounter,
				lotteryLegendaryPityCounter: rpgHeroSeed.lotteryLegendaryPityCounter,
			}
		},
		getRpgLeaderboard: async () => {
			return rankRows
		},
	}
}

/**
 * 把 mock 覆盖合并进 api 对象（后写覆盖先写）
 */
export function applyMocks(api: Record<string, ApiFn>): Record<string, ApiFn> {
	const mocks = createMockOverrides()
	const keys = Object.keys(mocks)
	for (let i = 0; i < keys.length; i++) {
		api[keys[i]] = mocks[keys[i]]
	}
	return api
}
