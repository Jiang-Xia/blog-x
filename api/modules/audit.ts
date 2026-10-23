/**
 * 审核台：敏感词命中记录列表 / 通过 / 拒绝
 * 数据来源：GET /sensitive-word/hit；POST .../approve|reject（需登录，对齐 blog-admin）
 */
import { get, post } from '../request'

/** 命中记录（字段来自 SensitiveWordHit，勿本地 map 回显） */
export type AuditHit = {
	id: number
	sourceType: string
	sourceId: string
	content: string
	hitWords: string
	status: string
	createTime: string
}

/** 列表查询入参 */
export type AuditHitQuery = {
	page?: number
	pageSize?: number
	/** comment | msgboard | reply；空=全部 */
	sourceType?: string
	/** pending | approved | rejected；空=全部 */
	status?: string
}

/**
 * 将单条 hit 适配为 AuditHit
 */
function mapHit(row: any): AuditHit {
	return {
		id: row != null && row.id != null ? Number(row.id) : 0,
		sourceType: row != null && row.sourceType != null ? '' + row.sourceType : '',
		sourceId: row != null && row.sourceId != null ? '' + row.sourceId : '',
		content: row != null && row.content != null ? '' + row.content : '',
		hitWords: row != null && row.hitWords != null ? '' + row.hitWords : '',
		status: row != null && row.status != null ? '' + row.status : '',
		createTime: row != null && row.createTime != null ? '' + row.createTime : '',
	}
}

/**
 * 分页查询敏感词命中记录
 * @returns list + total
 */
export async function fetchAuditHits(
	query: AuditHitQuery = {},
): Promise<{ list: AuditHit[]; total: number }> {
	const params: Record<string, any> = {
		page: query.page != null ? query.page : 1,
		pageSize: query.pageSize != null ? query.pageSize : 30,
	}
	if (query.sourceType != null && query.sourceType.length > 0) {
		params.sourceType = query.sourceType
	}
	if (query.status != null && query.status.length > 0) {
		params.status = query.status
	}
	const res = await get('/sensitive-word/hit', params)
	const arr = res != null && res.list != null ? res.list : []
	const list: AuditHit[] = []
	for (let i = 0; i < arr.length; i++) {
		list.push(mapHit(arr[i]))
	}
	const total =
		res != null && res.pagination != null && res.pagination.total != null
			? Number(res.pagination.total)
			: 0
	return { list, total }
}

/**
 * 审核通过：POST /sensitive-word/hit/:id/approve
 */
export function approveAuditHit(id: number): Promise<any> {
	return post('/sensitive-word/hit/' + id + '/approve', {})
}

/**
 * 审核拒绝：POST /sensitive-word/hit/:id/reject
 */
export function rejectAuditHit(id: number): Promise<any> {
	return post('/sensitive-word/hit/' + id + '/reject', {})
}
