// auth.middleware.ts
import { Issuer } from 'openid-client';

let cognitoClient: any = null;

// Cognitoクライアントの初期化
const initializeCognitoClient = async () => {
  if (cognitoClient) return cognitoClient;

  const issuer = await Issuer.discover(
    `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`
  );

  cognitoClient = new issuer.Client({
    client_id: process.env.COGNITO_CLIENT_ID!,
    client_secret: process.env.COGNITO_CLIENT_SECRET,
  });

  return cognitoClient;
};

// ミドルウェア
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await initializeCognitoClient();
    const session = await client.getSession();  // セッションを直接取得
    
    if (!session) {
      throw new Error('No valid session');
    }

    req.user = session.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};