interface LoginResponse {
  success: boolean;
  user?: {
    email: string;
    userId: string;
  };
  error?: string;
}

// レスポンスファクトリーを拡張
const ResponseFactory = {
  createErrorResponse(message: string, status: number): NextResponse<LoginResponse> {
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status });
  },

  createSuccessResponse(user: { email: string, userId: string }, idToken: string): NextResponse<LoginResponse> {
    const response = NextResponse.json({ 
      success: true,
      user
    });

    // ... existing cookie setting code ...

    return response;
  }
}; 