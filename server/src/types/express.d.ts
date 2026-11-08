// Augment Express's Request so `req.userId` is typed everywhere after the
// requireAuth middleware has run.
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export {}
