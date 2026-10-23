/**
 * 媒体上传：POST /resources/upload-media（multipart，不走 request JSON 封装）
 * 对齐 blog-home-uniapp api/resources；返回 /static 相对路径
 */
import { getBaseUrl } from '../config'
import { getToken } from '../../utils/storage'

/** 上传分类：封面 / 正文图 / 头像 */
export type UploadMediaCategory = 'avatar' | 'cover' | 'article'

/**
 * 从 upload-media 响应解出 url 字段
 */
function parseUploadUrl(raw: string): string {
	try {
		const body = JSON.parse(raw)
		const code = body.code
		if (code != null && code !== 0 && code !== 200) {
			throw new Error(
				body.msg != null
					? '' + body.msg
					: body.message != null
						? '' + body.message
						: '上传失败',
			)
		}
		const data = body.data != null ? body.data : body
		const list = Array.isArray(data) ? data : [data]
		const first = list.length > 0 ? list[0] : null
		const url = first != null && first.url != null ? '' + first.url : ''
		if (url.length == 0) throw new Error('上传成功但未返回文件地址')
		return url
	} catch (e) {
		if (e instanceof Error) throw e
		throw new Error('上传响应解析失败')
	}
}

/**
 * 本地临时路径上传媒体；副作用：带 Bearer 调 uni.uploadFile
 * @returns /static 相对路径
 */
export function uploadMedia(filePath: string, category: UploadMediaCategory): Promise<string> {
	return new Promise((resolve, reject) => {
		const token = getToken()
		const header: Record<string, string> = {}
		if (token.length > 0) {
			header['Authorization'] = 'Bearer ' + token
		}
		uni.uploadFile({
			url: getBaseUrl() + '/resources/upload-media?category=' + category,
			filePath,
			name: 'fileContents',
			formData: { category },
			header,
			success: (res) => {
				if (res.statusCode != null && (res.statusCode < 200 || res.statusCode >= 300)) {
					reject(new Error('上传失败(' + res.statusCode + ')'))
					return
				}
				try {
					resolve(parseUploadUrl('' + res.data))
				} catch (e) {
					reject(e instanceof Error ? e : new Error('上传失败'))
				}
			},
			fail: (err) => {
				reject(new Error(err.errMsg != null ? '' + err.errMsg : '上传失败'))
			},
		})
	})
}

/**
 * 上传文章封面
 */
export function uploadCover(filePath: string): Promise<string> {
	return uploadMedia(filePath, 'cover')
}

/**
 * 上传正文插图
 */
export function uploadArticleImage(filePath: string): Promise<string> {
	return uploadMedia(filePath, 'article')
}
