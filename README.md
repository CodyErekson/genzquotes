# Gen Z Quotes Translator

A web application that transforms classic quotes into Gen Z brain-rot dialect using ChatGPT. Users can select from different quote types (Zen, Bible Scripture, LDS Quote, Geek, Software) and get them translated into modern Gen Z slang and expressions.

## Features

- **Multiple Quote Types**: Choose from Zen, Bible Scripture, LDS Quote, Geek, and Software quotes
- **API and Web Scraping**: Fetches quotes from various online sources and APIs
- **AI Translation**: Uses OpenAI's `gpt-3.5-turbo` to translate quotes into Gen Z dialect
- **Modern UI**: Clean, responsive design that works on desktop and mobile
- **Real-time Processing**: Live translation with loading indicators
- **Caching**: Caches scraped quotes to reduce load times and repeated requests

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js, `cors`
- **Web Scraping/API**: Axios, Cheerio
- **AI Integration**: OpenAI API (`gpt-3.5-turbo`)
- **Deployment**: EC2, nginx

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd genzquotes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## API Endpoints

### GET /api/quote
Fetches and translates a quote based on the specified type.

**Query Parameters:**
- `type` (required): The type of quote to fetch
  - `zen`: Zen quotes
  - `bible`: Bible scripture
  - `lds`: LDS quotes
  - `geek`: Geek/tech quotes
  - `software`: Software development quotes

**Response:**
```json
{
  "original": "The journey of a thousand miles begins with one step.",
  "translated": "Bro, that 1000-mile journey? It literally starts with just one step, no cap fr fr 💀",
  "type": "zen"
}
```

## Quote Sources

- **Zen**: Fetched from the `zenquotes.io` API
- **Bible Scripture**: Fetched from `bible-api.com`
- **LDS Quote**: Scraped from `goodreads.com`'s LDS quotes tag
- **Geek**: Curated list of popular tech quotes
- **Software**: Scraped from `goodreads.com`'s programming quotes tag

## Implementation Details

- **Caching**: To avoid excessive scraping, quotes for the `lds` and `software` categories are cached for 24 hours after being fetched from Goodreads.
- **Fallbacks**: In case of an error while fetching a quote from an external source, a default fallback quote for the selected category is returned to ensure application stability.

## Deployment

### EC2 Setup

1. **Launch EC2 Instance**
   - Use Debian 12 AMI
   - Configure security groups to allow HTTP (80) and HTTPS (443)

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install nginx**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

4. **Deploy Application**
   ```bash
   git clone <repository-url>
   cd genzquotes
   npm install
   cp env.example .env
   # Edit .env with your OpenAI API key
   ```

5. **Configure nginx**
   Create `/etc/nginx/sites-available/genzquotes`:
   ```nginx
   server {
       listen 80;
       server_name quotes.iotacloud.tech;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable site and restart nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/genzquotes /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Set up PM2 for process management**
   ```bash
   sudo npm install -g pm2
   pm2 start server/app.js --name genzquotes
   pm2 startup
   pm2 save
   ```

8. **Configure SSL (Optional)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d quotes.iotacloud.tech
   ```

## Development

### Project Structure
```
genzquotes/
├── server/
│   └── app.js        # Express server and API endpoints
├── public/
│   ├── index.html    # Main HTML page
│   ├── styles.css    # CSS styles
│   └── script.js     # Frontend JavaScript
├── package.json      # Node.js dependencies
├── .env.example    # Environment variables template
└── README.md         # This file
```

### Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please open an issue on the GitHub repository. 