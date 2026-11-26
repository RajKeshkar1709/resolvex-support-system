const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/environment');

const startServer = async () => {
  try {
    await connectDB(config.MONGODB_URI);

    const server = app.listen(config.PORT, () => {
      console.log(`=================================================`);
      console.log(` ResolveX Backend Server running on port ${config.PORT}`);
      console.log(` Environment: ${config.NODE_ENV}`);
      console.log(` Swagger Docs: http://localhost:${config.PORT}/api-docs`);
      console.log(`=================================================`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('[Unhandled Rejection! Shutting down...]:', err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully.');
      server.close(() => {
        console.log('Process terminated.');
      });
    });
  } catch (err) {
    console.error('[Server Start Error]:', err.message);
    process.exit(1);
  }
};

startServer();
