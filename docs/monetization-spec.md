# MahjongCalc 正式可收費版規格

## 1) 產品分層

- Free（免費）
  - 可用：計算、紀錄、依對象結算
  - 限制：報表不可用
  - 顯示：廣告顯示
- Pro Monthly（月訂閱 NT$30）
  - 可用：報表（本次 / 本月 / 本年）
  - 廣告：保留
- Pro Lifetime（一次買斷 NT$150）
  - 可用：報表（本次 / 本月 / 本年）
  - 廣告：移除

## 2) 權限模型

- `plan`: `free | monthly | lifetime`
- `status`: `active | expired | canceled | grace_period`
- `activated_at`: datetime
- `expires_at`: datetime/null（lifetime 為 null）
- `source`: `apple | google | web`
- `transaction_id`: string

## 3) 前端判斷規則

- `hasReportAccess = plan in [monthly, lifetime] && status in [active, grace_period]`
- `showAds = plan !== lifetime`

## 4) API 需求（最小）

- `GET /api/billing/me`
  - 回傳目前使用者 plan/status/expiry
- `POST /api/billing/checkout`
  - body: `{ product: "monthly" | "lifetime" }`
  - 回傳支付頁 URL 或 client secret
- `POST /api/billing/webhook`
  - 金流事件同步（付款成功、續訂、取消、退款）

## 5) 資料表建議

- `users`
- `subscriptions`
  - `user_id`
  - `plan`
  - `status`
  - `activated_at`
  - `expires_at`
  - `provider`
  - `provider_txn_id`
- `payments`
  - `user_id`
  - `amount`
  - `currency`
  - `status`
  - `provider`
  - `provider_txn_id`

## 6) 金流流程

1. 使用者點「月訂閱 / 買斷」
2. 前端呼叫 `checkout`
3. 完成付款
4. 後端 webhook 驗證簽章並寫入 subscription
5. 前端輪詢/刷新 `billing/me` 更新 UI

## 7) 重要邊界條件

- 月訂閱到期：自動降級 free（報表鎖定、廣告顯示）
- grace period：可繼續看報表，顯示續費提醒
- 退款：依平台政策降級
- 多裝置登入：權限由後端統一判斷

## 8) UI 文案建議（舒適版）

- 免費版：計算與紀錄可用（含廣告）
- 月訂閱：解鎖報表
- 終身買斷：解鎖報表＋移除廣告

## 9) 上線順序（建議）

1. 前端先做本機模擬（已完成）
2. 後端建立 `billing/me` 與 webhook
3. 串接金流（TapPay / 綠界 / Stripe）
4. QA 驗證到期、取消、退款、跨裝置
5. 灰度上線
