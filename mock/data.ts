/**
 * 小卡原型 v4 静态 mock 数据
 * 数据来源：prototypes/blog-app-xiaoka-style.html 文案；本阶段不请求 blog-server
 */
import type { ArticleDetail, ArticleSummary } from '../types/article'
import type { PublicRpgCard, UserProfile } from '../types/user'
import type {
	LotteryCell,
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
		coverEmoji: '📗',
		coverC1: '#c8efe4',
		coverC2: '#b8e0f0',
		pinned: true,
		authorName: '江夏',
		authorEmoji: '🦊',
		readLabel: '1.2k 阅读',
		aiSummary: '从 Vue3 到 uts：模板约束、样式子集与分包体积是上手三大坑。',
	},
	{
		id: '1',
		title: 'NestJS 接入微信支付 V3 全流程',
		categoryName: '后端',
		timeLabel: '3 天前',
		likeCount: 86,
		commentCount: 15,
		coverEmoji: '💰',
		coverC1: '#ffe8d6',
		coverC2: '#f6d9a8',
		authorName: '江夏',
		authorEmoji: '🦊',
		readLabel: '980 阅读',
		aiSummary: 'V3 签名、回调验签与幂等落库是支付接入的核心路径。',
	},
	{
		id: '2',
		title: 'uni-app x 多端：小程序先裁剪，App 再换皮',
		categoryName: '工程',
		timeLabel: '上周',
		likeCount: 64,
		commentCount: 9,
		coverEmoji: '🧩',
		coverC1: '#e8dff8',
		coverC2: '#d6e8ff',
		authorName: '江夏',
		authorEmoji: '🦊',
		readLabel: '640 阅读',
		aiSummary: '主包只留 Tab 与高频页，玩法进分包，先稳微信再做 App 换皮。',
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
	coverEmoji: a.coverEmoji,
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
	coverEmoji: '💭',
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
		coverEmoji: '💰',
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
		coverEmoji: '🧩',
		coverC1: '#e8dff8',
		coverC2: '#d6e8ff',
	},
]

export const meProfile: UserProfile = {
	id: 1,
	nickname: '江夏',
	avatarEmoji: '🦊',
	bio: 'Lv.12 像素匠 · 写字 · 写代码 · 偶尔冒险',
	articleCount: 36,
	favoriteCount: 128,
	likeReceived: 562,
}

export const publicRpg: PublicRpgCard = {
	titleName: '像素匠',
	guildName: '摸鱼协会',
	rankLabel: '经验榜 #18',
	petLabel: '皮卡丘 Lv.4',
	streakDays: 33,
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
	weatherBuff: '🎈 天气Buff',
}

export const rpgQuestsSeed: RpgQuest[] = [
	{
		id: 'checkin',
		title: '每日签到',
		desc: '签到领取经验与钻石',
		icon: '☀️',
		kind: 'checkin',
		done: false,
	},
	{
		id: 'read',
		title: '阅读 1 篇文章',
		desc: '进度 0/1',
		icon: '📖',
		kind: 'read',
		done: false,
		progressLabel: '0/1',
	},
]

export const lotteryCells: LotteryCell[] = [
	{ index: 0, emoji: '💎', label: '+10' },
	{ index: 1, emoji: '🐣', label: '宠物蛋' },
	{ index: 2, emoji: '🪙', label: '+50' },
	{ index: 3, emoji: '🎖️', label: '成就' },
	{ index: 4, emoji: '🖼️', label: '头像框' },
	{ index: 5, emoji: '💎', label: '+50' },
	{ index: 6, emoji: '🎫', label: '再来券' },
	{ index: 7, emoji: '✨', label: '称号' },
]

export const rechargeSkus: RechargeSku[] = [
	{ id: '60', diamonds: 60, priceYuan: 6 },
	{ id: '300', diamonds: 300, priceYuan: 30, bonusLabel: '+30' },
	{ id: '680', diamonds: 680, priceYuan: 68 },
	{ id: '1280', diamonds: 1280, priceYuan: 128 },
]

export const tipSkus = [
	{ id: '6.66', label: '¥6.66', desc: '加油' },
	{ id: '16.8', label: '¥16.8', desc: '送花' },
	{ id: '36.6', label: '¥36.6', desc: '砸蛋礼' },
	{ id: 'custom', label: '自定义', desc: '心意' },
]

export const rankRows: RankRow[] = [
	{ rank: 1, name: '摸鱼会长', emoji: '🐉', level: 28, score: 4200 },
	{ rank: 2, name: '摸鱼大师', emoji: '🐟', level: 22, score: 3100 },
	{ rank: 18, name: '江夏', emoji: '🦊', level: 12, score: 860, isMe: true },
]

export const notifyItems: NotifyItem[] = [
	{
		id: 'n1',
		emoji: '🌱',
		title: '路过的读者 评论了你',
		desc: '《uni-app x 上手》· 写得很清楚！',
		kind: 'comment',
	},
	{
		id: 'n2',
		emoji: '🎉',
		title: '升级到 Lv.12',
		desc: '冒险中心 · 解锁新称号「像素匠」',
		kind: 'system',
	},
	{
		id: 'n3',
		emoji: '☕',
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
		reply: '酱：谢谢支持！',
	},
	{
		id: 'g127',
		floor: 127,
		author: '前端小萌新',
		content: '求 uni-app x 入门路线',
	},
]

export const friendLinks: FriendLink[] = [
	{ id: 'l1', name: '某某的笔记', url: 'note.example.com' },
	{ id: 'l2', name: '小张的博客', url: 'blog.zhang.dev' },
]

export const inboxItems: InboxItem[] = [
	{
		id: 'i1',
		articleTitle: 'uni-app x 上手',
		author: '路过的读者',
		content: '写得很清楚！求更新～',
	},
	{
		id: 'i2',
		articleTitle: '微信支付 V3',
		author: '咖啡因',
		content: '回调幂等那段太关键了',
	},
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
		count: 8,
		articleId: '0',
		articleTitle: 'uni-app x 上手笔记',
	},
	{ monthLabel: '9 月', count: 5 },
	{ monthLabel: '8 月', count: 3 },
]

/** 签到日历：本月已签日期（1-based） */
export const calendarHits: number[] = [
	1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
]

export const homeCategories = ['推荐', '前端', 'NestJS', 'RPG', 'AI']
export const discoverCategories = ['推荐', '前端', '后端', 'RPG']

export const relatedMinis = [
	{ id: '2', emoji: '🗺️', title: '冒险页做成任务板' },
	{ id: '1', emoji: '🔁', title: '支付回调幂等' },
]

export const detailComments = [
	{ emoji: '🌱', name: '路过的读者', tag: 'Lv.8', text: '写得很清楚，收藏了！' },
	{ emoji: '☕', name: '咖啡因', tag: '', text: 'uts 那段太真实了哈哈哈' },
]
