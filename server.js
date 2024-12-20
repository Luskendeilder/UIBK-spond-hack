const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/filtered-iframe', async (req, res) => {
  try {
    // Fetch the remote page from Spond
    const { data: html } = await axios.get('https://club.spond.com/landing/signup/uibk/form/B14624E3E6D9403AB9F922BD7AD6FC7A');

    // Parse the HTML using JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Select the specific div you want to show
    const targetDiv = document.querySelector('div.sc-cpjgyG.eRXCgh');

    if (!targetDiv) {
      return res.status(404).send('Target div not found');
    }

    // Extract the div’s HTML
    const extractedHTML = targetDiv.outerHTML;

    // Send it back as a simple webpage
    res.send(`<!DOCTYPE html><html><head><title>Filtered Content</title></head><body>${extractedHTML}</body></html>`);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching/processing the external page');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
