// src/lib/auth/cognito.ts
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  InitiateAuthCommand, 
  ConfirmSignUpCommand, 
  AdminGetUserCommand,
  type CognitoIdentityProviderClientConfig
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto';
import { prisma } from "../prisma";

// 定数の集約
const COGNITO_CONFIG = {
  REGION: process.env.NEXT_PUBLIC_AWS_REGION,
  CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  CLIENT_SECRET: process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!,
  USER_POOL_ID: "ap-northeast-1_08U4ee9ae",
} as const;

// クライアント設定の集約
const clientConfig: CognitoIdentityProviderClientConfig = {
  region: COGNITO_CONFIG.REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
  }
};

// シングルトンクライアントのエクスポート
export const client = new CognitoIdentityProviderClient(clientConfig);

// ユーティリティ関数
function generateSecretHash(username: string): string {
  const message = username + COGNITO_CONFIG.CLIENT_ID;
  const hmac = crypto.createHmac('SHA256', COGNITO_CONFIG.CLIENT_SECRET);
  return hmac.update(message).digest('base64');
}

export async function signUp(email: string, password: string) {
  const command = new SignUpCommand({
    ClientId: COGNITO_CONFIG.CLIENT_ID,
    Username: email,
    Password: password,
    SecretHash: generateSecretHash(email),
    UserAttributes: [{ Name: "email", Value: email }],
  });

  try {
    const response = await client.send(command);
    return { ...response, UserSub: response.UserSub };
  } catch (error) {
    console.error('登録エラー:', error);
    throw error;
  }
}

export async function confirmSignUp(email: string, code: string) {
  const command = new ConfirmSignUpCommand({
    ClientId: COGNITO_CONFIG.CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    SecretHash: generateSecretHash(email),
  });

  try {
    const response = await client.send(command);
    
    const userCommand = new AdminGetUserCommand({
      UserPoolId: COGNITO_CONFIG.USER_POOL_ID,
      Username: email
    });
    
    const userResponse = await client.send(userCommand);
    const sub = userResponse.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;
    
    return { ...response, sub };
  } catch (error) {
    console.error('確認エラー:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const command = new InitiateAuthCommand({
    ClientId: COGNITO_CONFIG.CLIENT_ID,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: generateSecretHash(email),
    },
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.error('ログインエラー:', error);
    throw error;
  }
}