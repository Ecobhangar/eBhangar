import cors from 'cors';

// CORS configuration for both development and production
export const corsOptions = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5000',
      'http://localhost:3000',
      process.env.FRONTEND_URL, // For external deployment (Vercel)
      ...(process.env.ALLOWED_ORIGINS?.split(',') || []), // Multiple domains support
    ].filter(Boolean); // Remove undefined values

    // Check if origin matches allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (origin && origin.includes('.replit.app')) {
      // Allow all Replit deployment domains
      callback(null, true);
    } else {
      // In development, allow all origins for testing
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-phone'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
});
