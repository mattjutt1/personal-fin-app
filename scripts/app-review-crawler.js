const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

/**
 * Deep crawler for app store reviews to validate pain points
 * Targets: YNAB, Mint alternatives, PocketGuard, etc.
 */

class AppReviewCrawler {
  constructor() {
    this.results = {
      painPoints: {
        complexity: [],
        guilt: [],
        categories: [],
        pricing: [],
        timeConsuming: [],
        familyFeatures: []
      },
      successStories: {
        simpleApps: [],
        userPreferences: []
      },
      statistics: {
        totalReviews: 0,
        negativeReviews: 0,
        abandonmentReasons: {}
      }
    };
  }

  async crawlAppStoreReviews(appUrl, appName) {
    console.log(`Starting crawl for ${appName}...`);
    const browser = await chromium.launch({ 
      headless: true,
      slowMo: 1000 
    });
    
    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page = await context.newPage();
      
      // Navigate to app page with delay
      console.log(`Navigating to ${appUrl}...`);
      await page.goto(appUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // Try to find and extract reviews from the current page
      console.log('Looking for review elements...');
      
      // Updated selectors based on 2024 App Store structure
      const reviewSelectors = [
        '.we-customer-review',
        '[data-test-review-body]',
        '.review-content',
        'div[aria-label*="review"]'
      ];
      
      let reviews = [];
      
      for (const selector of reviewSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          console.log(`Found reviews with selector: ${selector}`);
          
          reviews = await page.$$eval(selector, (elements) => {
            return elements.map(el => {
              // Try multiple ways to extract review data
              const ratingEl = el.querySelector('.we-star-rating, [aria-label*="star"], .rating');
              const titleEl = el.querySelector('h3, .review-title, [data-test-review-title]');
              const textEl = el.querySelector('blockquote, .review-body, [data-test-review-body], p');
              const dateEl = el.querySelector('time, .review-date, [data-test-review-date]');
              
              const rating = ratingEl?.getAttribute('aria-label') || ratingEl?.textContent || '';
              const title = titleEl?.textContent?.trim() || '';
              const text = textEl?.textContent?.trim() || '';
              const date = dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || '';
              
              return { rating, title, text, date, source: 'app-store' };
            }).filter(review => review.text.length > 10); // Filter out empty reviews
          });
          
          if (reviews.length > 0) {
            console.log(`Successfully extracted ${reviews.length} reviews`);
            break;
          }
        } catch (error) {
          console.log(`Selector ${selector} not found, trying next...`);
        }
      }
      
      // If no reviews found with standard selectors, try alternative approach
      if (reviews.length === 0) {
        console.log('No reviews found with standard selectors, trying alternative extraction...');
        
        // Look for any text that might be reviews
        const allText = await page.evaluate(() => {
          const textElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent || '';
            return text.length > 50 && text.length < 1000 && 
                   (text.includes('star') || text.includes('review') || text.includes('app'));
          });
          
          return textElements.map(el => ({
            text: el.textContent?.trim() || '',
            className: el.className,
            tagName: el.tagName
          }));
        });
        
        // Process alternative extraction
        reviews = allText.filter(item => item.text.length > 50).map(item => ({
          rating: 'unknown',
          title: '',
          text: item.text,
          date: '',
          source: 'app-store-alt'
        }));
        
