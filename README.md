# Agri Machare

農機具（AGRIcultural MACHinery）をシェア（sHARE）するサービス。

## 開発

Node.js は `.node-version`、pnpm は `package.json` の `packageManager` に指定したバージョンを使用します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

http://localhost:3000 で確認できます。起動時にサンプル（農機具 48 件・運搬案件 10 件を `lib/server/` で決定的に生成）を投入します。出品と運搬依頼は作成後に審査待ちとなり、運営が承認すると公開されます。問い合わせ・応募・運搬者登録・お問い合わせも保存されます。決済は未実装です。

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
- 出品・運搬依頼・問い合わせ・応募はログインが必要で、作成者の ID を `ownerUserId`（submission は `userId`）として保存します。更新・削除は所有者または運営のみ、審査待ち・却下の行は所有者と運営だけが閲覧できます。

## 認証

Auth.js（next-auth v5）の Credentials プロバイダを使い、外部サービスなしで動きます。セッションは JWT を Cookie に保存します。ユーザーテーブルは持たず、デモアカウントを環境変数から読みます（`.env.example` 参照）。

| 環境変数                                     | 内容                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`                                | セッション署名用。本番では必須（未設定だと Auth.js がリクエストを拒否）。非本番は固定値に代替 |
| `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD`   | 運営ロール（`admin`）のデモアカウント                                                         |
| `DEMO_SELLER_EMAIL` / `DEMO_SELLER_PASSWORD` | 出品者役（`user`）のデモアカウント。手書きのサンプル出品 6 件と運搬案件 2 件を所有            |
| `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD`     | 買い手・運搬者役（`user`）のデモアカウント                                                    |

非本番でアカウントが未設定なら `admin@example.com` / `dev-admin`、`seller@example.com` / `dev-seller`、`user@example.com` / `dev-user` を使えます。本番（Vercel など）ではメールとパスワードの両方を設定したアカウントだけが有効になります。

- `auth.ts` が Auth.js の設定（`handlers` / `auth`）です。`app/api/auth/[...nextauth]` が Auth.js のエンドポイントです。
- `lib/server/auth/accounts.ts` が環境変数からアカウントを読み、定数時間比較で認証します。`lib/server/auth/session.ts` の `getCurrentUser()` / `requireUser()` / `requireAdmin()` / `canManage()` / `canView()` をページと API で使います。
- `/account`（マイページ）は `lib/server/account.ts` で自分の出品・運搬依頼と届いた問い合わせ・応募、送った問い合わせ・応募をまとめます。
- 問い合わせと応募はスレッドになります（`lib/server/threads.ts`）。参加者は送信者と対象の所有者で、運営は閲覧のみです。両参加者が返信でき（`messages` テーブル）、対象の所有者が状態（未対応 / 対応中 / 成約 / 見送り）を変えます。応募を成約にすると案件は「調整中」になり、所有者はマイページから「完了」にできます。応募を受け付けるのは「募集中」の案件だけで、「完了」の案件は公開ボードに出ません。
- レンタル購入は出品ごとの条件（`rentToOwnCreditRate` %、任意の `rentToOwnCreditCap` 円）で計算します（`lib/rent-to-own.ts`）。詳細ページのシミュレーターで日数から充当額と購入価格を確認でき、期間を指定してレンタルを申し込めます（`lib/server/rentals.ts`、`rentals` テーブル）。申込 → 所有者が承認（レンタル中）または辞退 → 申込者が購入に切り替え（申込時の条件で購入価格を確定）または所有者が返却を確認。申込中・レンタル中の期間は予約済みとして重複申込を 409 で拒否します。運営は閲覧のみです。
- テストでは `test/mock-auth.ts` で `@/auth` を差し替え、`signInAs()` でログイン状態を切り替えます。
- 運営審査（`/admin`、`/api/admin/queue`）は「ログイン済みかつ `role === 'admin'`」で許可します。未ログインは 401（ページはログインへリダイレクト）、権限なしは 403 です。
- `/admin` 以下は `app/admin/layout.tsx` の管理者画面レイアウト（`components/admin/admin-shell.tsx`。サイドバーの運営メニューと上部バー）で描画し、利用者向けのヘッダー・フッターは使いません。認証ゲートはこのレイアウトで行い、配下のページは運営であることを前提にデータ取得だけ行います。メニューはダッシュボード / アカウント管理 / 取引管理 / 運搬管理（`components/admin/admin-nav.tsx`）で、各管理画面は上部タブ（`components/admin/admin-section.tsx`）で内容を切り替えます。一覧データは `lib/server/admin-overview.ts` から取得します。アカウント管理はいま環境変数のアカウント一覧で、停止などの操作はユーザーテーブルを作る次のタスクです。
- ヘッダーのログイン / ログアウトはクライアント側で `useSession()` を使い、ページの静的レンダリングを壊しません。

### PGlite の操作

| コマンド                   | 内容                                                      |
| -------------------------- | --------------------------------------------------------- |
| `pnpm db:migrate`          | 未適用のマイグレーションを適用（空ならサンプル投入）      |
| `pnpm db:reset`            | データディレクトリを削除して作り直す                      |
| `pnpm db:sql "select ..."` | SQL を 1 文実行して結果を表示（`dev:agent` 稼働中でも可） |
| `pnpm test:pglite`         | テスト全体を PGlite（`memory://`）上で実行                |

