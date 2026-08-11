# よしくんGPT 専用ページ 😈

ChatGPTへのログイン不要で、URLを開いた人がそのまま使える簡易チャットサイトです。  
ブラウザ側にOpenAI APIキーを置かず、Vercelのサーバー関数からOpenAI Responses APIを呼びます。

## 入っているもの

- スマホ対応チャットUI
- ログイン不要
- 「よしくんGPT」の人格をサーバー側で固定
- ブラウザのlocalStorageに直近の会話を保存
- APIキーをブラウザに公開しない構成
- 入力文字数制限
- 簡易IPレート制限（10分20回）
- 匿名セッションIDを `safety_identifier` として送信
- Vercel向け設定済み

## 1. OpenAI APIキーを用意

OpenAI PlatformでAPIキーを作成してください。

**重要:** APIキーは `public/app.js` や `index.html` に絶対に書かないでください。  
このプロジェクトではVercelの環境変数 `OPENAI_API_KEY` に入れます。

## 2. GitHubへアップロード

このフォルダ一式をGitHubの新しいリポジトリにアップロードします。

例:

```bash
git init
git add .
git commit -m "Initial Yoshikun GPT"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## 3. Vercelへ公開

1. Vercelにログイン
2. `Add New Project`
3. GitHubのこのリポジトリをImport
4. Environment Variablesを追加
5. `Deploy`

設定する環境変数:

```text
OPENAI_API_KEY=あなたのAPIキー
OPENAI_MODEL=gpt-5-mini
```

公開後にVercelからURLが発行されます。  
そのURLを他人に送れば、閲覧者側はChatGPTへのログインなしで利用できます。

## 4. よしくんの性格を変える

`api/chat.js` の `SYSTEM_PROMPT` を編集してください。

この文字列はブラウザには配信されず、サーバー関数側で使用されます。

## 5. モデルを変更する

Vercelの環境変数 `OPENAI_MODEL` を変更します。

初期値は:

```text
gpt-5-mini
```

利用可能なモデルや価格はOpenAI公式ドキュメントで最新情報を確認してください。

## 費用対策

公開サイトでは他人があなたのAPI利用枠を使います。最低でも以下を推奨します。

- OpenAI側で予算・利用状況を監視
- Project単位のAPIキーを使用
- 入力文字数・出力文字数を制限
- 本格公開ではRedis/Upstash等を使った永続レート制限
- 必要ならCloudflare Turnstile等のbot対策を追加

現在の `api/chat.js` のレート制限は**簡易版**です。VercelのServerless環境では
複数インスタンス間で状態が共有されないため、厳密な課金防止にはなりません。

## ローカルで試す場合

Vercel CLIが必要です。

```bash
npm i -g vercel
vercel dev
```

`.env.local`:

```text
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini
```

## ファイル構成

```text
yoshikun-gpt/
├── api/
│   └── chat.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

## 注意

- OpenAI APIの利用料金はサイト運営者側に発生します。
- AIの回答は誤る場合があります。
- 公開規模が大きくなったら、認証・永続レート制限・監視・利用規約/プライバシー表示等を追加してください。
