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
    WELCOME TO YOUR_BOT_NAME_HERE BOT!
    Please enter a song name or 
    enter a YouTube, Instagram, or Facebook URL to download or play audio/video
    `;
    bot.sendMessage(chatId, welcomeMessage);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore messages that are commands (start with '/')
    if (text.startsWith('/')) return;

    // Regular expression to match YouTube, Instagram, and Facebook URLs
    const youtubeUrlPattern = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([^"&?\/\s]{11}))/;
    const instaUrlPattern = /https:\/\/www\.instagram\.com\/reel\/\S+/;
    const fbUrlPattern = /https:\/\/www\.facebook\.com\/reel\/\S+/;

    if (youtubeUrlPattern.test(text)) {
        // Handle YouTube URL
        const youtubeUrl = text.match(youtubeUrlPattern)[0];
        const videoId = text.match(youtubeUrlPattern)[2]; // Extract the YouTube video ID from the URL

        try {
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
                [Thumbnail](${thumbnailUrl}) |
                [Play Audio](${audioUrl})
            `;

            // Send the message with Markdown format
            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Error fetching data:', error);
            bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
        }
    } else if (instaUrlPattern.test(text)) {
        // Handle Instagram URL
        try {
            const instaUrl = text.match(instaUrlPattern)[0];
            
            // Construct the download URL using the provided format
            const downloadUrl = `https://vivekfy.fanclub.rocks?url=${instaUrl}`;

            // Send the download URL with a button
            bot.sendMessage(chatId, `Download from Instagram: ${downloadUrl}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Download', url: downloadUrl }]
                    ]
                }
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
        }
    } else if (fbUrlPattern.test(text)) {
        // Handle Facebook URL
        try {
            const fbUrl = text.match(fbUrlPattern)[0];
            const apiUrl = `https://vivekfy-all-api.vercel.app/api/fb?video=${encodeURIComponent(fbUrl)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            const videoUrl = data.sd || data.hd; // Use SD if HD is not available
            const thumbnailUrl = data.thumbnail;

            // Send the video directly to the chat
            bot.sendVideo(chatId, videoUrl, { caption: `[Thumbnail](${thumbnailUrl})` });

        } catch (error) {
            console.error('Error fetching data:', error);
            bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
        }
    } else {
        // Assume it's a song name search
        try {
            // Fetch data from the song search API
            const apiSearchUrl = `https://vivacious-obvious-orchestra.glitch.me?name=${encodeURIComponent(text)}`;
            const response = await axios.get(apiSearchUrl);
            const data = response.data;

            if (data.length === 0) {
                bot.sendMessage(chatId, 'No results found for your search.');
                return;
            }

            // Send each search result in a separate message
            data.forEach((item) => {
                const message = `
                    *${item.title}*
                    Artist: ${item.artist}
                    [Thumbnail](${item.thumbnailUrl}) |
                    [Download MP3](${item.downloadUrl})
                `;

                bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
        }
    }
});
