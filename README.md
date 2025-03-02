# data-driven-fargate-ecshop

- **ECS Fargate を活用したコンテナ基盤**  
  - Amazon ECS Fargate 上でアプリケーションをデプロイすることで、サーバの運用管理から解放され、スケーラブルな運用が可能。

- **ECサイトの基本機能を実装**  
  - 商品カタログの表示、カート機能、ユーザ登録・ログイン、注文処理など、ECサイトに必要な機能を備えている。

- **AWSマネージドサービスとの連携**  
  - **Amazon RDS**: ECサイトのデータを格納するデータベースとして利用。  
  - **Amazon Cognito**: ユーザ認証や管理を担当し、安全な認証フローを実装。  
  - **Amazon S3**: 画像などの静的アセットを保存・配信するストレージとして利用。  
  - **Amazon CloudFront**: グローバルに高速なコンテンツ配信を行う CDN として活用。

- **ログ・分析基盤の整備**  
  - **Amazon CloudWatch Logs**: アプリケーションのログを収集し、可視化や監視に活用。  
  - **Kinesis Data Firehose → AWS Glue → Amazon Athena**: ログやアプリのデータをストリーム処理し、Glue でスキーマ化した後、Athena でクエリ可能にするパイプラインを構築。  
  - **Amazon QuickSight**: 上記のデータ分析結果をダッシュボード化し、ビジネスインサイトを得る。

- **AWS CDK によるインフラ管理**  
  - インフラ構成を TypeScript/JavaScript 等のコードで定義・管理し、再現性と拡張性を高めている。

- **コンテナ化と CI/CD**  
  - Docker イメージをビルドし、ECS Fargate へデプロイ。CI/CD ツール（GitHub Actionsなど）を利用することで自動化を実現。

- **開発効率と拡張性**  
  - コンテナアーキテクチャや IaC (Infrastructure as Code) を活用することでスケーラビリティを担保しつつ、コードベースの変更で容易に機能追加や改善が行える。






