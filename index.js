var express = require('express');
var cors = require('cors');
const env = require('dotenv').config();
const clerk = require('@clerk/clerk-sdk-node');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const headless = "new";

// Initialize Clerk
var app = express();
app.use(cors());

app.post('/create', async function (req, res) {
    const { x, y, xval, yval, userId } = req.query;


    let userApiLimit = await prisma.UserApiLimit.findUnique({
        where: {
            userId
        }
    });

    if (!userApiLimit) {
        await prisma.UserApiLimit.create({
            data: {
                userId,
                count: 0
            }
        });
    }
    else if (userApiLimit.count >= 5) {
        res.status(403).send({
            message: 'You have exceeded your API limit'
        });
    } else {
        try {
            let templateText = `Create an image of an expressive graph using the x and y data sets listed below. Plot the graph according to point ${xval} on x-axis and ${yval} on the y-axis. Use ${y} as the sprite for filling up the graph. Data Being Tracked: x-axis: ${x}, y-axis: ${y}, x-axis-values: ${xval}, y-axis-values: ${yval}`;

            await (async () => {
                const browser = await puppeteer.launch({
                    channel: 'chrome',
                    headless: headless, // run in headful mode
                    userDataDir: "C:\\Users\\Nitish Maindoliya\\AppData\\Local\\Google\\Chrome\\User Data",
                    args: ['--start-maximized'],
                });

                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');

                await page.goto('https://chat.openai.com/?model=gpt-4-dalle');
                await page.waitForTimeout(2000);

                const textareaSelector = '#prompt-textarea';
                await page.waitForSelector(textareaSelector, { visible: true });
                await page.click(textareaSelector);
                await page.type(textareaSelector, templateText);
                await page.waitForTimeout(1000 + Math.floor(Math.random() * 2000));

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

                // Get all image sources from the page
                let imageUrls = await page.evaluate(() => {
                    const images = Array.from(document.querySelectorAll('img'));
                    return images.map(img => img.src);
                });


                const imageDatas = imageUrls.slice(2).map(async (url) => {
                    const image = await fetch(
                        url,
                    ).then((r) => r.blob());

                    return image;
                });

                const imageDatasResolved = await Promise.all(imageDatas);
                // console.log(imageDatasResolved);

                // Convert the image data to base64 and send it back to the client
                const arrayBufferList = await imageDatasResolved.map(async (image) => {
                    const arb = await Promise.resolve(image.arrayBuffer());
                    return Buffer.from(arb).toString('base64');
                });
                const arrayBufferListResolved = await Promise.all(arrayBufferList);
                console.log(arrayBufferListResolved);

                await browser.close();

                res.status(200).send(arrayBufferListResolved);
            })();

            userApiLimit = await prisma.UserApiLimit.findUnique({
                where: {
                    userId
                }
            });

            await prisma.UserApiLimit.update({
                where: {
                    userId
                },
                data: {
                    count: userApiLimit.count + 1
                }
            });
        } catch (e) {
            console.log(e);
            res.status(500).send({
                message: 'Something went wrong'
            });
        }
    }
});

app.post('/upload', async function(req, res) {
    let { image, userId } = req.query;
    // get the last part of the path
    const imageLast = image.split('\\').pop();
    imagePath = `C:\\images\\${imageLast}`;
    // console.log(imageLast, imagePath);

    let userApiLimit = await prisma.UserApiLimit.findUnique({
        where: {
            userId
        }
    });

    if (!userApiLimit) {
        await prisma.UserApiLimit.create({
            data: {
                userId,
                count: 0
            }
        });
    }
    else if (userApiLimit.count >= 5) {
        res.status(403).send({
            message: 'You have exceeded your API limit'
        });
    } else {
        try {
            await(async () => {
                const browser = await puppeteer.launch({
                    channel: 'chrome',
                    headless: headless, // run in headful mode
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
                await inputUploadHandle.uploadFile(imagePath);

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
                await page.waitForTimeout(2000);

                await page.waitForSelector(textareaSelector, { visible: true });
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
                let imageUrls = await page.evaluate(() => {
                    const images = Array.from(document.querySelectorAll('img'));
                    return images.map(img => img.src);
                });
                // console.log(imageUrls);


                const imageDatas = imageUrls.slice(2).map(async (url) => {
                    const image = await fetch(
                        url,
                    ).then((r) => r.blob());

                    return image;
                });

                const imageDatasResolved = await Promise.all(imageDatas);
                // console.log(imageDatasResolved);

                // Convert the image data to base64 and send it back to the client
                const arrayBufferList = await imageDatasResolved.map(async (image) => {
                    const arb = await Promise.resolve(image.arrayBuffer());
                    return Buffer.from(arb).toString('base64');
                });
                const arrayBufferListResolved = await Promise.all(arrayBufferList);
                // console.log(arrayBufferListResolved);

                await browser.close();

                res.status(200).send(arrayBufferListResolved);
            })();

            userApiLimit = await prisma.UserApiLimit.findUnique({
                where: {
                    userId
                }
            });

            await prisma.UserApiLimit.update({
                where: {
                    userId
                },
                data: {
                    count: userApiLimit.count + 1
                }
            });
        } catch (e) {
            console.log(e);
            res.status(500).send({
                message: 'Something went wrong'
            });
        }
    }
});

app.listen(4000, function () {
    console.log('Example app listening on port 4000!');
});

