import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Function to create CORS middleware configuration
function createCorsMiddleware() {
  return cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 3600,
    credentials: true,
  });
}

// Function to set up the application routes
function setupRoutes(app: Hono) {
  // Define root endpoint
  app.get('/', (c) => {
    return c.text('Hello Hono!');
  });
}

// Function to initialize the Hono application
function initApp(): Hono {
  const app = new Hono();
  // Apply CORS middleware to all routes
  app.use("/*", createCorsMiddleware());
  // Set up routes for the application
  setupRoutes(app);
  return app;
}

// Function to start the server with given app and port
function startServer(app: Hono, port: number): void {
  console.log(`Server is running on http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port
  });
}

// Main execution flow
const app = initApp();
const port = 8080;
startServer(app, port);

// Exporting initApp for testing purposes
export { initApp };
