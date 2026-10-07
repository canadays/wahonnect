# WAHONNECT

社会人のためのワーホリ・留学コミュニティ「WAHONNECT」の公式サイト。Next.js (App Router) + TypeScript + Tailwind CSS。

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 本番ビルド
```

## 更新のしかた

- **写真**: 管理ページ `/admin` にGoogleでログインして変更します（下の「管理ページの準備」を一度だけ行う）。
- **イベントの日程と内容**: Meetupでイベントを作成・編集・中止するだけ。公開カレンダー（iCal）から自動で読み込み、1時間以内にサイトへ反映されます。予定が無いとき・読み込めないときは「決まり次第お知らせ」の表示になります。
- **リンク**: `src/data/site.ts`
- **日本語ページの文章**: `src/app/(ja)/page.tsx` 冒頭の配列。
- **英語ページ**: `src/app/(en)/en/page.tsx`
- **色・フォント**: `src/app/globals.css` の `@theme`
- **SNSシェア画像**: `public/og.png`（1200×630）

## 管理ページの準備（最初の一度だけ）

仕組みは Canadays Connect と同じです。ログインは Firebase（Google）、写真の記録は Firestore、画像の保存は Cloudinary。
Canadays と同じ Firebase プロジェクト・Cloudinary アカウントを使っても、新しく作っても動きます（写真の記録先は `wahonnect_photos` という別のコレクションです）。

1. **Firebase**: Authentication で Google ログインを有効にし、「承認済みドメイン」に公開先のドメイン（例: `wahonnect.vercel.app`）を追加する。
2. **Firestore のルール**に次を追加する（メールアドレスは管理者のものに置き換える）。これが実際の鍵です。画面側の管理者チェックだけでは書き込みを防げません。

   ```
   match /wahonnect_photos/{id} {
     allow read: if true;
     allow write: if request.auth != null
       && request.auth.token.email_verified
       && request.auth.token.email in ['管理者のGmailアドレス'];
   }
   ```

3. **Cloudinary**: Settings → Upload で「Unsigned」のアップロードプリセットを作る（保存フォルダを `wahonnect` にしておくと整理しやすい）。
4. **Vercel**: `.env.example` にある環境変数を Settings → Environment Variables に登録し、再デプロイする。
5. `https://（公開先）/admin` を開いてログインする。設定が足りないときは、足りない変数名が画面に出ます。

### 知っておくこと

- 写真を変更すると、公開ページはその場で更新されます（更新に失敗した場合も1時間以内に反映）。
- 公開ページは写真の一覧をサーバー側で読むので、訪問者のブラウザに Firebase は読み込まれません。
- 「外す」はサイトから外すだけで、Cloudinary 上の画像ファイルは残ります。完全に消すときは Cloudinary の管理画面から削除します。
- Unsigned プリセットは仕組み上、プリセット名を知っている人なら誰でもアップロードできます（サイトには載りません）。気になる場合は Cloudinary 側でファイルサイズや形式の制限をかけてください。
- `public/photos/` に画像ファイルを置く方法も予備として残っています（管理ページの写真が無い枠だけ使われます）。

## フォトラリー（`/rally`）

イベント当日に参加者がスマホで開く写真集めゲームです。チーム名を入れ、ミッションごとに写真を撮ってアップロードすると得点が入ります。

- **参加者の画面**: `/rally`（検索には載りません。URLやQRコードで共有してください）
- **管理ページ**: `/rally/admin`。パスワードを知っている人は誰でも入れます。ミッションの追加・編集・並べ替え・表示/非表示と、チームごとの得点・写真の確認ができます。保存した内容は参加者の画面にすぐ反映されます。

### 準備（最初の一度だけ）

1. Vercelの環境変数に次の4つを **Secret** で登録して再デプロイする。
   - `RALLY_ADMIN_PASSWORD`: 管理ページのパスワード（推測されにくいものに）
   - `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`: サーバーがFirestoreに書き込むための鍵
2. Firebaseコンソール → Authentication → ログイン方法で「匿名」を有効にする（参加者の記録用）。
3. Firestoreのルールに次を追加する。

   ```
   match /wahonnect_rally_missions/{id} {
     allow read: if true;
     allow write: if false;   // 書き込みはサーバー（管理ページ）だけ
   }
   match /wahonnect_rally_teams/{teamId} {
     allow read, create, update: if request.auth != null && request.auth.uid == teamId;
   }
   ```

### 知っておくこと

- パスワードはサーバー側で確かめています。ブラウザには鍵を置いていないので、パスワードを知らない人はミッションを書き換えられません。
- 参加者の記録はそのスマホのブラウザに結びつきます。別のスマホや別のブラウザで開くと、新しいチームとして始まります。
- チームを「消す」と一覧から消えますが、写真のファイルはCloudinaryに残ります。

## デプロイ（Vercel）

既存の Vercel プロジェクトにつないでいる GitHub リポジトリへ、このフォルダの中身を push すれば置き換わります。独自ドメインにする場合は環境変数 `NEXT_PUBLIC_SITE_URL` に URL を設定してください。
