# blog-x 小卡原型落地 — 人工验收清单

> Agent 不启动 HBuilderX / 微信开发者工具；由开发者本地验证。

## Android 基座（HBuilderX）

- [ ] 四 Tab 可切换（毛玻璃悬浮底栏 ⌂/◎/✦/☺）：首页 / 发现 / 冒险 / 我的
- [ ] 底栏为 tab-bar-blur 风格（圆角悬浮、半透明；选中薄荷绿 tint）
- [ ] 冒险 Tab 展示冒险中心（Hero、签到、瓦片），底栏仍在
- [ ] 首页：搜索、铃铛、AI、今日任务进度、全部、文章卡片可跳转；写文章进创作页
- [ ] 发现：归档 / 留言 / 友链 / 热门 / 标签墙可进
- [ ] 我的：收藏 / 收件箱 / 主页 / 审核 / 登录 / 通知可进
- [ ] 详情：赞 / 藏 Toast；赏打开 Sheet；支付关闭并 Toast；AI 卡进助手
- [ ] 签到成功后按钮变「已签」、钻石/连续天数变化；首页今日文案同步
- [ ] 抽奖：中心「抽一次」高亮轮转后 Toast
- [ ] 充值：选档支付后钻石增加，回冒险中心可见
- [ ] 登录：账号登录（验证码）与微信一键登录均可；成功后回「我的」可见资料
- [ ] 杀进程重进：有 token 缓存时自动登录，无需再点登录
- [ ] 二级页左上角返回正常

## 微信开发者工具

- [ ] 打开 `unpackage/dist/dev/mp-weixin`（或发行产物）
- [ ] 分包路径含 root（如 `/pages-blog/archives/index`、`/pages-rpg/lottery/index`）
- [ ] 主包体积可接受；preloadRule 不报错
- [ ] 无非法 WXSS / 编译错误

## 联调（blog-server）

前置：`api/config.ts` 中 `USE_MOCK=false`；`api/dev-target.js` 的 `API_ORIGIN` 指向可用后端（默认 `http://localhost:5000`）；Web 联调保持 `WEB_DEV_PROXY=true`（经 Vite `/x-api` 代理）。已启动 Nest/Go（本地时）。

- [ ] 首页文章列表来自 `POST /article/list`（非仅 mock 三篇）
- [ ] 首页 / 收藏 / 搜索 / 留言 / 消息等长列表可纵向滚动；下拉刷新生效；有分页的上滑能加载更多
- [ ] 详情 `GET /article/info`；赞/藏打到 `/like` `/collect`
- [ ] 详情发表评论 `POST /comment/create`；未登录引导登录
- [ ] 收件箱回复 `POST /reply/create`（parentId=评论 id，replyUid=评论者）
- [ ] 搜索带 `title` 参数有结果或空列表；标签墙点击带 `q` 进搜索
- [ ] 标签墙 `GET /tag` 有列表或空态
- [ ] 归档 / 友链 / 留言列表为服务端数据
- [ ] 微信小程序：登录页 `POST /user/auth/wechat/miniprogram` 成功后有 token
- [ ] 账号登录：`GET /user/authCode` + `POST /user/login`（密码 RSA）；Pinia `loggedIn` 为 true
- [ ] 冷启动自动登录：本地有 token 时请求带 `Authorization: Bearer`
- [ ] `OPEN_ENCRYPT=true`：控制台可见 `/encrypt` 路径；GET 带 `X-Gateway-*`；响应可正常解包
- [ ] `OPEN_REQUEST_LOG=true`：有 `[gateway-crypto] encrypt out` / `decrypt in`（密文截断）；无明文 body / 无 `请求开始 req`
- [ ] 401 后 refresh 成功可重放；refresh 失败跳登录
- [ ] 冒险签到 `POST /rpg/sign`；任务领取 `POST /rpg/quest/claim`；抽奖 / 排行正常
- [ ] 签到日历摘要来自 `GET /rpg/sign-info`；网格按连续天数回溯（非 mock hits）
- [ ] 首页「今日进度」含签到态 + 任务 done/total（`/rpg/my-quests`）
- [ ] 消息中心分段「评论/赞藏/系统」能过滤列表
- [ ] 写文章：封面 `upload-media?category=cover`；分类 `/category`；标签 `/tag`；定时 `status=scheduled` + scheduledPublishAt；正文工具栏插图；`POST /article/create`；未登录跳登录
- [ ] 背包装扮：`GET /rpg/inventory` + `/rpg/loadout`；称号/头像框穿戴卸下；宠物段 `GET /rpg/pets` 出战/休息
- [ ] 审核台：`GET /sensitive-word/hit`（来源/状态筛选）；待审项 `approve` / `reject`；需管理员登录
- [ ] 详情打赏：钻石档位 → `POST /rpg/article/tip`；站点赞赏 → `POST /site/tip/create` + status 轮询
- [ ] 充值下单返回 `outTradeNo`（真支付到账需支付宝环境）
- [ ] 通知 / 收件箱有列表或空态；AI 配额来自 `/rag/quota`；发送走 `/rag/query-stream` 有流式或整包回复
- [ ] `USE_MOCK=true` 时仍可离线演示原型交互

## 对照原型功能清单

| 原型 | 路径 | 状态 |
|------|------|------|
| Tab home | `/pages/index/index`（tab=0，tab-bar-blur） | |
| Tab discover | `/pages/index/index?tab=1` | |
| Tab rpg | `/pages/index/index?tab=2` | |
| Tab me | `/pages/index/index?tab=3` | |
| login | `/pages/login/login` | |
| search | `/pages/search/search` | |
| detail + tipSheet | `/pages/detail/detail` | |
| notify | `/pages/notify/notify` | |
| archive | `/pages-blog/archives/index` | |
| guestbook | `/pages-blog/guestbook/index` | |
| links | `/pages-blog/links/index` | |
| favorites | `/pages-blog/favorites/index` | |
| inbox | `/pages-blog/inbox/index` | 列表 + 回复联调 |
| profile | `/pages-blog/profile/index` | |
| audit | `/pages-blog/audit/index` | hit 列表 + approve/reject |
| ai | `/pages-blog/ai/index` | 配额 + query-stream |
| tags | `/pages-blog/tags/index` | GET /tag |
| lottery | `/pages-rpg/lottery/index` | |
| rank | `/pages-rpg/rank/index` | |
| calendar | `/pages-rpg/calendar/index` | sign-info 推当月格子 |
| notify 分段 | `/pages/notify/notify` | 评论/赞藏/系统前端过滤 |
| home 今日进度 | 首页 Tab | sign-info + my-quests |
| recharge | `/pages-rpg/recharge/index` | |
| tipSheet | 详情内 `x-tip-sheet` | 钻石 tip + 站点赞赏 |
| write | `/pages-blog/write/index` | 封面 + 分类/标签/定时 + MD 工具栏 + createArticle |
| backpack | `/pages-rpg/backpack/index` | inventory + loadout + 宠物槽 |

## 本阶段不做

- 微信支付真单（站点赞赏走支付宝链接复制 + 轮询）
- 工具箱分包 `pages-tool` 真实工具
