// src/lib/auth/cognito.ts
import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, ConfirmSignUpCommand, AdminGetUserCommand  } from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto';
import { prisma } from "../prisma";
export const client = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
  }
});

export async function signUp(email: string, password: string) {
  const command = new SignUpCommand({
    ClientId: "eb28gts2rhj3rnfl53al7hj5q",
    // ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    Username: email,
    Password: password,
    SecretHash: generateSecretHash(email),
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  });

  try {
    const response = await client.send(command);
    // UserSubを返す
    return { ...response, UserSub: response.UserSub };
  } catch (error) {
    console.error('登録エラー:', error);
    throw error;
  }
}

function generateSecretHash(username: string) {
  const message = username + process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const hmac = crypto.createHmac('SHA256', process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET!);
  return hmac.update(message).digest('base64');
}

export async function confirmSignUp(email: string, code: string) {
  const command = new ConfirmSignUpCommand({
    ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    SecretHash: generateSecretHash(email),
  });

  try {
    const response = await client.send(command);
    console.log("response", response);

        // AdminGetUserCommandを使用してユーザー情報を取得
        const userCommand = new AdminGetUserCommand({
          UserPoolId: "ap-northeast-1_08U4ee9ae", // あなたのUser Pool ID
          Username: email
        });
        
        const userResponse = await client.send(userCommand);
        const sub = userResponse.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;
        console.log("sub", sub);

    return response;
  } catch (error) {
    console.error('確認エラー:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const command = new InitiateAuthCommand({
    ClientId: "eb28gts2rhj3rnfl53al7hj5q",
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