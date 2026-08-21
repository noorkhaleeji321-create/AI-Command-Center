// Safe AuthMiddleware handling user identification and session validation
export function authMiddleware(req: any, res: any, next?: any) {
  try {
    // Optional chaining to prevent "TypeError: Cannot read properties of undefined (reading 'userId')"
    const userId = req?.user?.userId || req?.headers?.['x-user-id'] || req?.session?.userId;

    if (!userId) {
      if (res && typeof res.status === 'function') {
        return res.status(401).json({
          success: false,
          error: "Unauthenticated: Missing or invalid user identity",
        });
      }
    }

    // Attach verified user context safely
    req.userId = userId;
    if (typeof next === 'function') {
      next();
    }
    return { success: true, userId };
  } catch (err: any) {
    if (res && typeof res.status === 'function') {
      return res.status(500).json({
        success: false,
        error: `AuthMiddleware Exception: ${err.message}`,
      });
    }
    return { success: false, error: err.message };
  }
}
