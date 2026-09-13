# Agri Machare

農機具（AGRIcultural MACHinery）をシェア（sHARE）するサービス。

## 開発

Node.js は `.node-version`、pnpm は `package.json` の `packageManager` に指定したバージョンを使用します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

http://localhost:3000 で確認できます。現在のデータはサーバー内のサンプル（農機具 48 件・運搬案件 10 件を `lib/server/` で決定的に生成）で、環境変数やデータベースの設定は不要です。出品・問い合わせ・運搬者登録・案件応募・お問い合わせの各フォームは API で検証して受付番号を返しますが、保存や決済は未実装です。保存先を追加する場合は `lib/server/submissions.ts` の `acceptSubmission` を差し替えます。

## ページ構成

| パス                           | 内容                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `/`                            | トップ。注目の農機具 6 件と運搬案件 3 件を表示               |
| `/listings`                    | 農機具一覧。キーワード・カテゴリ・取引条件・ページネーション |
| `/listings/new`                | 出品フォーム                                                 |
| `/listings/[id]`               | 農機具の詳細と同じカテゴリの農機具                           |
| `/listings/[id]/inquiry`       | 出品者への連絡（購入・レンタル・レンタル購入・質問）         |
| `/transport`                   | 運搬案件ボード                                               |
| `/transport/[id]`              | 運搬案件の詳細と応募フォーム                                 |
| `/transport/register`          | 運搬者登録フォーム                                           |
| `/transport/pricing`           | 運搬料金のめやす                                             |
| `/guide` / `/faq` / `/contact` | はじめての方へ / よくある質問 / お問い合わせフォーム         |

## 品質チェック

`pnpm check` で lint・整形・型・未使用コード・テストをまとめて確認できます。本番ビルドは `pnpm build` で別途確認します。既存の `next/font/google` はビルド時に Google Fonts へのネットワーク接続を使用します。

| コマンド             | 内容                                                |
| -------------------- | --------------------------------------------------- |
| `pnpm lint`          | Next.js / React / TanStack Query の ESLint チェック |
| `pnpm lint:fix`      | ESLint の自動修正                                   |
| `pnpm format`        | Prettier で整形                                     |
| `pnpm format:check`  | 整形の差分確認                                      |
| `pnpm typecheck`     | Next.js の型生成と `tsc --noEmit`                   |
| `pnpm knip`          | 未使用ファイル・依存関係・export の検出             |
| `pnpm test`          | Vitest の一括実行                                   |
| `pnpm test:watch`    | Vitest の監視実行                                   |
| `pnpm test:coverage` | テストとカバレッジ出力（`coverage/`）               |
| `pnpm build`         | 本番ビルド（型エラーも検出）                        |

変更時は失敗するテストを先に追加し、最小限の実装で通した後に整理します。サーバーサービスと API のテストに加え、画面では実際の QueryClient と Testing Library を使って取得・エラー・再試行を検証します。テスト環境だけ `server-only` をモックし、本番のサーバー境界は Next.js が検証します。

## データ取得と責務

- `lib/server/` は `server-only`。サンプルデータ、検索、取引方法の判定、運送料見積もりを管理します。
- `lib/data.ts` は共有の型・選択肢・表示用フォーマットです。クライアントにデータソースを含めません。
- トップと一覧ページの初期データは Server Component で取得して画面に渡します。条件を変えたあとの取得は TanStack Query から `GET /api/listings` を呼び出します。
- Query key はカテゴリ・取引条件・キーワード・ページを含みます。リクエストのキャンセル、キャッシュ、読込中・エラー・再試行を Query で管理します。
- 一覧ページの検索条件は URL（`q` / `category` / `deal` / `page`）と同期し、ブラウザの戻る・進むに追従します。
- 詳細ページと運搬一覧はサーバーでデータを取得します。クライアントには選択状態など表示に必要な処理を残します。
- 入力検証は `lib/validation/` に置き、フォーム（送信前）と API（受信時）の両方で同じ関数を使います。

`GET /api/listings` は `category`（`すべて` または画面のカテゴリ）、`deal`（`all` / `sale` / `rent` / `rentToOwn`）、`q`（キーワード、100 文字まで）、`page`、`pageSize`（1〜48、既定 12）を受け取り、`{ items, total, page, pageSize, pageCount }` を返します。不正条件は HTTP 400 です。

フォーム送信の API は `POST /api/listings`、`POST /api/listings/[id]/inquiries`、`POST /api/transport/registrations`、`POST /api/transport/jobs/[id]/applications`、`POST /api/contact` です。成功時は HTTP 201 で `{ id, receivedAt }`、検証エラーは 400 で `{ error, errors }`、対象がない場合は 404 を返します。

TanStack Query の初期データとキャッシュの構成は [公式 SSR ガイド](https://tanstack.com/query/latest/docs/framework/react/guides/ssr) を参照してください。

## CI

GitHub Actions は PR と `main` への push で動作します。lint / format / typecheck / knip / test:coverage / build の 6 ジョブを並列実行し、ひとつが失敗しても他の結果を収集します。同じブランチの古い実行はキャンセルします。

各ジョブは `pnpm install --frozen-lockfile` で依存を固定し、テストのカバレッジを artifact に保存します。Dependabot が npm と GitHub Actions の更新 PR を作成します。
