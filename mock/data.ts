/**
 * 小卡原型 v4 静态 mock 数据
 * 数据来源：prototypes/blog-app-xiaoka-style.html 文案；本阶段不请求 blog-server
 */
import type { ArticleDetail, ArticleSummary } from '../types/article'
import type { PublicRpgCard, UserProfile } from '../types/user'
import type {
	LotteryPoolItem,
	LotteryRecord,
	RankRow,
	RechargeSku,
	RpgHero,
	RpgQuest,
} from '../types/rpg'
import type {
	ArchiveMonth,
	AuditItem,
	FriendLink,
	GuestbookItem,
	InboxItem,
	NotifyItem,
} from '../types/notify'

/** 详情用完整文章列表（index 与原型 go('detail', i) 对齐） */
export const articles: ArticleDetail[] = [
	{
		id: '0',
		title: 'uni-app x 上手：从 Vue3 到 uts 的踩坑记录',
		categoryName: '前端',
		timeLabel: '昨天',
		likeCount: 128,
		commentCount: 23,
		coverUrl: '',
		coverIcon: 'book',
		coverC1: '#c8efe4',
		coverC2: '#b8e0f0',
		pinned: true,
		authorUid: 1,
		authorName: '江夏',
		authorAvatarUrl: '',
		authorIcon: 'paw',
		readLabel: '1.2k 阅读',
		aiSummary: '从 Vue3 到 uts：模板约束、样式子集与分包体积是上手三大坑。',
		content:
			'从 Vue3 到 uts，模板约束、样式子集与分包体积是上手三大坑。先把主包压住，再逐步把玩法拆进分包。',
		contentHtml: '',
		description: 'uni-app x 上手踩坑笔记',
		tagLabels: ['uni-app x', 'uts'],
		tags: [
			{ id: 't1', label: 'uni-app x', color: '#3db89a' },
			{ id: 't2', label: 'uts', color: '#6f8fad' },
		],
	},
	{
		id: '1',
		title: 'NestJS 接入微信支付 V3 全流程',
		categoryName: '后端',
		timeLabel: '3 天前',
		likeCount: 86,
		commentCount: 15,
		coverUrl: '',
		coverIcon: 'coin',
		coverC1: '#ffe8d6',
		coverC2: '#f6d9a8',
		authorUid: 1,
		authorName: '江夏',
		authorAvatarUrl: '',
		authorIcon: 'paw',
		readLabel: '980 阅读',
		aiSummary: 'V3 签名、回调验签与幂等落库是支付接入的核心路径。',
		content: 'V3 签名、回调验签与幂等落库是支付接入的核心路径。',
		contentHtml: '',
		description: '微信支付 V3 接入笔记',
		tagLabels: ['NestJS', '支付'],
		tags: [
			{ id: 't3', label: 'NestJS', color: '#c4908a' },
			{ id: 't4', label: '支付', color: '#d4a07a' },
		],
	},
	{
		id: '2',
		title: 'uni-app x 多端：小程序先裁剪，App 再换皮',
		categoryName: '工程',
		timeLabel: '上周',
		likeCount: 64,
		commentCount: 9,
		coverUrl: '',
		coverIcon: 'puzzle',
		coverC1: '#e8dff8',
		coverC2: '#d6e8ff',
		authorUid: 1,
		authorName: '江夏',
		authorAvatarUrl: '',
		authorIcon: 'paw',
		readLabel: '640 阅读',
		aiSummary: '主包只留 Tab 与高频页，玩法进分包，先稳微信再做 App 换皮。',
		content: '主包只留 Tab 与高频页，玩法进分包，先稳微信再做 App 换皮。',
		contentHtml: '',
		description: '多端分包策略',
		tagLabels: ['工程', '分包'],
		tags: [
			{ id: 't5', label: '工程', color: '#9585b0' },
			{ id: 't6', label: '分包', color: '#b89a72' },
		],
	},
]

/** 首页最新列表 */
export const homeArticles: ArticleSummary[] = articles.map((a) => ({
	id: a.id,
	title: a.title,
	categoryName: a.categoryName,
	timeLabel: a.timeLabel,
	likeCount: a.likeCount,
	commentCount: a.commentCount,
	coverUrl: a.coverUrl,
	coverIcon: a.coverIcon,
	coverC1: a.coverC1,
	coverC2: a.coverC2,
	pinned: a.pinned,
}))

