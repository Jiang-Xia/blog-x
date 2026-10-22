/**
 * 服务端公钥（与 blog-home-nuxt config/ssh、uniapp config/ssh 一致）
 * 用途：登录密码 RSA 加密、网关 aes 套件封对称 key
 */

/** 服务端 RSA 公钥（2048），登录与 gatewayCrypto=aes 封 key 共用 */
export const serverPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoyuytldk/BDUvuGUDwW
RplrndYgD0rS+5iP3OOMLH6peR/mjCNkeBQWHmXMfl6KXfwNncYkqtUzANqE7fOv
AoYtiDsnoCAhifhCqIp8+6a0k4WfPztOMSfXyWsTKG85kyMseXE1EWQ+Dy5C0WA8
7adrEr2ceR+jPbsWZA1byQfaL/sHTm9DrcP3QNM9RSVG5tiRQlG8cGSuM3WaKKsA
Fp6wIfkDfKkTXLxQq8C+foFciklA9bCy7gy8k9myT7n+6XIjAIOxeGhcGavB6fAW
wKSr0Q6iopAGJBye+/4pdeuJjdr2MkYR6442lSuBTmNdYKJv/4r3TSGG5u9Inl57
owIDAQAB
-----END PUBLIC KEY-----`
