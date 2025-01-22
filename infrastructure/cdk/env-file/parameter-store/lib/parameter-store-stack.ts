import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';

// 定数定義
const PARAMETER_CONFIG = {
  FIXED_PARAMETER_NAME: '/test/parameter-11',
  DEFAULT_VALUE: JSON.stringify({ 
    timestamp: new Date().toISOString() 
  })
};

// 操作モードの型定義
type OperationMode = 'create' | 'delete';

// パラメータ設定のインターフェース
interface ParameterConfig {
  name: string;
  value: string; // JSON文字列
  description: string;
}

// パラメータ管理クラス
class ParameterManager {
  private readonly stack: cdk.Stack;
  private readonly parameterConfig: ParameterConfig;

  constructor(stack: cdk.Stack, parameterConfig: ParameterConfig) {
    this.stack = stack;
    this.parameterConfig = parameterConfig;
  }

  // パラメータの存在確認
  checkParameterExists(parameterName: string): boolean {
    try {
      const parameter = ssm.StringParameter.fromStringParameterName(
        this.stack,
        'CheckParameter',
        parameterName
      );
      return !!parameter.parameterArn;
    } catch (error) {
      return false;
    }
  }

  // パラメータの作成
  createParameter(): ssm.StringParameter {
    return new ssm.StringParameter(this.stack, 'NewParameter', {
      parameterName: this.parameterConfig.name,
      stringValue: this.parameterConfig.value,
      description: this.parameterConfig.description
    });
  }

  // パラメータの削除
  async deleteParameter(parameterName: string): Promise<void> {
    try {
      const existingParameter = ssm.StringParameter.fromStringParameterName(
        this.stack,
        'ExistingParameter',
        parameterName
      );

      const customResourceRole = this.createCustomResourceRole();

      new cr.AwsCustomResource(this.stack, 'DeleteParameter', {
        onCreate: {
          service: 'SSM',
          action: 'deleteParameter',
          parameters: {
            Name: existingParameter.parameterName
          },
          physicalResourceId: cr.PhysicalResourceId.of(existingParameter.parameterArn)
        },
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'ssm:DeleteParameter',
              'ssm:DescribeParameters',
              'ssm:GetParameter',
              'ssm:ListTagsForResource'
            ],
            resources: ['*']
          })
        ]),
        role: customResourceRole
      });
    } catch (error) {
      throw new Error(`Failed to delete parameter: ${parameterName}`);
    }
  }

  // カスタムリソース用IAMロールの作成
  private createCustomResourceRole(): iam.Role {
    return new iam.Role(this.stack, 'CustomResourceRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        SSMPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'ssm:DeleteParameter',
                'ssm:DescribeParameters',
                'ssm:GetParameter',
                'ssm:ListTagsForResource'
              ],
              resources: ['*']
            })
          ]
        })
      }
    });
  }
}

export class ParameterStoreStack extends cdk.Stack {
  private readonly mode: OperationMode;
  private readonly parameterConfig: ParameterConfig;
  private readonly parameterManager: ParameterManager;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const customValue = this.node.tryGetContext('value');
    
    this.mode = this.node.tryGetContext('mode') || 'create';
    this.parameterConfig = {
      name: PARAMETER_CONFIG.FIXED_PARAMETER_NAME,
      value: customValue || PARAMETER_CONFIG.DEFAULT_VALUE,
      description: this.mode === 'create' 
        ? 'Newly created parameter' 
        : 'Parameter marked for deletion'
    };

    this.parameterManager = new ParameterManager(this, this.parameterConfig);
    this.manageParameter();
  }

  private manageParameter(): void {
    if (this.mode === 'delete') {
      if (this.parameterManager.checkParameterExists(this.parameterConfig.name)) {
        this.parameterManager.deleteParameter(this.parameterConfig.name);
      }
    } else {
      this.parameterManager.createParameter();
    }
  }
}
