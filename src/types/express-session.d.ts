import 'express-session';
import type { Request } from 'express';

declare module 'express-session' {
  interface SessionData {
    pricing?: {
      courseId: number;
      couponId: number;
      price: number;
    };
  }
}

declare module 'express' {
  interface Request {
    user: {
      id: number;
      email: string;
      name: string;
    };
  }
}
