const corsConfig = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

export default corsConfig;
