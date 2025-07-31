const { chromium } = require('playwright');

async function testAppStoreCrawl() {
  console.log('Testing App Store crawler...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    // Test with YNAB app page
    console.log('Navigating to YNAB app page...');
    await page.goto('https://apps.apple.com/us/app/ynab-you-need-a-budget/id1010865877', { 
      waitUntil: 'networkidle' 
    });
    
    // Take screenshot to see what we got
    await page.screenshot({ path: '/home/matt/Atlas-Financial/personal-fin-app/scripts/debug-screenshot.png' });
    
    // Try to find reviews section
    console.log('Looking for reviews section...');
    const reviewElements = await page.$$('div[aria-label*="review"], button[aria-label*="review"], .we-customer-review');
    console.log(`Found ${reviewElements.length} potential review elements`);
    
    // Get page title to confirm we loaded correctly
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check for any review-related text
    const pageText = await page.textContent('body');
    const hasReviews = pageText.includes('review') || pageText.includes('rating');
    console.log(`Page contains review-related content: ${hasReviews}`);
    
    // Look for specific selectors
    const selectors = [
      'button[aria-label*="Ratings"]',
      'button[aria-label*="Reviews"]', 
      '.we-customer-review',
      '[data-test*="review"]',
      '.review'
    ];
    
    for (const selector of selectors) {
      const elements = await page.$$(selector);
      console.log(`Selector "${selector}": ${elements.length} elements found`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAppStoreCrawl();