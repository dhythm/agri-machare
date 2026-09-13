# Agri Machare

農機具（AGRIcultural MACHinery）をシェア（sHARE）するサービス。

## 開発

Node.js は `.node-version`、pnpm は `package.json` の `packageManager` に指定したバージョンを使用します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

http://localhost:3000 で確認できます。起動時にサンプル（農機具 48 件・運搬案件 10 件を `lib/server/` で決定的に生成）を投入します。出品と運搬依頼は作成後に審査待ちとなり、運営が承認すると公開されます。問い合わせ・応募・運搬者登録・お問い合わせも保存されます。決済と本格的な認証は未実装です。

## データストア

`DATA_STORE` 環境変数でストアを切り替えます。Docker やデータベースサーバーは不要です。

| コマンド         | ストア                      | 用途                                                                                          |
| ---------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm dev`       | インメモリ（既定）          | 通常の開発・Vercel などでのモック表示。プロセス再起動で初期状態に戻る。将来 PostgreSQL へ移行 |
| `pnpm dev:mock`  | インメモリ                  | `pnpm dev` と同じ。意図を明示したいとき                                                       |
| `pnpm dev:agent` | PGlite（組み込み Postgres） | エージェント環境・CI で DB を操作しながら実装する。データは `.data/pglite/` に永続化          |

- `lib/server/store/repository.ts` がコレクションごとの契約（`list` / `get` / `create` / `update` / `delete`、すべて非同期）です。
- `lib/server/store/memory.ts` が揮発性のインメモリ実装、`lib/server/store/pglite/` が PGlite 実装です。どちらも `lib/server/store/repository-contract.test.ts` の同じ契約テストを通ります。
- PGlite のスキーマは `db/migrations/*.sql`（PostgreSQL 向けの DDL）で管理し、起動時に未適用分を `schema_migrations` に記録しながら適用します。`listings` が空ならサンプルを投入します。PostgreSQL に移す際は `lib/server/store/pglite/sql-repository.ts` の接続先を差し替えるだけで、SQL とテーブル定義は共通です。
- `lib/server/store/index.ts` が `listings` / `transportJobs` / `submissions` を `globalThis` 上のシングルトンとして提供します（開発時の HMR で消えません）。テストでは `resetStore()` で初期化します。
- サービス（`lib/server/listings.ts` / `transport.ts` / `submissions.ts`）はストア経由でのみデータに触れます。
- 連絡先メールアドレスは公開エンティティに保存せず、農機具・案件の公開フィールドにも含めません。
- 更新・削除の API は認証がなく誰でも実行できます。本番実装時に認証と合わせて制限します。
- 運営審査は暫定の共有キー（`ADMIN_SECRET`。未設定かつ非本番では `dev-admin`）です。本番の認証（Clerk 等）に置き換えてください。本番で `ADMIN_SECRET` が未設定のときは審査 API を拒否します。

### PGlite の操作

| コマンド                   | 内容                                                      |
| -------------------------- | --------------------------------------------------------- |
| `pnpm db:migrate`          | 未適用のマイグレーションを適用（空ならサンプル投入）      |
| `pnpm db:reset`            | データディレクトリを削除して作り直す                      |
| `pnpm db:sql "select ..."` | SQL を 1 文実行して結果を表示（`dev:agent` 稼働中でも可） |
| `pnpm test:pglite`         | テスト全体を PGlite（`memory://`）上で実行                |

データディレクトリは `PGLITE_DATA_DIR` で変更できます（既定 `.data/pglite`、`memory://` で揮発）。新しいマイグレーションは `db/migrations/0002_xxx.sql` のように連番で追加します。

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
| `/admin`                       | 運営審査。出品と運搬依頼の承認・却下（暫定の共有キー）       |

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

CRUD の API は次のとおりです。成功時は作成が HTTP 201、取得・更新が 200、削除が 204、検証エラーは 400 で `{ error, errors }`、対象がない場合は 404 を返します。

| メソッドとパス                                | 内容                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `POST /api/listings`                          | 農機具を作成（`moderationStatus: pending`）。`{ id, receivedAt, listing }`                  |
| `GET / PUT / DELETE /api/listings/[id]`       | 公開取得は承認済みのみ。更新・削除（問い合わせも削除）                                      |
| `POST /api/listings/[id]/inquiries`           | 出品者への連絡を保存。`{ id, receivedAt }`                                                  |
| `GET / POST /api/transport/jobs`              | 公開一覧は承認済みのみ。作成は審査待ち `{ id, receivedAt, job }`                            |
| `GET / PUT / DELETE /api/transport/jobs/[id]` | 公開取得は承認済みのみ。更新・削除（応募も削除）                                            |
| `POST /api/transport/jobs/[id]/applications`  | 案件への応募を保存                                                                          |
| `POST /api/transport/registrations`           | 運搬者登録を保存                                                                            |
| `POST /api/contact`                           | お問い合わせを保存                                                                          |
| `GET / POST / DELETE /api/admin/session`      | 運営キーの確認・入室（Cookie）・退室                                                        |
| `GET / POST /api/admin/queue`                 | 審査キュー。`status=pending\|approved\|rejected\|all`。判定は `{ kind, id, status, note? }` |

TanStack Query の初期データとキャッシュの構成は [公式 SSR ガイド](https://tanstack.com/query/latest/docs/framework/react/guides/ssr) を参照してください。

## CI

GitHub Actions は PR と `main` への push で動作します。lint / format / typecheck / knip / test:coverage / test:pglite / build の 7 ジョブを並列実行し、ひとつが失敗しても他の結果を収集します。同じブランチの古い実行はキャンセルします。

各ジョブは `pnpm install --frozen-lockfile` で依存を固定し、テストのカバレッジを artifact に保存します。Dependabot が npm と GitHub Actions の更新 PR を作成します。