        console.log(`Alternative extraction found ${reviews.length} potential reviews`);
      }
      
      // Process collected reviews
      console.log(`Processing ${reviews.length} reviews for ${appName}...`);
      for (const review of reviews) {
        this.categorizeReview(review, appName);
      }
      
      console.log(`Completed crawl for ${appName}: ${reviews.length} reviews processed`);
      
    } catch (error) {
      console.error(`Error crawling ${appName}:`, error.message);
      
      // Try fallback approach using search results
      console.log(`Attempting fallback approach for ${appName}...`);
      await this.crawlViaSearch(appName);
      
    } finally {
      await browser.close();
    }
  }

  async crawlViaSearch(appName) {
    console.log(`Starting search-based crawl for ${appName} reviews...`);
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Search for reviews using Google
      const searchQueries = [
        `"${appName}" app store reviews "1 star" "2 star" complaints`,
        `"${appName}" reddit reviews problems "stopped using"`,
        `"${appName}" app reviews "too complicated" "difficult"`
      ];
      
      for (const query of searchQueries) {
        try {
          await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
          await page.waitForSelector('.g', { timeout: 5000 });
          
          // Extract search result snippets
          const snippets = await page.$$eval('.g', (elements) => {
            return elements.map(el => {
              const titleEl = el.querySelector('h3');
              const snippetEl = el.querySelector('.VwiC3b, .s3v9rd');
              return {
                title: titleEl?.textContent || '',
                snippet: snippetEl?.textContent || '',
                url: el.querySelector('a')?.href || ''
              };
            });
          });
          
          // Process snippets as pseudo-reviews
          for (const snippet of snippets) {
            if (snippet.snippet.length > 30) {
              this.categorizeReview({
                rating: 'search-result',
                title: snippet.title,
                text: snippet.snippet,
                date: 'recent',
                source: 'google-search'
              }, appName);
            }
          }
          
          await page.waitForTimeout(2000); // Be respectful with requests
          
        } catch (error) {
          console.log(`Search query failed: ${query}`);
        }
      }
      
    } catch (error) {
      console.error('Search fallback failed:', error);
    } finally {
      await browser.close();
    }
  }

  categorizeReview(review, appName) {
    const text = (review.title + ' ' + review.text).toLowerCase();
    this.results.statistics.totalReviews++;
    
    // Check for complexity complaints
    if (text.match(/complicated|complex|confusing|difficult|hard to use|steep learning|overwhelming/)) {
      this.results.painPoints.complexity.push({
        app: appName,
        rating: review.rating,
        text: review.text,
        date: review.date
      });
    }
    
    // Check for guilt/negative emotions
    if (text.match(/guilt|shame|feel bad|depressing|stressful|anxiety/)) {
      this.results.painPoints.guilt.push({
        app: appName,
        rating: review.rating,
        text: review.text,
        date: review.date
      });
    }
    
    // Check for category issues
    if (text.match(/categories|categoriz|too many|manual entry|tedious/)) {
      this.results.painPoints.categories.push({
        app: appName,
        rating: review.rating,
        text: review.text,
        date: review.date
      });
    }
    
    // Check for pricing complaints
    if (text.match(/expensive|price|cost|subscription|free|money/)) {
      this.results.painPoints.pricing.push({
        app: appName,
        rating: review.rating,
        text: review.text,
        date: review.date
      });
    }
    
    // Check for time-consuming complaints
    if (text.match(/time consuming|hours|daily|maintenance|chore|tedious/)) {
      this.results.painPoints.timeConsuming.push({
        app: appName,
        rating: review.rating,
        text: review.text,
        date: review.date
      });
    }
    
    // Check for family/sharing requests
    if (text.match(/family|spouse|partner|share|sharing|together/)) {
      this.results.painPoints.familyFeatures.push({
        app: appName,
        rating: review.rating,
        text: review.text,
        date: review.date
      });
    }
    
    // Track abandonment reasons
    if (text.match(/stopped using|gave up|uninstalled|deleted|abandoned/)) {
      this.results.statistics.negativeReviews++;
      const reason = this.extractAbandonmentReason(text);
      this.results.statistics.abandonmentReasons[reason] = 
        (this.results.statistics.abandonmentReasons[reason] || 0) + 1;
    }
  }

  extractAbandonmentReason(text) {
    if (text.includes('complex') || text.includes('complicated')) return 'complexity';
    if (text.includes('time') || text.includes('tedious')) return 'time_consuming';
    if (text.includes('price') || text.includes('expensive')) return 'pricing';
    if (text.includes('sync') || text.includes('connection')) return 'technical_issues';
    if (text.includes('manual') || text.includes('entry')) return 'manual_entry';
    return 'other';
  }

  async crawlRedditDiscussions() {
    console.log('Starting Reddit discussions crawl...');
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Search for relevant Reddit discussions
      const searches = [
        'site:reddit.com/r/personalfinance "stopped using YNAB"',
        'site:reddit.com/r/ynab "too complicated"',
        'site:reddit.com/r/personalfinance "simple budgeting app"',
        'site:reddit.com/r/mintuit "alternatives" simple'
      ];
      
      for (const searchQuery of searches) {
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);
        await page.waitForSelector('.g', { timeout: 5000 });
        
        // Extract Reddit URLs
        const urls = await page.$$eval('.g a', links => 
          links.map(link => link.href).filter(url => url.includes('reddit.com'))
        );
        
        // Visit each Reddit thread
        for (const url of urls.slice(0, 5)) { // Limit to 5 threads per search
          try {
            await page.goto(url);
            await page.waitForSelector('[data-testid="comment"]', { timeout: 5000 });
            
            // Extract comments
            const comments = await page.$$eval('[data-testid="comment"]', elements => {
              return elements.map(el => el.textContent || '');
            });
            
            // Analyze comments for insights
            this.analyzeRedditComments(comments, url);
            
          } catch (error) {
            console.log(`Failed to crawl Reddit URL: ${url}`);
          }
        }
      }
      
    } catch (error) {
      console.error('Reddit crawl error:', error);
    } finally {
      await browser.close();
    }
  }

  analyzeRedditComments(comments, url) {
    for (const comment of comments) {
      const text = comment.toLowerCase();
      
      // Look for simple app preferences
      if (text.match(/simple|basic|easy|straightforward/) && 
          text.match(/budget|app|tracking/)) {
        this.results.successStories.simpleApps.push({
          source: url,
          text: comment.substring(0, 500)
        });
      }
      
      // Look for specific user preferences
      if (text.match(/i just want|all i need|wish.*would/)) {
        this.results.successStories.userPreferences.push({
          source: url,
          text: comment.substring(0, 500)
        });
      }
    }
  }

  async generateReport() {
    const report = {
      summary: {
        totalReviewsAnalyzed: this.results.statistics.totalReviews,
        painPointsIdentified: {
          complexity: this.results.painPoints.complexity.length,
          guilt: this.results.painPoints.guilt.length,
          categories: this.results.painPoints.categories.length,
          pricing: this.results.painPoints.pricing.length,
          timeConsuming: this.results.painPoints.timeConsuming.length,
          familyFeatures: this.results.painPoints.familyFeatures.length
        },
        topAbandonmentReasons: this.results.statistics.abandonmentReasons,
        simpleAppPreferences: this.results.successStories.simpleApps.length,
        userWants: this.results.successStories.userPreferences.length
      },
      detailedFindings: this.results,
      timestamp: new Date().toISOString()
    };
    
    // Save report
    const reportPath = path.join(__dirname, '../docs/research/validation/app-review-analysis.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`Report saved to: ${reportPath}`);
    return report;
  }
}

// Main execution
async function main() {
  const crawler = new AppReviewCrawler();
  
  // Crawl major budgeting apps
  const appsToAnalyze = [
    {
      url: 'https://apps.apple.com/us/app/ynab-you-need-a-budget/id1010865877',
      name: 'YNAB'
    },
    {
      url: 'https://apps.apple.com/us/app/pocketguard-budget-tracker/id969755125',
      name: 'PocketGuard'
    },
    {
      url: 'https://apps.apple.com/us/app/goodbudget-budget-planner/id471112395',
      name: 'Goodbudget'
    }
  ];
  
  // Crawl each app
  for (const app of appsToAnalyze) {
    await crawler.crawlAppStoreReviews(app.url, app.name);
  }
  
  // Crawl Reddit discussions
  await crawler.crawlRedditDiscussions();
  
  // Generate final report
  const report = await crawler.generateReport();
  
  console.log('\n=== VALIDATION SUMMARY ===');
  console.log(JSON.stringify(report.summary, null, 2));
}

// Run the crawler
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AppReviewCrawler;