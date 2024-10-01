//npm init -y
//mb Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
//npm install axios cheerio node-cache
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes
const baseUrl = 'https://en.cynicmansion.ru/?page=';
//const baseUrl = 'https://cynicmansion.ru/?page=204'; //or RU version

// Sleep function
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function fetchComicPage(page) {
    const cachedData = cache.get(page);
    if (cachedData) {
        console.log(`Fetching from cache for page ${page}`);
        return cachedData;
    }

    try {
        const response = await axios.get(`${baseUrl}${page}`);
        const $ = cheerio.load(response.data);
        const comics = [];

        $('.comics_image').each((index, element) => {
            if (index < 10) { // Limit to 10 images
                const imageUrl = $(element).find('img').attr('src'); // Get src
                const title = $(element).find('img').attr('alt'); // Get alt

                if (imageUrl && title) {
                    // Form the full URL
                    const fullImageUrl = `https://cynicmansion.ru${imageUrl}`;
                    comics.push({ title, imageUrl: fullImageUrl });
                }
            }
        });

        cache.set(page, comics);
        console.log(`Fetched and cached comic data`);
        return comics;
    } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
    }
}

async function scrapeComics() {
    const pageToScrape = 11; // Specify the page to scrape
    await sleep(2000); // Delay before the request
    const comics = await fetchComicPage(pageToScrape);
    console.log(`Comics:`, comics);
}

scrapeComics();