const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Example URL to test; replace if you like
const TEST_URL = 'https://www.google.com';

app.get('/', (req, res) => {
  res.send(`Puppeteer test server is running on port ${PORT}. Try /scrape`);
});

app.get('/scrape', async (req, res) => {
  let browser;
  try {
    // Log environment for debugging
    console.log('CHROME_PATH:', process.env.CHROME_PATH);
    console.log('CHROME_ARGS:', process.env.CHROME_ARGS);

    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_PATH, // Provided by the buildpack
      args: [
        ...(process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(' ') : []),
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    
    const page = await browser.newPage();
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    await browser.close();

    res.send(`Page title is: ${title}`);
  } catch (err) {
    console.error('Error launching Puppeteer:', err);
    if (browser) await browser.close();
    res.status(500).send(`Error: ${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
