var express = require('express');
var cors = require('cors');
const env = require('dotenv').config();
const clerk = require('@clerk/clerk-sdk-node');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize Clerk
var app = express();
app.use(cors());

app.post('/create', async function (req, res) {
    const userList = await clerk.users.getUserList();
    console.log(userList);

    const userApiLimit  = await prisma.UserApiLimit.findUnique({
        where: {
            userId
        }
    });

    if(userApiLimit) {
        await prisma.UserApiLimit.update({
            where: {
                userId
            },
            data: {
                count: userApiLimit.count + 1
            }
        });
    } else {
        await prisma.UserApiLimit.create({
            data: {
                userId,
                count: 1
            }
        });
    }

    if (userApiLimit.count >= 5) {
        res.send({
            status: 403,
            message: 'You have exceeded your API limit'
        });
    } else {
        const puppeteer = require('puppeteer-extra');
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());

        (async () => {
            const browser = await puppeteer.launch({
                channel: 'chrome',
                headless: false, // run in headful mode
                userDataDir: "C:\\Users\\Nitish Maindoliya\\AppData\\Local\\Google\\Chrome\\User Data",
                args: ['--start-maximized'],
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');

            await page.goto('https://chat.openai.com/?model=gpt-4');

            // Wait for 2 seconds to simulate human delay
            await page.waitForTimeout(2000);

            // Upload the file
            const inputUploadHandle = await page.$('input[type="file"]');
            await inputUploadHandle.uploadFile('C:\\Users\\Nitish Maindoliya\\Desktop\\test\\hackatl\\scraper\\img.png');

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
    }
});

app.post('/upload', function (req, res) {

});

app.listen(4000, function () {
    console.log('Example app listening on port 3000!');
});

