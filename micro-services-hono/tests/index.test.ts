import { initApp } from '../src/index.js'; // Use explicit .js extension for ESM compliance

describe('GET / route', () => {
  let app: ReturnType<typeof initApp>;

  // Initialize Hono application instance before all tests
  beforeAll(() => {
    app = initApp();
  });

  it("should return 'Hello Hono!'", async () => {
    // Create a Request instance for the root endpoint
    const request = new Request("http://localhost:8080/");
    // Fetch a response using Hono's fetch method
    const response = await app.fetch(request);
    // Extract response text
    const text = await response.text();

    // Assert that the status code is 200 and the response body matches
    expect(response.status).toBe(200);
    expect(text).toBe("Hello Hono!");
  });
});
