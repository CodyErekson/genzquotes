const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Quote scraping functions
async function scrapeZenQuote() {
    try {
        // The site provides a REST API for random quotes, which is more reliable than scraping.
        const response = await axios.get('https://zenquotes.io/api/random');
        if (response.data && response.data.length > 0) {
            const quoteData = response.data[0];
            return `${quoteData.q} - ${quoteData.a}`;
        }
        // Fallback if the API response is not in the expected format.
        return "The journey of a thousand miles begins with one step.";
    } catch (error) {
        console.error('Error fetching Zen quote from API:', error);
        // If the API fails, return a default quote.
        return "The journey of a thousand miles begins with one step.";
    }
}

async function scrapeBibleVerse() {
    try {
        // Use the Bible API for a random verse, which is more reliable than scraping.
        const response = await axios.get('https://bible-api.com/data/web/random');
        if (response.data && response.data.random_verse) {
            const { text, book, chapter, verse } = response.data.random_verse;
            // The API includes a newline character, so we remove it.
            const cleanText = text.replace(/\n/g, ' ').trim();
            return `${cleanText} (${book} ${chapter}:${verse})`;
        }
        // Fallback if the API response is not in the expected format.
        return "For God so loved the world, that he gave his only begotten Son.";
    } catch (error) {
        console.error('Error fetching Bible verse from API:', error);
        // If the API fails, return a default quote.
        return "For God so loved the world, that he gave his only begotten Son.";
    }
}

// Cache for LDS quotes to avoid repeated scraping
let ldsQuotesCache = [];
let lastScrapeTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// Cache for Software quotes to avoid repeated scraping
let softwareQuotesCache = [];
let lastSoftwareScrapeTime = 0;

// Cache for Philosophy quotes to avoid repeated scraping
let philosophyQuotesCache = [];
let lastPhilosophyScrapeTime = 0;