/** 发现页热门 */
export const hotArticle: ArticleSummary = {
	id: '0',
	title: '评论区怎样做得不打扰阅读',
	categoryName: '产品',
	timeLabel: '热门',
	likeCount: 1200,
	commentCount: 40,
	coverUrl: '',
	coverIcon: 'message-circle',
	coverC1: '#c8efe4',
	coverC2: '#ffe8d6',
	hotLabel: '热度 1.2k',
}

/** 搜索示意结果 */
export const searchResults: ArticleSummary[] = [
	{
		id: '1',
		title: 'NestJS 接入微信**支付** V3 全流程',
		categoryName: '后端',
		timeLabel: '3 天前',
		likeCount: 86,
		commentCount: 15,
		coverUrl: '',
		coverIcon: 'coin',
		coverC1: '#ffe8d6',
		coverC2: '#f6d9a8',
	},
	{
		id: '2',
		title: '支付模块踩坑记：回调幂等',
		categoryName: '后端',
		timeLabel: '上周',
		likeCount: 40,
		commentCount: 6,
		coverUrl: '',
		coverIcon: 'puzzle',
		coverC1: '#e8dff8',
		coverC2: '#d6e8ff',
	},
]

export const meProfile: UserProfile = {
	id: 1,
	nickname: '江夏',
	avatar: '',
	avatarUrl: '',
	avatarIcon: 'paw',
	bio: 'Lv.12 像素匠 · 写字 · 写代码 · 偶尔冒险',
	homepage: 'https://jiang-xia.top',
	articleCount: 36,
	favoriteCount: 128,
	likeReceived: 562,
	roleIds: [1],
	roleNames: ['超级管理员'],
}

export const publicRpg: PublicRpgCard = {
	level: 12,
	reputation: 420,
	titleName: '像素匠',
	frameName: '赛博边框',
	petLabel: '皮卡丘 Lv.4',
	streakDays: 33,
	achievements: ['初来乍到', '连续签到'],
}

/** 冒险英雄初始值（可变状态见 useMockStore） */
export const rpgHeroSeed: RpgHero = {
	travelerName: '酱',
	level: 12,
	expToNext: 86,
	expBarPercent: 68,
	diamonds: 286,
	coins: 56,
	lotteryTickets: 3,
	streakDays: 32,
	weatherBuff: '天气 Buff',
	lotteryPityCounter: 12,
	lotteryLegendaryPityCounter: 40,
}

export const rpgQuestsSeed: RpgQuest[] = [
	{
		id: 'daily_sign',
		title: '每日签到',
		desc: '签到领取经验与钻石',
		icon: 'sun',
		kind: 'checkin',
		done: false,
		claimable: false,
	},
	{
		id: 'daily_read',
		title: '阅读 1 篇文章',
		desc: '进度 0/1',
		icon: 'book',
		kind: 'read',
		done: false,
		claimable: false,
		progressLabel: '0/1',
	},
]

