/**
 * 点赞 / 收藏 / 评论 / 留言 / 友链 / 打赏
 */
import { get, post } from '../request'
import { mapFriendLinks, mapGuestbookItems, mapInboxItems } from '../adapters/user'
import type { FriendLink, GuestbookItem, InboxItem } from '../../types/notify'
import type { ArticleSummary } from '../../types/article'
import { mapArticleSummary } from '../adapters/article'

	/**
	 * 点赞 / 取消点赞（对齐 Nuxt：须传 status 0|1 与 uid；缺 status 会被服务端当成取消）
	 */
	export function toggleLike(data: {
		articleId: string | number
		uid: number
		/** 1=点赞，0=取消 */
		status: number
	}): Promise<any> {
		return post('/like', {
			articleId: '' + data.articleId,
			uid: data.uid,
			status: data.status,
		})
	}

/**
 * 是否已赞
 */
export async function checkLiked(articleId: string | number): Promise<boolean> {
	try {
		const res = await get('/like/check', { articleId: '' + articleId }, { silent: true })
		return res != null && res.liked === true
	} catch (_) {
		return false
	}
}

/**
 * 切换收藏
 */
export function toggleCollect(articleId: string | number): Promise<any> {
	return post('/collect', { articleId: '' + articleId })
}

/**
 * 是否已藏
 */
export async function checkCollected(articleId: string | number): Promise<boolean> {
	try {
		const res = await get('/collect/check', { articleId: '' + articleId }, { silent: true })
		return res != null && res.collected === true
	} catch (_) {
		return false
	}
}

/**
 * 我的收藏列表（Nest：{ list, pagination }，行内 article）
 */
export async function fetchCollectList(page = 1, pageSize = 20): Promise<ArticleSummary[]> {
	const res = await get('/collect/list', { page, pageSize })
	const arr = res != null && res.list != null ? res.list : []
	const list: ArticleSummary[] = []
	for (let i = 0; i < arr.length; i++) {
		const row = arr[i]
		if (row == null || row.article == null) continue
		const mapped = mapArticleSummary(row.article)
		if (mapped.id.length == 0 || mapped.title.length == 0) continue
		list.push(mapped)
	}
	return list
}

/**
 * 文章评论列表
 */
export function fetchComments(articleId: string | number, page = 1, pageSize = 20): Promise<any> {
	return get('/comment/findAll', { articleId: '' + articleId, page, pageSize })
}

/**
 * 发表评论
 */
export function addComment(articleId: string | number, content: string): Promise<any> {
	return post('/comment/create', { articleId: '' + articleId, content })
}

/**
 * 发表回复
 */
export function addReply(data: {
	parentId: string | number
	content: string
	replyUid: string | number
}): Promise<any> {
	return post('/reply/create', {
		parentId: '' + data.parentId,
		content: data.content,
		replyUid: '' + data.replyUid,
	})
}

/**
 * 留言列表（含服务端 total，供「共 N 条」）
 */
export async function fetchMsgboard(
	page = 1,
	pageSize = 30,
): Promise<{ list: GuestbookItem[]; total: number }> {
	const res = await get('/msgboard', { page, pageSize })
	const list = mapGuestbookItems(res)
	let total = list.length
	if (res != null && res.pagination != null && res.pagination.total != null) {
		total = Number(res.pagination.total)
	} else if (res != null && res.total != null) {
		total = Number(res.total)
	}
	return { list, total: isNaN(total) ? list.length : total }
}

/**
 * 发表留言 / 回复（对齐 Nuxt：回复带 pId + replyId + respondent）
 */
export function postMsgboard(data: {
	name: string
	comment: string
	eamil?: string
	address?: string
	avatar?: string
	pId?: number
	replyId?: number | string
	respondent?: string
}): Promise<any> {
	const body: Record<string, any> = {
		name: data.name,
		comment: data.comment,
		eamil: data.eamil != null ? data.eamil : '',
		address: data.address != null ? data.address : '',
		avatar: data.avatar != null ? data.avatar : '',
	}
	if (data.pId != null && data.pId > 0) body.pId = data.pId
	if (data.replyId != null) body.replyId = data.replyId
	if (data.respondent != null && data.respondent.length > 0) {
		body.respondent = data.respondent
	}
	return post('/msgboard', body)
}

/**
 * 友链列表
 */
export async function fetchLinks(): Promise<FriendLink[]> {
	const res = await get('/link', { client: true })
	return mapFriendLinks(res)
}

/**
 * 申请友链
 */
export function createLink(data: { title: string; url: string; desp?: string; icon?: string }): Promise<any> {
	return post('/link', data)
}

/**
 * 文章钻石打赏
 */
export function tipArticle(articleId: number, amount: number): Promise<any> {
	return post('/rpg/article/tip', { articleId, amount })
}

/**
 * 站点赞赏下单（支付宝，bizType=site_tip，不发钻）
 */
export function createSiteTip(payload: {
	amountYuan: number
	displayName?: string
	message?: string
}): Promise<any> {
	return post('/site/tip/create', payload)
}

/**
 * 站点赞赏支付状态轮询
 */
export function getSiteTipStatus(outTradeNo: string): Promise<any> {
	return get('/site/tip/status', { out_trade_no: outTradeNo }, { silent: true })
}

/**
 * 评论收件箱
 */
export async function fetchInbox(page = 1, pageSize = 20): Promise<InboxItem[]> {
	const res = await get('/comment/on-my-articles', { page, pageSize })
	return mapInboxItems(res)
}
