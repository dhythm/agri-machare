# Agri Machare

農機具（AGRIcultural MACHinery）をシェア（sHARE）するサービス。

## 開発

Node.js は `.node-version`、pnpm は `package.json` の `packageManager` に指定したバージョンを使用します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

http://localhost:3000 で確認できます。現在のデータはサーバー内のサンプルで、環境変数やデータベースの設定は不要です。購入・レンタル申込・運搬応募などのボタンは表示のみで、取引の保存や決済は未実装です。

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
- トップの初期一覧は Server Component で取得して画面に渡します。絞り込み後の取得は TanStack Query から `GET /api/listings` を呼び出します。
- Query key はカテゴリと取引条件を含みます。リクエストのキャンセル、キャッシュ、読込中・エラー・再試行を Query で管理します。
- 詳細ページと運搬一覧はサーバーでデータを取得します。クライアントには選択状態など表示に必要な処理を残します。

`GET /api/listings` は `category`（`すべて` または画面のカテゴリ）と `deal`（`all` / `sale` / `rent` / `rentToOwn`）を受け取ります。省略時は全件、正常時は農機具の配列、不正条件は HTTP 400 を返します。

TanStack Query の初期データとキャッシュの構成は [公式 SSR ガイド](https://tanstack.com/query/latest/docs/framework/react/guides/ssr) を参照してください。

## CI

GitHub Actions は PR と `main` への push で動作します。lint / format / typecheck / knip / test:coverage / build の 6 ジョブを並列実行し、ひとつが失敗しても他の結果を収集します。同じブランチの古い実行はキャンセルします。

各ジョブは `pnpm install --frozen-lockfile` で依存を固定し、テストのカバレッジを artifact に保存します。Dependabot が npm と GitHub Actions の更新 PR を作成します。