/** 抽奖奖池 mock（形状对齐 Nest enrich 后的 pool） */
export const lotteryPoolSeed: LotteryPoolItem[] = [
	{
		id: 1,
		itemCode: 'diamond_10',
		name: '钻石+10',
		rarity: 'common',
		rarityLabel: '普通',
		rarityColor: '#9ca3af',
		icon: 'diamond',
		iconUrl: '',
		itemLinked: true,
	},
	{
		id: 2,
		itemCode: 'pet_egg',
		name: '宠物蛋',
		rarity: 'rare',
		rarityLabel: '稀有',
		rarityColor: '#3b82f6',
		icon: 'egg',
		iconUrl: '',
		itemLinked: true,
	},
	{
		id: 3,
		itemCode: 'coin_50',
		name: '金币+50',
		rarity: 'common',
		rarityLabel: '普通',
		rarityColor: '#9ca3af',
		icon: 'coin',
		iconUrl: '',
		itemLinked: true,
	},
	{
		id: 4,
		itemCode: 'medal_badge',
		name: '成就徽章',
		rarity: 'epic',
		rarityLabel: '史诗',
		rarityColor: '#a855f7',
		icon: 'medal',
		iconUrl: '',
		itemLinked: true,
	},
	{
		id: 5,
		itemCode: 'avatar_frame',
		name: '头像框',
		rarity: 'rare',
		rarityLabel: '稀有',
		rarityColor: '#3b82f6',
		icon: 'frame',
		iconUrl: '',
		itemLinked: true,
	},
	{
		id: 6,
		itemCode: 'diamond_50',
		name: '钻石+50',
		rarity: 'epic',
		rarityLabel: '史诗',
		rarityColor: '#a855f7',
		icon: 'diamond',
		iconUrl: '',
		itemLinked: true,
	},
	{
		id: 7,
		itemCode: 'lottery_ticket',
		name: '再来券',
		rarity: 'rare',
		rarityLabel: '稀有',
		rarityColor: '#3b82f6',
		icon: 'ticket',
		iconUrl: '',
		itemLinked: true,
	},
	{
		id: 8,
		itemCode: 'title_spark',
		name: '称号',
		rarity: 'legendary',
		rarityLabel: '传说',
		rarityColor: '#f59e0b',
		icon: 'sparkles',
		iconUrl: '',
		itemLinked: true,
	},
]

/** 抽奖记录 mock */
export const lotteryHistorySeed: LotteryRecord[] = [
	{
		id: 1,
		poolName: '钻石+10',
		poolRarity: 'common',
		rarityLabel: '普通',
		rarityColor: '#9ca3af',
		icon: 'diamond',
		iconUrl: '',
		timeLabel: '今天',
	},
	{
		id: 2,
		poolName: '宠物蛋',
		poolRarity: 'rare',
		rarityLabel: '稀有',
		rarityColor: '#3b82f6',
		icon: 'egg',
		iconUrl: '',
		timeLabel: '昨天',
	},
]

/** 快捷充值面额（对齐 Nuxt RPG_RECHARGE_AMOUNT_OPTIONS，1 元 = 100 钻） */
export const rechargeSkus: RechargeSku[] = [
	{ id: '1', amountYuan: 1, diamonds: 100 },
	{ id: '5', amountYuan: 5, diamonds: 500 },
	{ id: '10', amountYuan: 10, diamonds: 1000 },
	{ id: '50', amountYuan: 50, diamonds: 5000 },
]

/** 文章钻石打赏档位（amount 对齐 POST /rpg/article/tip） */
export const tipDiamondSkus = [
	{ id: '1', amount: 1, label: '1 钻', desc: '鼓励一下' },
	{ id: '5', amount: 5, label: '5 钻', desc: '加油' },
	{ id: '10', amount: 10, label: '10 钻', desc: '送花' },
	{ id: '50', amount: 50, label: '50 钻', desc: '砸蛋礼' },
]

/** 站点赞赏档位（元，对齐 /site/tip/create） */
export const tipSiteSkus = [
	{ id: '6.66', amountYuan: 6.66, label: '¥6.66', desc: '咖啡' },
	{ id: '16.66', amountYuan: 16.66, label: '¥16.66', desc: '奶茶' },
	{ id: '26.66', amountYuan: 26.66, label: '¥26.66', desc: '午餐' },
	{ id: '66.66', amountYuan: 66.66, label: '¥66.66', desc: '大餐' },
]

/** @deprecated 兼容旧引用，等同 tipDiamondSkus 展示字段 */
export const tipSkus = tipDiamondSkus.map((s) => ({
	id: s.id,
	label: s.label,
	desc: s.desc,
}))

export const inboxItems: InboxItem[] = [
	{
		id: 'i1',
		articleTitle: 'uni-app x 上手',
		author: '路过的读者',
		content: '写得很清楚！求更新～',
		replyUid: '2',
	},
	{
		id: 'i2',
		articleTitle: '微信支付 V3',
		author: '咖啡因',
		content: '回调幂等那段太关键了',
		replyUid: '3',
	},
]

export const rankRows: RankRow[] = [
	{ rank: 1, uid: 2, name: '摸鱼会长', icon: 'dragon', level: 28, score: 4200, scoreLabel: '4200' },
	{ rank: 2, uid: 3, name: '摸鱼大师', icon: 'fish', level: 22, score: 3100, scoreLabel: '3100' },
	{ rank: 18, uid: 1, name: '江夏', icon: 'paw', level: 12, score: 860, scoreLabel: '860', isMe: true },
]

