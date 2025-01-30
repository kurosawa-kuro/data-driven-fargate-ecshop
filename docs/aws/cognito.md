# Amazon Cognito 基本設定

## ユーザープール設定

### 基本情報
- アプリケーション名: data-driven-app
- リージョン: ap-northeast-1

### 認証設定
- サインイン方法: メールアドレス
- 必須属性: メールアドレス

## アプリケーションクライアント設定

### 認証フロー
- ✓ ユーザーネームとパスワード (ALLOW_USER_PASSWORD_AUTH)

## 環境変数設定
```env
NEXT_PUBLIC_AWS_REGION=ap-northeast-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<ユーザープールID>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<アプリケーションクライアントID>
NEXT_PUBLIC_COGNITO_CLIENT_SECRET=<クライアントシークレット>
```