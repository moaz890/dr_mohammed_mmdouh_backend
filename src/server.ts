import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

const PORT = parseInt(env.PORT, 10);

const start = async () => {
  // Connect to DB first — if it fails, the server won't start
  // This prevents the API from accepting requests it can't fulfill
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${env.NODE_ENV}]`);
  });
};

start();
