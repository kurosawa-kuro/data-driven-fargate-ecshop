import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';

// 定数定義
const SECRET_CONFIG = {
  FIXED_SECRET_NAME: 'test-secret-11',
  DEFAULT_ENVIRONMENT: 'development',
  DISABLE_ROTATION_TAG: 'DisableRotation',
  SECRET_GENERATION_CONFIG: {
    secretStringTemplate: {
      environment: '${environment}',
      operation: '${operation}',
      timestamp: '${timestamp}'
    },
    generateStringKey: 'apiKey'
  }
};

// 操作モードの型定義
type OperationMode = 'create' | 'delete';

// シークレット設定のインターフェース
interface SecretConfig {
  name: string;
  description: string;
  environment: string;
}

// シークレット管理クラス
class SecretManager {
  private readonly stack: cdk.Stack;
  private readonly secretConfig: SecretConfig;

  constructor(stack: cdk.Stack, secretConfig: SecretConfig) {
    this.stack = stack;
    this.secretConfig = secretConfig;
  }

  // シークレットの存在確認
  checkSecretExists(secretName: string): boolean {
    try {
      const secret = secretsmanager.Secret.fromSecretNameV2(
        this.stack,
        'CheckSecret',
        secretName
      );
      return !!secret.secretArn;
    } catch (error) {
      return false;
    }
  }

  // シークレットの作成
  createSecret(): secretsmanager.Secret {
    const secretTemplate = {
      ...SECRET_CONFIG.SECRET_GENERATION_CONFIG.secretStringTemplate,
      environment: this.secretConfig.environment,
      operation: 'create',
      timestamp: new Date().toISOString()
    };

    const newSecret = new secretsmanager.Secret(this.stack, 'NewSecret', {
      secretName: this.secretConfig.name,
      description: this.secretConfig.description,
      generateSecretString: {
        secretStringTemplate: JSON.stringify(secretTemplate),
        generateStringKey: SECRET_CONFIG.SECRET_GENERATION_CONFIG.generateStringKey
      }
    });

    cdk.Tags.of(newSecret).add(SECRET_CONFIG.DISABLE_ROTATION_TAG, 'true');
    return newSecret;
  }

  // シークレットの削除
  async deleteSecret(secretName: string): Promise<void> {
    try {
      const existingSecret = secretsmanager.Secret.fromSecretNameV2(
        this.stack,
        'ExistingSecret',
        secretName
      );

      const customResourceRole = this.createCustomResourceRole();

      new cr.AwsCustomResource(this.stack, 'DeleteSecret', {
        onCreate: {
          service: 'SecretsManager',
          action: 'deleteSecret',
          parameters: {
            SecretId: existingSecret.secretArn,
            ForceDeleteWithoutRecovery: true
          },
          physicalResourceId: cr.PhysicalResourceId.of(existingSecret.secretArn)
        },
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'secretsmanager:DeleteSecret',
              'secretsmanager:DescribeSecret',
              'secretsmanager:GetSecretValue',
              'secretsmanager:ListSecrets'
            ],
            resources: ['*']
          })
        ]),
        role: customResourceRole
      });
    } catch (error) {
      throw new Error(`Failed to delete secret: ${secretName}`);
    }
  }

  // カスタムリソース用IAMロールの作成
  private createCustomResourceRole(): iam.Role {
    return new iam.Role(this.stack, 'CustomResourceRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        SecretsManagerPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'secretsmanager:DeleteSecret',
                'secretsmanager:DescribeSecret',
                'secretsmanager:GetSecretValue',
                'secretsmanager:ListSecrets'
              ],
              resources: ['*']
            })
          ]
        })
      }
    });
  }
}

export class SecretsManagerStack extends cdk.Stack {
  private readonly mode: OperationMode;
  private readonly secretConfig: SecretConfig;
  private readonly secretManager: SecretManager;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.mode = this.node.tryGetContext('mode') || 'create';
    this.secretConfig = {
      name: SECRET_CONFIG.FIXED_SECRET_NAME,
      description: this.mode === 'create' 
        ? 'Newly created secret' 
        : 'Secret marked for deletion',
      environment: this.node.tryGetContext('environment') || SECRET_CONFIG.DEFAULT_ENVIRONMENT
    };

    this.secretManager = new SecretManager(this, this.secretConfig);
    this.manageSecret();
  }

  private manageSecret(): void {
    if (this.mode === 'delete') {
      if (this.secretManager.checkSecretExists(this.secretConfig.name)) {
        this.secretManager.deleteSecret(this.secretConfig.name);
      }
    } else {
      this.secretManager.createSecret();
    }
  }
}
