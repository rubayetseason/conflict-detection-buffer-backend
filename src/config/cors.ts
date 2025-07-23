const corsConfig = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://conflict-detection-buffer-frontend.vercel.app',
    'https://conflict-detection-buffer-frontend.vercel.app/',
  ],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

export default corsConfig;