データディレクトリは `PGLITE_DATA_DIR` で変更できます（既定 `.data/pglite`、`memory://` で揮発）。新しいマイグレーションは `db/migrations/0002_xxx.sql` のように連番で追加します。

## ページ構成

| パス                           | 内容                                                                                                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                            | トップ。注目の農機具 6 件と運搬案件 3 件を表示                                                                                                                                                           |
| `/listings`                    | 農機具一覧。キーワード・カテゴリ・取引条件・ページネーション                                                                                                                                             |
| `/listings/new`                | 出品フォーム                                                                                                                                                                                             |
| `/listings/[id]`               | 農機具の詳細と同じカテゴリの農機具                                                                                                                                                                       |
| `/listings/[id]/inquiry`       | 出品者への連絡（購入・レンタル・レンタル購入・質問）                                                                                                                                                     |
| `/transport`                   | 運搬案件ボード                                                                                                                                                                                           |
| `/transport/[id]`              | 運搬案件の詳細と応募フォーム                                                                                                                                                                             |
| `/transport/register`          | 運搬者登録フォーム                                                                                                                                                                                       |
| `/transport/pricing`           | 運搬料金のめやす                                                                                                                                                                                         |
| `/guide` / `/faq` / `/contact` | はじめての方へ / よくある質問 / お問い合わせフォーム                                                                                                                                                     |
| `/login`                       | ログイン（メールアドレスとパスワード）                                                                                                                                                                   |
| `/account`                     | マイページ。自分の出品・運搬依頼と届いた連絡、送った連絡、案件の完了、借りている / 貸している農機具の操作                                                                                                |
| `/account/threads/[id]`        | 問い合わせ・応募のやり取り（返信、所有者は状態変更）                                                                                                                                                     |
| `/transport/new`               | 運搬依頼フォーム（要ログイン）                                                                                                                                                                           |
| `/admin`                       | 運営画面（管理者レイアウト）。ダッシュボード、アカウント管理 `/admin/accounts`、取引管理 `/admin/deals`（出品審査 / レンタル / 問い合わせ）、運搬管理 `/admin/transport`（運搬依頼審査 / 応募 / 運搬者） |

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

| メソッドとパス                                | 内容                                                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/listings`                          | 農機具を作成（要ログイン、`moderationStatus: pending`）。`{ id, receivedAt, listing }`                                     |
| `GET / PUT / DELETE /api/listings/[id]`       | 取得は承認済み、または所有者・運営。更新・削除は所有者・運営のみ（問い合わせも削除）                                       |
| `GET / POST /api/listings/[id]/rentals`       | 予約済み期間の取得（公開）と申込 `{ startDate, endDate }`（要ログイン。重複・貸出不可は 409）                              |
| `PATCH /api/rentals/[id]`                     | レンタルの状態変更 `{ status }`（所有者: active / cancelled / completed、申込者: cancelled / converted。不正な遷移は 409） |
| `POST /api/listings/[id]/inquiries`           | 出品者への連絡を保存（要ログイン）。`{ id, receivedAt }`                                                                   |
| `GET / POST /api/transport/jobs`              | 公開一覧は承認済みのみ。作成は要ログインで審査待ち `{ id, receivedAt, job }`                                               |
| `GET / PUT / DELETE /api/transport/jobs/[id]` | 取得は承認済み、または所有者・運営。更新・削除は所有者・運営のみ（応募も削除）                                             |
| `POST /api/transport/jobs/[id]/applications`  | 案件への応募を保存（要ログイン、募集中のみ。それ以外は 409）                                                               |
| `PATCH /api/transport/jobs/[id]/status`       | 案件を「完了」にする（所有者・運営のみ）                                                                                   |
| `GET / PATCH /api/threads/[id]`               | スレッドの取得（参加者・運営）と状態変更 `{ status }`（対象の所有者のみ）                                                  |
| `POST /api/threads/[id]/messages`             | 返信 `{ body }`（参加者のみ）。201                                                                                         |
| `POST /api/transport/registrations`           | 運搬者登録を保存                                                                                                           |
| `POST /api/contact`                           | お問い合わせを保存                                                                                                         |
| `GET / POST /api/auth/*`                      | Auth.js のエンドポイント（ログイン・ログアウト・セッション）                                                               |
| `GET / POST /api/admin/queue`                 | 審査キュー（運営ロールのみ）。`status=pending\|approved\|rejected\|all`。判定は `{ kind, id, status, note? }`              |

TanStack Query の初期データとキャッシュの構成は [公式 SSR ガイド](https://tanstack.com/query/latest/docs/framework/react/guides/ssr) を参照してください。

## CI

GitHub Actions は PR と `main` への push で動作します。lint / format / typecheck / knip / test:coverage / test:pglite / build の 7 ジョブを並列実行し、ひとつが失敗しても他の結果を収集します。同じブランチの古い実行はキャンセルします。

各ジョブは `pnpm install --frozen-lockfile` で依存を固定し、テストのカバレッジを artifact に保存します。Dependabot が npm と GitHub Actions の更新 PR を作成します。
