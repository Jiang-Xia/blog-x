/**
 * 接口注册表（类 shopkeeper-cli interfaceFuncMap）
 * 新增接口：在对应分段追加一行；createApi 会按 name 生成调用方法
 * path 可含 :id 等占位，调用时从 params 取出并拼进 URL，剩余作 query/body
 */

/** 单条接口定义 */
export type ApiRow = {
	/** $apis 方法名，全局唯一 */
	name: string
	/** 中文说明（调试日志） */
	label: string
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
	/** 相对路径，如 /article/info 或 /user/public/:uid */
	path: string
}

/** 文章公开读 / 创作 */
const ARTICLE_ROWS: ApiRow[] = [
	{ name: 'getArticleList', label: '文章列表', method: 'POST', path: '/article/list' },
	{ name: 'getArticleInfo', label: '文章详情', method: 'GET', path: '/article/info' },
	{ name: 'postArticleViews', label: '文章浏览量', method: 'POST', path: '/article/views' },
	{ name: 'createArticle', label: '创建文章', method: 'POST', path: '/article/create' },
	{ name: 'getArchives', label: '文章归档', method: 'GET', path: '/article/archives' },
	{ name: 'getRelatedArticles', label: '相关文章', method: 'GET', path: '/article/related' },
	{ name: 'getAllCategory', label: '全部分类', method: 'GET', path: '/category' },
	{ name: 'getAllTag', label: '全部标签', method: 'GET', path: '/tag' },
]

/** 留言 / 友链 */
const SOCIAL_ROWS: ApiRow[] = [
	{ name: 'getMsgboardList', label: '留言列表', method: 'GET', path: '/msgboard' },
	{ name: 'postMsgboard', label: '发表留言', method: 'POST', path: '/msgboard' },
	{ name: 'getLinks', label: '友链列表', method: 'GET', path: '/link' },
	{ name: 'createLink', label: '申请友链', method: 'POST', path: '/link' },
]

/** 认证 / 用户 */
const AUTH_ROWS: ApiRow[] = [
	{ name: 'getAuthCode', label: '图形验证码', method: 'GET', path: '/user/authCode' },
	{ name: 'login', label: '账号登录', method: 'POST', path: '/user/login' },
	{ name: 'wxMiniprogramLogin', label: '微信小程序登录', method: 'POST', path: '/user/auth/wechat/miniprogram' },
	{ name: 'refreshToken', label: '刷新令牌', method: 'GET', path: '/user/refresh' },
	{ name: 'getUserInfo', label: '当前用户信息', method: 'GET', path: '/user/info' },
	{ name: 'patchUserEdit', label: '修改用户资料', method: 'PATCH', path: '/user/edit' },
	{ name: 'getPublicProfile', label: '公开主页', method: 'GET', path: '/user/public/:uid' },
	{ name: 'getPublicArticles', label: '公开主页文章', method: 'GET', path: '/user/public/:uid/articles' },
	{ name: 'getPublicCollects', label: '公开主页收藏', method: 'GET', path: '/user/public/:uid/collects' },
	{ name: 'getPublicLikes', label: '公开主页点赞', method: 'GET', path: '/user/public/:uid/likes' },
	{ name: 'getPublicRpgStatus', label: '公开 RPG 状态', method: 'GET', path: '/rpg/public/:uid/status' },
]

/** 互动 */
const INTERACT_ROWS: ApiRow[] = [
	{ name: 'toggleLike', label: '点赞切换', method: 'POST', path: '/like' },
	{ name: 'checkLiked', label: '是否已赞', method: 'GET', path: '/like/check' },
	{ name: 'toggleCollect', label: '收藏切换', method: 'POST', path: '/collect' },
	{ name: 'checkCollected', label: '是否已藏', method: 'GET', path: '/collect/check' },
	{ name: 'getCollectList', label: '我的收藏', method: 'GET', path: '/collect/list' },
	{ name: 'getComments', label: '文章评论', method: 'GET', path: '/comment/findAll' },
	{ name: 'addComment', label: '发表评论', method: 'POST', path: '/comment/create' },
	{ name: 'addReply', label: '发表回复', method: 'POST', path: '/reply/create' },
	{ name: 'getCommentsOnMyArticles', label: '评论收件箱', method: 'GET', path: '/comment/on-my-articles' },
	{ name: 'tipArticle', label: '文章打赏', method: 'POST', path: '/rpg/article/tip' },
	{ name: 'createSiteTip', label: '站点赞赏下单', method: 'POST', path: '/site/tip/create' },
	{ name: 'getSiteTipStatus', label: '站点赞赏状态', method: 'GET', path: '/site/tip/status' },
]

