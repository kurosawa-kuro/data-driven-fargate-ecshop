import { NextResponse } from 'next/server';
import { confirmSignUp } from '@/lib/auth/cognito';
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { client } from '@/lib/auth/cognito';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    // メール確認
    await confirmSignUp(email, code);

    // Cognitoユーザー情報を取得
    const userCommand = new AdminGetUserCommand({
      UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      Username: email
    });
    
    const userResponse = await client.send(userCommand);
    const sub = userResponse.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;

    // Todo フロー自体見直し ユーザー登録APIを二回呼び出すのはダメ、メール認証した事をUpdateするのは有り。ここでDB操作すれば良い
    if (sub) {
      // ユーザー登録APIを呼び出し
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, sub }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: error.message || '確認コードの検証に失敗しました' },
      { status: 400 }
    );
  }
} 