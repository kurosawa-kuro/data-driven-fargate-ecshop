import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProvider({
  region: process.env.AWS_REGION
});

const getSession = async (request: Request) => {
  try {
    const response = await cognito.listUsers({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Filter: `cognito:user_status = "CONFIRMED"`,
      Limit: 1
    });

    return response.Users?.[0];
  } catch (error) {
    console.error('Cognito session error:', error);
    return null;
  }
};

export async function POST(request: Request) {
  try {
    console.log("◇◇◇◇◇◇◇◇◇◇◇◇◇◇ post verify api request", request);
    const body = await request.json();
    console.log("◇◇◇◇◇◇◇◇◇◇◇◇◇◇ post verify api request", body);

    // cognito get session
    const session = await getSession(request);
    console.log("◇◇◇◇◇◇◇◇◇◇◇◇◇◇ post verify api request", session);

    // 成功時のレスポンスを追加
    return NextResponse.json({ success: "ok" }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating sample:', error.message);
      return NextResponse.json(
        { error: 'Failed to create sample: ' + error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create sample' },
      { status: 500 }
    );
  }
}