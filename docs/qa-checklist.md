# blog-x 小卡原型落地 — 人工验收清单

> Agent 不启动 HBuilderX / 微信开发者工具；由开发者本地验证。

## Android 基座（HBuilderX）

- [ ] 四 Tab 可切换（毛玻璃悬浮底栏 ⌂/◎/✦/☺）：首页 / 发现 / 冒险 / 我的
- [ ] 底栏为 tab-bar-blur 风格（圆角悬浮、半透明；选中薄荷绿 tint）
- [ ] 冒险 Tab 展示冒险中心（Hero、签到、瓦片），底栏仍在
- [ ] 首页：搜索、铃铛、AI、今日任务、全部、文章卡片可跳转；写文章 Toast
- [ ] 发现：归档 / 留言 / 友链 / 热门可进；标签墙 Toast
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

前置：`api/config.ts` 中 `USE_MOCK=false`，`API_ORIGIN` 指向可用后端（默认 `http://localhost:5000`），已启动 Nest/Go。

- [ ] 首页文章列表来自 `POST /article/list`（非仅 mock 三篇）
- [ ] 详情 `GET /article/info`；赞/藏打到 `/like` `/collect`
- [ ] 搜索带 `title` 参数有结果或空列表
- [ ] 归档 / 友链 / 留言列表为服务端数据
- [ ] 微信小程序：登录页 `POST /user/auth/wechat/miniprogram` 成功后有 token
- [ ] 账号登录：`GET /user/authCode` + `POST /user/login`（密码 RSA）；Pinia `loggedIn` 为 true
- [ ] 冷启动自动登录：本地有 token 时请求带 `Authorization: Bearer`
- [ ] `OPEN_ENCRYPT=true`：控制台可见 `/encrypt` 路径；GET 带 `X-Gateway-*`；响应可正常解包
- [ ] `OPEN_REQUEST_LOG=true`：有 `请求开始 req -------------->` / `请求结束 res -------------->` 规范日志
- [ ] 401 后 refresh 成功可重放；refresh 失败跳登录
- [ ] 冒险签到 `POST /rpg/sign`；抽奖 `POST /rpg/lottery/draw`；排行 `GET /rpg/leaderboard`
- [ ] 充值下单返回 `outTradeNo`（真支付到账需支付宝环境）
- [ ] 通知 / 收件箱有列表或空态；AI 页配额文案来自 `/rag/quota`
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
| inbox | `/pages-blog/inbox/index` | |
| profile | `/pages-blog/profile/index` | |
| audit | `/pages-blog/audit/index` | mock 保留 |
| ai | `/pages-blog/ai/index` | 配额联调；对话流式后置 |
| lottery | `/pages-rpg/lottery/index` | |
| rank | `/pages-rpg/rank/index` | |
| calendar | `/pages-rpg/calendar/index` | |
| recharge | `/pages-rpg/recharge/index` | |
| 写文章 / 标签墙 / 背包 | Toast 示意 | |

## 本阶段不做

- 审核台真实 C 端 API、写文章 / 标签墙 / 背包独立页
- 微信支付真单、AI 流式问答（端能力就绪后再接）
