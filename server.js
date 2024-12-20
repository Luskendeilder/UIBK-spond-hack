const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// URL of the Spond page
const SPOND_URL = 'https://club.spond.com/landing/signup/uibk/form/B14624E3E6D9403AB9F922BD7AD6FC7A';

// CSS selector for the target div
const TARGET_SELECTOR = 'div.sc-CNKsk.jyiliW';

app.get('/filtered-iframe', async (req, res) => {
  let browser;
  console.log('Received request at /filtered-iframe');

  try {
    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: 'new', // If 'new' causes issues, use true instead: headless: true
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.CHROME_PATH // Use Chromium installed by buildpack
    });

    console.log('Opening new page...');
    const page = await browser.newPage();

    console.log(`Navigating to ${SPOND_URL}`);
    await page.goto(SPOND_URL, { waitUntil: 'domcontentloaded' });

    console.log(`Waiting for selector: ${TARGET_SELECTOR}`);
    await page.waitForSelector(TARGET_SELECTOR, { timeout: 20000 });

    console.log('Selector found, extracting HTML...');
    const extractedHTML = await page.evaluate((sel) => {
      const targetDiv = document.querySelector(sel);
      return targetDiv ? targetDiv.outerHTML : null;
    }, TARGET_SELECTOR);

    if (!extractedHTML) {
      console.error('Target div not found in the DOM.');
      return res.status(404).send('Target div not found');
    }

    console.log('Sending extracted HTML to client');
    res.send(`<!DOCTYPE html><html><head><title>Filtered Content</title></head><body>${extractedHTML}</body></html>`);

  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('An error occurred');
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
