# ===========================================
# Configuration Layer
# ===========================================
# AWS Configuration
AWS_ACCOUNT_ID = 985539793438
REGION_TOKYO = ap-northeast-1

# CDK Configuration
CDK = cdk
DEPLOY_FLAGS = --require-approval never
DESTROY_FLAGS = --force --debug

NOTIFY_MESSAGES = { \
    deploy: "$(NOTIFY_PREFIX)_Deployment_completed", \
    destroy: "$(NOTIFY_PREFIX)_Stack_destruction_completed", \
    first_deploy: "$(NOTIFY_PREFIX)_First_deployment_completed", \
    reset_deploy: "$(NOTIFY_PREFIX)_Reset_and_redeploy_completed" \
}

# ===========================================
# Utility Layer
# ===========================================
# Logging Utilities
#   info: '\x1b[32m', // 緑色
#   error: '\x1b[31m', // 赤色
#   warn: '\x1b[33m', // 黄色
#   debug: '\x1b[34m', // 青色
#   processStart: '\x1b[38;5;208m', // オレンジ
#   processEnd: '\x1b[36m' // シアン

# AWS Operation Utilities
define bootstrap_regions
	$(call log_section,Bootstrapping CDK in Tokyo region)
	$(CDK) bootstrap aws://$(AWS_ACCOUNT_ID)/$(REGION_TOKYO) \
		--cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
		--trust $(AWS_ACCOUNT_ID) \
		--force
	$(call log_end_section)
endef



# ===========================================
# Operation Layer
# ===========================================
.PHONY: first-deploy reset-deploy destroy dev-create prod-delete

# Primary Operations
first-deploy:
	$(CDK) deploy $(DEPLOY_FLAGS)

reset-deploy:
	$(CDK) destroy $(DESTROY_FLAGS)
	$(CDK) deploy $(DEPLOY_FLAGS)

destroy:
	$(CDK) destroy $(DESTROY_FLAGS)

# Environment Specific Operations
dev-create: _bootstrap  # 開発環境で新規作成
	$(CDK) deploy $(DEPLOY_FLAGS) --context mode=create --context environment=development

dev-delete: _bootstrap  # 本番環境で削除
	$(CDK) deploy $(DEPLOY_FLAGS) --context mode=delete --context environment=development

# Private Utilities
.PHONY: _bootstrap _check-stacks

_bootstrap:
	$(call bootstrap_regions)

_check-stacks:
	$(call check_failed_stacks)