export const notifyItems: NotifyItem[] = [
	{
		id: 'n1',
		icon: 'seedling',
		title: '路过的读者 评论了你',
		desc: '《uni-app x 上手》· 写得很清楚！',
		kind: 'comment',
	},
	{
		id: 'n2',
		icon: 'confetti',
		title: '升级到 Lv.12',
		desc: '冒险中心 · 解锁新称号「像素匠」',
		kind: 'system',
	},
	{
		id: 'n3',
		icon: 'coffee',
		title: '咖啡因 赞了你的评论',
		desc: '《微信支付 V3》评论区',
		kind: 'like',
	},
]

export const guestbookItems: GuestbookItem[] = [
	{
		id: 'g128',
		floor: 128,
		author: '摸鱼大师',
		content: '博客越来越好看了～',
		uid: 3,
		address: '/user/3',
		replies: [
			{
				id: 'g128r1',
				author: '酱',
				content: '谢谢支持！',
				uid: 1,
				address: '/user/1',
				respondent: '摸鱼大师',
			},
		],
	},
	{
		id: 'g127',
		floor: 127,
		author: '前端小萌新',
		content: '求 uni-app x 入门路线',
		uid: 0,
		address: '',
		replies: [],
	},
]

export const friendLinks: FriendLink[] = [
	{ id: 'l1', name: '某某的笔记', url: 'note.example.com' },
	{ id: 'l2', name: '小张的博客', url: 'blog.zhang.dev' },
]

export const auditItems: AuditItem[] = [
	{
		id: 'a1',
		kind: '敏感词',
		summary: '评论含敏感词',
		highlight: '垃圾',
	},
	{
		id: 'a2',
		kind: '友链',
		summary: '友链申请 blog.zhang.dev',
	},
]

export const archiveMonths: ArchiveMonth[] = [
	{
		monthLabel: '10 月',
		count: 2,
		articleId: '0',
		articleTitle: 'uni-app x 上手笔记',
		articles: [
			{ id: '0', title: 'uni-app x 上手笔记', timeLabel: '今天' },
			{ id: '1', title: 'NestJS 接入微信支付 V3', timeLabel: '3 天前' },
		],
	},
	{
		monthLabel: '9 月',
		count: 1,
		articles: [{ id: '2', title: '冒险页做成任务板', timeLabel: '上周' }],
	},
]

/** 签到日历：本月已签日期（1-based） */
export const calendarHits: number[] = [
	1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
]

export const homeCategories = ['推荐', '前端', 'NestJS', 'RPG', 'AI']
export const discoverCategories = ['推荐', '前端', '后端', 'RPG']

/** 详情相关阅读 mock（字段对齐 ArticleSummary 缩略） */
export const relatedMinis: ArticleSummary[] = [
	{
		id: '2',
		title: '冒险页做成任务板',
		categoryName: '产品',
		timeLabel: '上周',
		likeCount: 12,
		commentCount: 2,
		coverUrl: '',
		coverIcon: 'map',
		coverC1: '#e8dff8',
		coverC2: '#d6e8ff',
	},
	{
		id: '1',
		title: '支付回调幂等',
		categoryName: '后端',
		timeLabel: '3 天前',
		likeCount: 40,
		commentCount: 6,
		coverUrl: '',
		coverIcon: 'repeat',
		coverC1: '#ffe8d6',
		coverC2: '#f6d9a8',
	},
]

/** 详情页 mock 评论（含 replies，对齐接口 replys） */
export const detailComments = [
	{
		uid: 8,
		avatarUrl: '',
		icon: 'seedling',
		name: '路过的读者',
		tag: 'Lv.8',
		text: '写得很清楚，收藏了！',
		replies: [
			{
				uid: 1,
				avatarUrl: '',
				icon: 'arrow-back',
				name: '作者',
				replyToName: '路过的读者',
				text: '谢谢支持～',
			},
		],
	},
	{
		uid: 3,
		avatarUrl: '',
		icon: 'coffee',
		name: '咖啡因',
		tag: '',
		text: 'uts 那段太真实了哈哈哈',
		replies: [],
	},
]
