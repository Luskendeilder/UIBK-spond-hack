const express = require('express');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    const spondUrl = 'https://club.spond.com/landing/signup/uibk/form/B14624E3E6D9403AB9F922BD7AD6FC7A';
    console.log(`[${new Date().toISOString()}] Fetching from URL: ${spondUrl}`);

    const response = await fetch(spondUrl);
    console.log(`[${new Date().toISOString()}] Response status: ${response.status}`);

    if (!response.ok) {
      console.error(`[${new Date().toISOString()}] HTTP error! status: ${response.status}`);
      return res.status(response.status).send(`Error fetching content from Spond: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`[${new Date().toISOString()}] HTML content fetched successfully.`);

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Find the target div
    let targetDiv = null;
    const forms = document.querySelectorAll("form");
    
    // Check if any forms were found
    if (forms.length > 0) {
      const form = forms[0];
      console.log(`[${new Date().toISOString()}] Found form:`, form);

      targetDiv = form.parentElement;
      while (targetDiv && targetDiv.tagName !== "DIV") {
        targetDiv = targetDiv.parentElement;
      }

      if (targetDiv) {
        console.log(`[${new Date().toISOString()}] Found target div:`, targetDiv);

        // Create a new HTML document with only the target div
        const newHtml = `<!DOCTYPE html><html><head><title>Spond Form</title></head><body>${targetDiv.outerHTML}</body></html>`;
        console.log(`[${new Date().toISOString()}] Sending new HTML`);
        res.send(newHtml);
      } else {
        console.error(`[${new Date().toISOString()}] Target div not found (no div ancestor of form).`);
        res.status(500).send('Target div not found (no div ancestor of form)');
      }
    } else {
      console.error(`[${new Date().toISOString()}] No form found on the page.`);
      res.status(500).send('No form found on the page');
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    res.status(500).send('Error fetching or processing content');
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