async function scrapeLDSQuote() {
    const now = Date.now();
    // Use cache if it's not empty and not expired
    if (ldsQuotesCache.length > 0 && (now - lastScrapeTime < CACHE_DURATION)) {
        return ldsQuotesCache[Math.floor(Math.random() * ldsQuotesCache.length)];
    }

    try {
        console.log('Scraping Goodreads for LDS quotes...');
        const allQuotes = [];
        let page = 1;
        const maxPages = 6; // Limit to avoid excessive scraping, based on the site's pagination

        while (page <= maxPages) {
            const { data } = await axios.get(`https://www.goodreads.com/quotes/tag/lds?page=${page}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);
            const quoteElements = $('.quoteDetails');

            if (quoteElements.length === 0) {
                break; // No more quotes found, stop pagination
            }

            quoteElements.each((_, el) => {
                const quoteTextElement = $(el).find('.quoteText');
                const authorElement = quoteTextElement.find('span.authorOrTitle');
                const authorText = authorElement.text().trim();

                // Clone the element, remove the author part, and get the remaining text.
                const quote = quoteTextElement
                    .clone()
                    .find('span.authorOrTitle, a.leftAlignedImage, br') // remove author, images, and line breaks
                    .remove()
                    .end()
                    .text()
                    .trim()
                    .replace(/^“|”$/g, '') // remove surrounding quotes
                    .trim();

                // Exclude quotes longer than 100 words
                if (quote.split(/\s+/).length <= 100 && quote.length > 0) {
                    allQuotes.push(`${quote} - ${authorText}`);
                }
            });

            page++;
        }

        if (allQuotes.length > 0) {
            console.log(`Successfully scraped and cached ${allQuotes.length} LDS quotes.`);
            ldsQuotesCache = allQuotes;
            lastScrapeTime = now;
            return ldsQuotesCache[Math.floor(Math.random() * ldsQuotesCache.length)];
        }

        // Fallback if no quotes are found
        return "Faith is not by chance, but by choice.";
    } catch (error) {
        console.error('Error scraping LDS quotes from Goodreads:', error);
        // If scraping fails but we have a cache, use it. Otherwise, use fallback.
        if (ldsQuotesCache.length > 0) {
            return ldsQuotesCache[Math.floor(Math.random() * ldsQuotesCache.length)];
        }
        return "Faith is not by chance, but by choice.";
    }
}

async function scrapeGeekQuote() {
    const geekQuotes = [
        "The best way to predict the future is to implement it.",
        "Any sufficiently advanced technology is indistinguishable from magic.",
        "The only way to learn a new programming language is by writing programs in it.",
        "Talk is cheap. Show me the code.",
        "First, solve the problem. Then, write the code.",
        "Code is like humor. When you have to explain it, it's bad.",
        "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.",
        "It's not a bug – it's an undocumented feature.",
        "The most damaging phrase in the language is 'We've always done it this way!'",
        "The computer was born to solve problems that did not exist before."
    ];
    return geekQuotes[Math.floor(Math.random() * geekQuotes.length)];
}

async function scrapeSoftwareQuote() {
    const now = Date.now();
    // Use cache if it's not empty and not expired
    if (softwareQuotesCache.length > 0 && (now - lastSoftwareScrapeTime < CACHE_DURATION)) {
        return softwareQuotesCache[Math.floor(Math.random() * softwareQuotesCache.length)];
    }

    try {
        console.log('Scraping Goodreads for Software quotes...');
        const allQuotes = [];
        let page = 1;
        const maxPages = 10; // Scrape up to 10 pages for a good variety

        while (page <= maxPages) {
            const { data } = await axios.get(`https://www.goodreads.com/quotes/tag/programming?page=${page}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);
            const quoteElements = $('.quoteDetails');

            if (quoteElements.length === 0) {
                break; // No more pages
            }

            quoteElements.each((_, el) => {
                const quoteTextElement = $(el).find('.quoteText');
                const authorElement = quoteTextElement.find('span.authorOrTitle');
                const authorText = authorElement.text().trim();

                const quote = quoteTextElement
                    .clone()
                    .find('span.authorOrTitle, a.leftAlignedImage, br')
                    .remove()
                    .end()
                    .text()
                    .trim()
                    .replace(/^“|”$/g, '')
                    .trim();

                if (quote.split(/\s+/).length <= 100 && quote.length > 0) {
                    allQuotes.push(`${quote} - ${authorText}`);
                }
            });

            page++;
            // Add a small delay to be respectful to the server
            await new Promise(resolve => setTimeout(resolve, 250));
        }

        if (allQuotes.length > 0) {
            console.log(`Successfully scraped and cached ${allQuotes.length} Software quotes.`);
            softwareQuotesCache = allQuotes;
            lastSoftwareScrapeTime = now;
            return softwareQuotesCache[Math.floor(Math.random() * softwareQuotesCache.length)];
        }

        // Fallback if no quotes are found
        return "Software is a great combination between artistry and engineering.";
    } catch (error) {
        console.error('Error scraping Software quotes from Goodreads:', error);
        if (softwareQuotesCache.length > 0) {
            return softwareQuotesCache[Math.floor(Math.random() * softwareQuotesCache.length)];
        }
        return "Software is a great combination between artistry and engineering.";
    }
}

async function scrapePhilosophyQuote() {
    const now = Date.now();
    // Use cache if it's not empty and not expired
    if (philosophyQuotesCache.length > 0 && (now - lastPhilosophyScrapeTime < CACHE_DURATION)) {
        return philosophyQuotesCache[Math.floor(Math.random() * philosophyQuotesCache.length)];
    }

    try {
        console.log('Scraping HighExistence for Philosophy quotes...');
        const allQuotes = [];
        const { data } = await axios.get('https://www.highexistence.com/150-profound-philosophical-quotes-about-life-death-everything-in-between/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        // Quotes are in <h4> tags.
        $('h4').each((_, el) => {
            const fullText = $(el).text().trim();
            
            // The author is usually separated by a long dash '―'.
            const parts = fullText.split('―');
            if (parts.length >= 2) {
                let quote = parts[0].trim().replace(/^“|”$/g, '').trim();
                let author = parts.slice(1).join('―').trim();

                if (quote.length > 0 && author.length > 0 && quote.split(/\s+/).length <= 100) {
                    allQuotes.push(`${quote} - ${author}`);
                }
            }
        });

        if (allQuotes.length > 0) {
            console.log(`Successfully scraped and cached ${allQuotes.length} Philosophy quotes.`);
            philosophyQuotesCache = allQuotes;
            lastPhilosophyScrapeTime = now;
            return philosophyQuotesCache[Math.floor(Math.random() * philosophyQuotesCache.length)];
        }

        return "The only true wisdom is in knowing you know nothing. - Socrates";
    } catch (error) {
        console.error('Error scraping Philosophy quotes from HighExistence:', error);
        if (philosophyQuotesCache.length > 0) {
            return philosophyQuotesCache[Math.floor(Math.random() * philosophyQuotesCache.length)];
        }
        return "The only true wisdom is in knowing you know nothing. - Socrates";
    }
}


// ChatGPT translation function
async function translateQuote(quote, dialect = 'gen_z') {
    const dialectPrompts = {
        'gen_z': 'You are a translator that converts quotes into Gen Z brain-rot dialect. Use modern slang, emojis, and Gen Z expressions while maintaining the core meaning of the quote.',
        'pirate': 'You are a translator that converts quotes into Pirate speak. Use classic pirate slang and expressions while maintaining the core meaning of the quote.',
        'leet_speak': 'You are a translator that converts quotes into 2000s L33t Speak. Use numbers and symbols to replace letters and use classic l33t speak while maintaining the core meaning of the quote.',
        'medieval': 'You are a translator that converts quotes into Ye Olde Medieval English. Use archaic words and sentence structures to make it sound like it\'s from the Middle Ages, while maintaining the core meaning of the quote.'
    };

    const systemPrompt = dialectPrompts[dialect] || dialectPrompts['gen_z'];

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `Translate this quote: "${quote}"`
                }
            ],
            max_tokens: 150,
            temperature: 0.8
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error translating quote:', error);
        return quote; // Return original quote if translation fails
    }
}

// API endpoint
app.get('/api/quote', async (req, res) => {
    try {
        const { type, dialect } = req.query;
        let quote = '';

        // Get quote based on type
        switch (type) {
            case 'zen':
                quote = await scrapeZenQuote();
                break;
            case 'bible':
                quote = await scrapeBibleVerse();
                break;
            case 'lds':
                quote = await scrapeLDSQuote();
                break;
            case 'geek':
                quote = await scrapeGeekQuote();
                break;
            case 'software':
                quote = await scrapeSoftwareQuote();
                break;
            case 'philosophy':
                quote = await scrapePhilosophyQuote();
                break;
            default:
                return res.status(400).json({ error: 'Invalid quote type' });
        }

        // Translate to Gen Z dialect
        const translatedQuote = await translateQuote(quote, dialect);

        res.json({
            original: quote,
            translated: translatedQuote,
            type: type
        });
    } catch (error) {
        console.error('Error processing quote request:', error);
        res.status(500).json({ error: 'Failed to process quote request' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 