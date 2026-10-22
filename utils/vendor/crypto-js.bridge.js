/**
 * @deprecated 勿再被 TS 具名 import。
 * H5 Vite 为 ESM，CJS `exports.CryptoJS` 不会变成 `import { CryptoJS }`。
 * 请使用 utils/lib/crypto-js.ts（副作用加载 UMD + 读 globalThis）。
 *
 * 本文件保留仅为避免旧缓存路径 404；不做具名 ESM export。
 */
'use strict'
require('./crypto-js.js')
