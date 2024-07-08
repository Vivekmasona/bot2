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
 Please enter a song name ya 
enter a YouTube, Instagram, or Facebook URL to download or play audio 
    `;
    bot.sendMessage(chatId, welcomeMessage);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore messages that are commands (start with '/')
    if (text.startsWith('/')) return;

    // Regular expressions to match YouTube, Instagram, and Facebook URLs
    const youtubePattern = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([^"&?\/\s]{11}))/;
    const instagramPattern = /(https?:\/\/(?:www\.)?instagram\.com\/p\/([A-Za-z0-9-_]+))/;
    const facebookPattern = /(https?:\/\/(?:www\.)?facebook\.com\/(?:[A-Za-z0-9.]+\/videos\/|video\.php\?v=)([0-9]+))/;

    let match = text.match(youtubePattern) || text.match(instagramPattern) || text.match(facebookPattern);

    if (match) {
        const url = match[0];
        const service = youtubePattern.test(url) ? 'YouTube' : instagramPattern.test(url) ? 'Instagram' : 'Facebook';

        try {
            // Construct the API URL using the video URL
            const apiUrl = `https://vivekfy.vercel.app/hack?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            // For YouTube URLs
            if (service === 'YouTube') {
                const title = data.title;
                const thumbnailUrl = data.thumbnail;
                const audioUrl = data.audioFormats[0].url; // Assuming first audio format
                const downloadUrl = `https://vivekfy.fanclub.rocks?url=${encodeURIComponent(url)}`;

                const message = `
                    *${title}*
                    [download_thumbnail](${thumbnailUrl}) | [Play_Audio](${audioUrl}) | [Download_mp3](${downloadUrl})
                `;
                bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

            // For Instagram and Facebook URLs
            } else {
                const videoUrl = data.videoFormats[0].url; // Assuming first video format
                bot.sendMessage(chatId, `Downloading and sending the video...`);
                const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
                await bot.sendVideo(chatId, videoResponse.data, { caption: `Here is your ${service} video!` });
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
        }
    } else {
        // If it's not a YouTube, Instagram, or Facebook URL, assume it's a song name search
        try {
            // Fetch data from the song search API
            const apiSearchUrl = `https://free-axiomatic-teeth.glitch.me?name=${encodeURIComponent(text)}`;
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
