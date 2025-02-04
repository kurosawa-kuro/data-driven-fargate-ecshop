import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

import { chromium } from 'playwright';

/*
 * Initialize browser and context with specific configuration.
 */
async function initBrowserContext() {
    const browser = await chromium.launch({
        headless: false,  // Show browser window for debugging
        slowMo: 100       // Slow down operations for easier debugging
    });
    
    // Create a browser context with custom userAgent and viewport settings
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
    });
    return { browser, context };
}

/*
 * Set up the page with console log filtering.
 */
async function setupPage(context) {
    const page = await context.newPage();
    
    // Setup console event handler to filter unwanted warnings
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('GSI_LOGGER') || text.includes('Access to script') || text.includes('[DOM]')) {
            return;
        }
        console.log('PAGE LOG:', text);
    });
    return page;
}

/*
 * Execute the login steps on Twitter using given credentials.
 */
async function loginToTwitter(page, credentials) {
    console.log('Navigating to login page...');
    await page.goto('https://twitter.com/i/flow/login', { waitUntil: 'networkidle' });
    
    // Take a screenshot of the login page for debugging purposes
    await page.screenshot({ path: 'screenshot/debug-login.png' });
    
    console.log('Waiting for login form...');
    await page.waitForSelector('input[name="text"]', { timeout: 30000 });
    
    console.log('Filling username...');
    await page.fill('input[name="text"]', credentials.username);
    
    // Locate the "Next" button (text can be "Next" or "次へ")
    const nextButton = page.locator('button[role="button"]', { hasText: /next|次へ/i });
    await nextButton.waitFor({ state: 'visible', timeout: 30000 });
    await nextButton.click();
    
    // Wait for the password input to appear
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    console.log('Filling password...');
    await page.fill('input[type="password"]', credentials.password);
    
    // Locate the login button by its data-testid and text "Log in"
    const loginButton = page.locator('button[data-testid="LoginForm_Login_Button"]', { hasText: /log\s*in/i });
    await loginButton.waitFor({ state: 'visible', timeout: 30000 });
    await loginButton.click();
    
    // Wait for navigation after successful login
    await page.waitForNavigation();
}

/*
 * Navigate to the specific user's Twitter page.
 */
async function navigateToUserPage(page, username) {
    console.log(`Navigating to user page: ${username}`);
    await page.goto(`https://twitter.com/${username}`);
    
    // Ensure tweets are loaded
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 30000 });
}

/*
 * Scroll the page to load more tweets and then extract tweet data.
 */
async function loadAndExtractTweets(page) {
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
    
    // Take a screenshot of the final page state for debugging
    await page.screenshot({ path: 'screenshot/debug-final.png' });
    return tweets;
}

/*
 * Main scraping function that orchestrates browser initialization, login, navigation, and data extraction.
 */
async function scrapeTweets(username, credentials) {
    const { browser, context } = await initBrowserContext();
    let page;
    
    try {
        page = await setupPage(context);
        await loginToTwitter(page, credentials);
        await navigateToUserPage(page, username);
        
        // Load tweets and extract tweet data
        const tweets = await loadAndExtractTweets(page);
        return tweets;
    } catch (error) {
        console.error('Detailed Error:', error);
        if (page) {
            // Capture error screenshot for debugging
            await page.screenshot({ path: 'screenshot/error.png' });
        }
        throw error;
    } finally {
        // For debugging purposes, the browser is kept open.
        // In production, uncomment the following line to close the browser.
        // await browser.close();
    }
}

/*
 * Main execution function.
 */
async function main() {
    // Validate that required environment variables are set
    if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD) {
        console.error("Missing Twitter credentials in environment variables!");
        process.exit(1);
    }
    
    try {
        const username = 'elonmusk';
        // Use credentials from environment variables
        const credentials = {
            username: process.env.TWITTER_USERNAME, // Twitter login email / username
            password: process.env.TWITTER_PASSWORD    // Twitter password
        };
        
        const tweets = await scrapeTweets(username, credentials);
        console.log(JSON.stringify(tweets, null, 2));
    } catch (error) {
        console.error('Failed to scrape tweets:', error);
    }
}

main();