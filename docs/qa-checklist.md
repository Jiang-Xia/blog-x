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
- [ ] 登录：微信一键登录 Toast 后返回
- [ ] 二级页左上角返回正常

## 微信开发者工具

- [ ] 打开 `unpackage/dist/dev/mp-weixin`（或发行产物）
- [ ] 分包路径含 root（如 `/pages-blog/archives/index`、`/pages-rpg/lottery/index`）
- [ ] 主包体积可接受；preloadRule 不报错
- [ ] 无非法 WXSS / 编译错误

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
| audit | `/pages-blog/audit/index` | |
| ai | `/pages-blog/ai/index` | |
| lottery | `/pages-rpg/lottery/index` | |
| rank | `/pages-rpg/rank/index` | |
| calendar | `/pages-rpg/calendar/index` | |
| recharge | `/pages-rpg/recharge/index` | |
| 写文章 / 标签墙 / 背包 | Toast 示意 | |

## 本阶段不做

- blog-server 真实联调、微信支付真单
- 写文章 / 标签墙 / 背包独立页
