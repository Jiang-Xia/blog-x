/**
 * 列表下拉刷新 + 上滑加载更多状态机
 * 配合 `x-scroll-page` 或 Tab 内带 refresher 的 scroll-view 使用
 *
 * 约定：
 * - 刷新：beginRefresh → 拉第 1 页 → endRefresh(本页条数, 列表总长, total?)
 * - 加载更多：beginLoadMore 返回页码（0 表示应跳过）→ 追加 → endLoadMore(...)
 * - 有 total 时用 listLen < total 判断 hasMore；否则用 gotCount >= pageSize
 */

/**
 * 创建列表滚动分页状态
 * @param pageSize 每页条数，默认 10
 */
export function useListScroll(pageSize = 10) {
	const page = ref(1)
	const refreshing = ref(false)
	const loadingMore = ref(false)
	const hasMore = ref(true)
	const pullingDistance = ref(0)
	/** 至少完成过一次首屏/刷新，才展示底栏文案 */
	const initialLoaded = ref(false)

	/** 底栏文案 */
	const footerText = computed((): string => {
		if (loadingMore.value) return '加载中…'
		if (!hasMore.value) return '没有更多了'
		return '上滑加载更多'
	})

	/** 是否展示底栏（空列表也可展示「没有更多了」） */
	const showFooter = computed((): boolean => {
		return initialLoaded.value
	})

	/**
	 * 根据本页条数与可选 total 更新 hasMore
	 * @param gotCount 本页实际条数
	 * @param listLen 当前列表总长
	 * @param total 接口 total；传 -1 表示未知，改用 pageSize 推断
	 */
	function updateHasMore(gotCount: number, listLen: number, total: number): void {
		if (total >= 0) {
			hasMore.value = listLen < total
			return
		}
		hasMore.value = gotCount >= pageSize
	}

	/**
	 * 下拉过程：同步拉动距离给 uni-refresh-box
	 */
	function onRefresherPulling(e: any): void {
		if (e != null && e.detail != null) {
			pullingDistance.value = e.detail.dy as number
		}
	}

	/** 刷新复位 */
	function onRefresherRestore(): void {
		pullingDistance.value = 0
	}

	/** 刷新中止 */
	function onRefresherAbort(): void {
		pullingDistance.value = 0
	}

	/**
	 * 开始下拉刷新：重置页码；返回 pageSize 供请求
	 */
	function beginRefresh(): number {
		refreshing.value = true
		loadingMore.value = false
		page.value = 1
		hasMore.value = true
		return pageSize
	}

	/**
	 * 结束刷新
	 * @param gotCount 本页条数
	 * @param listLen 刷新后列表长度
	 * @param total 可选总条数，-1 未知
	 */
	function endRefresh(gotCount: number, listLen: number, total = -1): void {
		refreshing.value = false
		pullingDistance.value = 0
		initialLoaded.value = true
		updateHasMore(gotCount, listLen, total)
		page.value = 2
	}

	/**
	 * 开始触底加载；返回要请求的页码，0 表示应跳过
	 */
	function beginLoadMore(): number {
		if (refreshing.value || loadingMore.value || !hasMore.value) {
			return 0
		}
		loadingMore.value = true
		return page.value
	}

	/**
	 * 结束触底加载
	 * @param gotCount 本页条数
	 * @param listLen 追加后列表长度
	 * @param total 可选总条数，-1 未知
	 */
	function endLoadMore(gotCount: number, listLen: number, total = -1): void {
		loadingMore.value = false
		if (gotCount > 0) {
			page.value = page.value + 1
		}
		updateHasMore(gotCount, listLen, total)
	}

	/**
	 * 筛选条件变更时重置分页（保留列表由调用方清空）
	 */
	function resetPaging(): void {
		page.value = 1
		hasMore.value = true
		loadingMore.value = false
	}

	return {
		pageSize,
		page,
		refreshing,
		loadingMore,
		hasMore,
		pullingDistance,
		footerText,
		showFooter,
		onRefresherPulling,
		onRefresherRestore,
		onRefresherAbort,
		beginRefresh,
		endRefresh,
		beginLoadMore,
		endLoadMore,
		resetPaging,
	}
}
