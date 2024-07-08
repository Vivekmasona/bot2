const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace with your actual bot token
const token = '6679345669:AAELrij30jh93yVhnI-yzqf2krf4QVHCdSs';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Welcome message for new users
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
    WELCOME TO VIVEKFY_AI❤️BOT!
dev vivek babu
    Please enter a song name 
              ya 
   enter a YouTube URL to download              or play audio 
    `;
    bot.sendMessage(chatId, welcomeMessage);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore messages that are commands (start with '/')
    if (text.startsWith('/')) return;

    // Regular expression to match YouTube URLs
    const urlPattern = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([^"&?\/\s]{11}))/;
    const match = text.match(urlPattern);

    if (match) {
        const youtubeUrl = match[0];
        const videoId = match[2]; // Extract the YouTube video ID from the URL

        try {
            // Construct the download URL using the video ID
            const downloadUrl = `https://vivekfy.fanclub.rocks?url=https://youtu.be/${videoId}`;

            // Fetch data from the API
            const apiUrl = `https://vivekfy.vercel.app/hack?url=${encodeURIComponent(youtubeUrl)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            // Extract relevant information for YouTube URL case
            const title = data.title;
            const thumbnailUrl = data.thumbnail;
            const audioUrl = data.audioFormats[0].url; // Assuming first audio format

            // Create a message with thumbnail, title, play audio link, and download link
            const message = `

                *${title}*
                [download_thumbnail](${thumbnailUrl}) |
[Play_Audio](${audioUrl}) | [Download_mp3](${downloadUrl})
            `;

            // Send the message with Markdown format
            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Error fetching data:', error);
            bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
        }
    } else {
        // If it's not a YouTube URL, assume it's a song name search
        try {
            // Fetch data from the song search API
            const apiSearchUrl = `https://fresh-cypress-revolve.glitch.me?name=${encodeURIComponent(text)}`;
            console.log(`Fetching data from: ${apiSearchUrl}`);
            const response = await axios.get(apiSearchUrl);
            console.log('API Response:', response.data);
            const data = response.data;

            if (data.length === 0) {
                bot.sendMessage(chatId, 'No results found for your search.');
                return;
            }

            // Send each search result in a separate message
            data.forEach((item, index) => {
                const message = `

                    *${item.title}*
                    Artist: ${item.artist}
                    [get_thumbnail](${item.thumbnailUrl}) | [Download_mp3](${item.downloadUrl})
                `;

                bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
        }
    }
});
