const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: false, // run in headful mode
    // userDataDir: '/Users/nosh/~/Library/Application Support/Google/Chrome/Dev Vyas',
    args: ['--start-maximized'],
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');
  
  await page.goto('https://chat.openai.com/?model=gpt-4');

  // Wait for 2 seconds to simulate human delay
  await page.waitForTimeout(2000);
  
  // Upload the file
  const inputUploadHandle = await page.$('input[type="file"]'); 
  await inputUploadHandle.uploadFile('/Users/nosh/Downloads/262620-blank-355.png');
  
  // Random delay to simulate human-like interaction
  await page.waitForTimeout(1000 + Math.floor(Math.random() * 2000));

  // Type into the textarea after making sure it's enabled
  const textareaSelector = '#prompt-textarea';
  await page.waitForSelector(textareaSelector, { visible: true });
  await page.click(textareaSelector);
  await page.type(textareaSelector, 'Please analyze this image', { delay: 100 + Math.floor(Math.random() * 100) });
  
  // Random delay to simulate human-like interaction
  await page.waitForTimeout(1000 + Math.floor(Math.random() * 2000));

  // Wait for the send button to be enabled and click it
  const sendButtonSelector = 'button[data-testid="send-button"]:not([disabled])';
  await page.waitForSelector(sendButtonSelector, { visible: true });
  const sendButton = await page.$(sendButtonSelector);
  const submitButtonBox = await sendButton.boundingBox();
  await page.mouse.click(
    submitButtonBox.x + submitButtonBox.width / 2,
    submitButtonBox.y + submitButtonBox.height / 2,
    { delay: Math.floor(Math.random() * 100) }
  );
  
  await page.waitForTimeout(40000);
  // Wait for the response to be visible
  await page.waitForSelector('[data-message-author-role="assistant"]', { visible: true });
  const responses = await page.$$('[data-message-author-role="assistant"]');
  const lastResponse = responses[responses.length - 1];
  const responseText = await lastResponse.evaluate(el => el.textContent);


  console.log('GPT-4 Response:', responseText);


  await page.waitForTimeout(400);


  

  await page.waitForTimeout(400);

  // Wait for the new prompt area to be visible
 
  await page.goto('https://chat.openai.com/?model=gpt-4-dalle');

  await page.click(textareaSelector);
  await page.type(textareaSelector, responseText);
  await page.waitForTimeout(1000 + Math.floor(Math.random() * 2000));

  await page.waitForSelector(sendButtonSelector, { visible: true });


  await page.mouse.click(
    submitButtonBox.x + submitButtonBox.width / 2,
    submitButtonBox.y + submitButtonBox.height / 2,
    { delay: Math.floor(Math.random() * 100) }
  );
  
  await page.waitForTimeout(40000);

    // Get all image sources from the page
    const imageUrls = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('.dalle-image img'));
      return images.map(img => img.src);
    });
  




  // Additional random delay before closing
  await page.waitForTimeout(5000 + Math.floor(Math.random() * 5000));
  await browser.close();
})();