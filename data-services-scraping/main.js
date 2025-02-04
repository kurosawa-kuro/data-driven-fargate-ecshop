import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

import { chromium } from 'playwright';

async function scrapeTweets(username, credentials) {
    // Launch browser in non-headless mode for debugging, with slow motion enabled
    const browser = await chromium.launch({
        headless: false,  // Show browser window
        slowMo: 100       // Slow down operations for easier debugging
    });

    // Updated userAgent to mimic a currently supported browser version
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
    });
    
    try {
        const page = await context.newPage();
        
        // Filter out specific warnings from the console logs
        page.on('console', msg => {
            const text = msg.text();
            // Ignore FedCM warnings and certain CORS errors
            if (text.includes('GSI_LOGGER') || text.includes('Access to script') || text.includes('[DOM]')) {
                return;
            }
            console.log('PAGE LOG:', text);
        });
        
        console.log('Navigating to login page...');
        await page.goto('https://twitter.com/i/flow/login', {
            waitUntil: 'networkidle'
        });
        
        // Take a screenshot to verify the login page state
        await page.screenshot({ path: 'screenshot/debug-login.png' });
        
        console.log('Waiting for login form...');
        // Use a new selector for the login form
        await page.waitForSelector('input[name="text"]', { timeout: 30000 });
        
        console.log('Filling username...');
        await page.fill('input[name="text"]', credentials.username);
        // Use a locator targeting the button element with text "Next" (or equivalent)
        const nextButton = page.locator('button[role="button"]', { hasText: /next|次へ/i });
        await nextButton.waitFor({ state: 'visible', timeout: 30000 });
        await nextButton.click();
        
        // Continue with the remaining login steps as in the original code
        await page.waitForSelector('input[type="password"]', { timeout: 5000 });
        console.log('Filling password...');
        await page.fill('input[type="password"]', credentials.password);
        // Use a locator targeting the login button by its data-testid attribute and text "Log in"
        const loginButton = page.locator('button[data-testid="LoginForm_Login_Button"]', { hasText: /log\s*in/i });
        await loginButton.waitFor({ state: 'visible', timeout: 30000 });
        await loginButton.click();
        
        // Wait for navigation after login success
        await page.waitForNavigation();
        
        // Navigate to the target user's tweets page
        console.log(`Navigating to user page: ${username}`);
        await page.goto(`https://twitter.com/${username}`);
        
        // Wait for tweet elements to load
        await page.waitForSelector('[data-testid="tweet"]', { timeout: 30000 });
        
        // Scroll to load additional tweets
        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await page.waitForTimeout(2000);
        }
        
        // Extract tweets from the page
        const tweets = await page.evaluate(() => {
            const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
            return Array.from(tweetElements).map(tweet => ({
                text: tweet.querySelector('[data-testid="tweetText"]')?.innerText || '',
                time: tweet.querySelector('time')?.getAttribute('datetime') || '',
                stats: {
                    replies: tweet.querySelector('[data-testid="reply"]')?.innerText || '0',
                    retweets: tweet.querySelector('[data-testid="retweet"]')?.innerText || '0',
                    likes: tweet.querySelector('[data-testid="like"]')?.innerText || '0'
                }
            }));
        });
        
        // Debug screenshot of the final page state saved in the screenshot folder
        await page.screenshot({ path: 'screenshot/debug-final.png' });
        
        return tweets;
        
    } catch (error) {
        console.error('Detailed Error:', error);
        // Save a screenshot on error for debugging purposes in the screenshot folder
        await page?.screenshot({ path: 'screenshot/error.png' });
        throw error;
    } finally {
        // For debugging purposes, the browser is kept open.
        // Uncomment the following line to close the browser in production.
        // await browser.close();
    }
}

// Main function remains unchanged for execution.
async function main() {
    // Validate that environment variables are set
    if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD) {
        console.error("Missing Twitter credentials in environment variables!");
        process.exit(1);
    }

    try {
        const username = 'world_news2025';
        // Using credentials from environment variables
        const credentials = {
            username: process.env.TWITTER_USERNAME,  // Twitter login email / username
            password: process.env.TWITTER_PASSWORD     // Twitter password
        };
        
        const tweets = await scrapeTweets(username, credentials);
        console.log(JSON.stringify(tweets, null, 2));
    } catch (error) {
        console.error('Failed to scrape tweets:', error);
    }
}

main();