/** RPG */
const RPG_ROWS: ApiRow[] = [
	{ name: 'rpgSignIn', label: '每日签到', method: 'POST', path: '/rpg/sign' },
	{ name: 'getRpgSignInfo', label: '签到信息', method: 'GET', path: '/rpg/sign-info' },
	{ name: 'getRpgStatus', label: 'RPG 状态', method: 'GET', path: '/rpg/status' },
	{ name: 'getMyQuests', label: '我的任务', method: 'GET', path: '/rpg/my-quests' },
	{ name: 'claimQuestReward', label: '领取任务奖励', method: 'POST', path: '/rpg/quest/claim' },
	{ name: 'getWeatherBuff', label: '天气 Buff', method: 'GET', path: '/rpg/weather-buff' },
	{ name: 'getLotteryPool', label: '抽奖奖池', method: 'GET', path: '/rpg/lottery/pool' },
	{ name: 'lotteryDraw', label: '抽奖', method: 'POST', path: '/rpg/lottery/draw' },
	{ name: 'getLotteryTickets', label: '抽奖券', method: 'GET', path: '/rpg/lottery/tickets' },
	{ name: 'getRpgLeaderboard', label: '排行榜', method: 'GET', path: '/rpg/leaderboard' },
	{ name: 'createRpgRecharge', label: '充值下单', method: 'POST', path: '/rpg/recharge/create' },
	{ name: 'getRpgRechargeStatus', label: '充值状态', method: 'GET', path: '/rpg/recharge/status' },
	{ name: 'getRpgInventory', label: '背包物品', method: 'GET', path: '/rpg/inventory' },
	{ name: 'getRpgLoadout', label: '装备栏', method: 'GET', path: '/rpg/loadout' },
	{ name: 'equipLoadout', label: '穿戴装备', method: 'POST', path: '/rpg/loadout/equip' },
	{ name: 'unequipLoadout', label: '卸下装备', method: 'POST', path: '/rpg/loadout/unequip' },
	{ name: 'getMyPets', label: '我的宠物', method: 'GET', path: '/rpg/pets' },
	{ name: 'socialCheer', label: '社交加油', method: 'POST', path: '/rpg/social/cheer' },
	{ name: 'socialEgg', label: '扔鸡蛋', method: 'POST', path: '/rpg/social/egg' },
	{ name: 'socialFlower', label: '送鲜花', method: 'POST', path: '/rpg/social/flower' },
]

/** 通知 / AI / 审核 */
const EXTRA_ROWS: ApiRow[] = [
	{ name: 'getNotifications', label: '通知列表', method: 'GET', path: '/notification/list' },
	{ name: 'getUnreadNotificationCount', label: '未读通知数', method: 'GET', path: '/notification/unread-count' },
	{ name: 'markNotificationsRead', label: '标记通知已读', method: 'PATCH', path: '/notification/read' },
	{ name: 'getRagQuota', label: 'RAG 配额', method: 'GET', path: '/rag/quota' },
	{ name: 'getRagStatus', label: 'RAG 状态', method: 'GET', path: '/rag/status' },
	{ name: 'getSensitiveHits', label: '敏感词命中', method: 'GET', path: '/sensitive-word/hit' },
	{ name: 'approveSensitiveHit', label: '审核通过', method: 'POST', path: '/sensitive-word/hit/:id/approve' },
	{ name: 'rejectSensitiveHit', label: '审核拒绝', method: 'POST', path: '/sensitive-word/hit/:id/reject' },
]

/** 全量注册表（合并各业务分段；避免依赖对象展开以兼容 uvue/uts） */
export const API_ROWS: ApiRow[] = ([] as ApiRow[])
	.concat(ARTICLE_ROWS)
	.concat(SOCIAL_ROWS)
	.concat(AUTH_ROWS)
	.concat(INTERACT_ROWS)
	.concat(RPG_ROWS)
	.concat(EXTRA_ROWS)

/**
 * 用 params 填充 path 中的 :param，返回 { url, rest }
 */
export function fillPath(
	path: string,
	params: Record<string, any> | null,
): { url: string; rest: Record<string, any> } {
	const rest: Record<string, any> = {}
	if (params != null) {
		const keys = Object.keys(params)
		for (let i = 0; i < keys.length; i++) {
			rest[keys[i]] = params[keys[i]]
		}
	}
	let url = path
	const re = /:([a-zA-Z_][a-zA-Z0-9_]*)/g
	let m: RegExpExecArray | null
	const used: string[] = []
	while ((m = re.exec(path)) != null) {
		used.push(m[1])
	}
	for (let i = 0; i < used.length; i++) {
		const key = used[i]
		const val = rest[key]
		url = url.replace(':' + key, encodeURIComponent('' + (val != null ? val : '')))
		delete rest[key]
	}
	return { url, rest }
}
