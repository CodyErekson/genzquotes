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
        const response = await axios.get('https://zenquotes.io/');
        const $ = cheerio.load(response.data);
        const quote = $('.quote').first().text().trim();
        return quote || "The journey of a thousand miles begins with one step.";
    } catch (error) {
        console.error('Error scraping Zen quote:', error);
        return "The journey of a thousand miles begins with one step.";
    }
}

async function scrapeBibleVerse() {
    try {
        const response = await axios.get('https://www.verseoftheday.com/');
        const $ = cheerio.load(response.data);
        const verse = $('.bilingual-left').text().trim();
        return verse || "For God so loved the world, that he gave his only begotten Son.";
    } catch (error) {
        console.error('Error scraping Bible verse:', error);
        return "For God so loved the world, that he gave his only begotten Son.";
    }
}

async function scrapeLDSQuote() {
    try {
        const response = await axios.get('https://ldssotd.com/');
        const $ = cheerio.load(response.data);
        const quote = $('.quote-text').first().text().trim();
        return quote || "Faith is not by chance, but by choice.";
    } catch (error) {
        console.error('Error scraping LDS quote:', error);
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
    try {
        const response = await axios.get('https://softwarequotes.com/quote-of-the-day');
        const $ = cheerio.load(response.data);
        const quote = $('.quote-text').first().text().trim();
        return quote || "Software is a great combination between artistry and engineering.";
    } catch (error) {
        console.error('Error scraping software quote:', error);
        return "Software is a great combination between artistry and engineering.";
    }
}

// ChatGPT translation function
async function translateToGenZ(quote) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a translator that converts quotes into Gen Z brain-rot dialect. Use modern slang, emojis, and Gen Z expressions while maintaining the core meaning of the quote.'
                },
                {
                    role: 'user',
                    content: `Translate this quote to Gen Z brain-rot dialect: "${quote}"`
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
        const { type } = req.query;
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
            default:
                return res.status(400).json({ error: 'Invalid quote type' });
        }

        // Translate to Gen Z dialect
        const translatedQuote = await translateToGenZ(quote);

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