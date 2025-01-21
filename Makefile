###################
# 開発用コマンド
###################
dev:  # ローカル開発サーバー起動
	cd fullstack-nextjs && pnpm run dev

watch:  # ログファイルの監視
	tail -f logs/combined.log

###################
# データベース操作
###################
db-generate:  # Prismaクライアントの生成
	cd fullstack-nextjs && pnpm run prisma:generate

db-migrate:  # データベースマイグレーションの実行
	cd fullstack-nextjs && pnpm run prisma:migrate

db-update: db-migrate db-generate  # マイグレーションとクライアント生成を順次実行

db-seed: db-migrate db-generate  # データベースのシード処理
	cd fullstack-nextjs && pnpm run prisma:seed

###################
# 環境セットアップ
###################
setup-system:  # システム環境のセットアップ
	chmod u+x ./infrastructure/install/setup-system.sh
	sudo ./infrastructure/install/setup-system.sh

setup-app:  # アプリケーション環境のセットアップ
	chmod u+x ./infrastructure/install/setup-app.sh
	sudo ./infrastructure/install/setup-app.sh

###################
# Docker/Fargate操作
###################
fargate-local:  # ローカルでのFargate環境構築
	chmod u+x ./infrastructure/docker/local/01_local-dev.sh
	./infrastructure/docker/local/01_local-dev.sh

fargate-deploy:  # Fargateへのデプロイ
	chmod u+x ./infrastructure/docker/fargate/02_deploy.sh
	./infrastructure/docker/fargate/02_deploy.sh

fargate-run-local:  # ローカルでのFargate実行
	chmod u+x ./infrastructure/docker/fargate/03_run-local.sh
	./infrastructure/docker/fargate/03_run-local.sh

fargate-cleanup:  # Fargate環境のクリーンアップ
	chmod u+x ./infrastructure/docker/local/04_cleanup.sh
	./infrastructure/docker/local/04_cleanup.sh

###################
# モニタリング
###################
cloudwatch-log:  # CloudWatchログの監視
	aws logs tail /ecs/nextjs-app-02 --log-stream-name "ecs/nextjs-app/[TASK-ID]" --follow

###################
# Git操作
###################
commit-success:  # タイムスタンプ付きの成功コミット
	chmod +x  ./infrastructure/script/commit_success.sh
	./infrastructure/script/commit_success.sh