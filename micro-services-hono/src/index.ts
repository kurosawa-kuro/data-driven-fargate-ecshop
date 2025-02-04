import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(
  "/*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 3600,
    credentials: true,
  })
);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = 8080
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
