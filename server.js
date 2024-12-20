const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/filtered-iframe', async (req, res) => {
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // These args help in Heroku environments
    });

    const page = await browser.newPage();

    // Navigate to the Spond page
    await page.goto('https://club.spond.com/landing/signup/uibk/form/B14624E3E6D9403AB9F922BD7AD6FC7A', {
      waitUntil: 'networkidle0'
    });

    // Wait for the target div to appear.
    // Adjust the selector if it changes.
    await page.waitForSelector('div.sc-CNKsk.jyiliW', { timeout: 10000 });

    // Extract the outer HTML of the target div
    const extractedHTML = await page.evaluate(() => {
      const targetDiv = document.querySelector('div.sc-CNKsk.jyiliW');
      return targetDiv ? targetDiv.outerHTML : null;
    });

    if (!extractedHTML) {
      return res.status(404).send('Target div not found');
    }

    // Return the extracted HTML wrapped in a minimal HTML document
    res.send(`<!DOCTYPE html><html><head><title>Filtered Content</title></head><body>${extractedHTML}</body></html>`);

  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
