require('dotenv').config({path:'../.env'});
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const topics = [
    'Movie reviews',
    'Latest Tech reviews',
    'Spirituality',
    'Romance',
    'Wealth'
];

function getRandomTopic() {
    const randomIndex = Math.floor(Math.random() * topics.length);
    return topics[randomIndex];
}

const selectedTopic = getRandomTopic();
console.log('Selected Topic:', selectedTopic);

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_DATAAPI_KEY // Replace with your YouTube API key
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Replace with your Gemini API key
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const query = selectedTopic;

async function getChannel(query) {
    try {
        const response = await youtube.search.list({
            part: 'snippet',
            q: query,
            maxResults: 1,
            order: 'date',
            type: 'channel'
        });

        const data = response.data.items;

        if (data.length === 0) {
            throw new Error('No channels found');
        }

        return data[0].snippet.channelId;  // Return the channelId directly
    } catch (error) {
        console.error('Error fetching channel', error);
        throw error;
    }
}

async function getVideosFromChannel(channelId) {
    try {
        const response = await youtube.search.list({
            part: 'snippet',
            channelId: channelId,
            maxResults: 1,  // Fetch more videos to filter later
            order: 'date'
        });

        const data = response.data.items;

        if (data.length === 0) {
            throw new Error('No videos found for this channel');
        }

        return data;
    } catch (error) {
        console.error('Error fetching videos', error);
        throw error;
    }
}

async function generateContentFromVideo(video) {
    try {
        const title = video.snippet.title;
        const description = video.snippet.description;
        const prompt = `Write a 100 to 150 words blog post about the YouTube video titled: "${title}". Description: ${description}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('Generated Blog Post:', text);
    } catch (error) {
        console.error('Error generating content', error);
    }
    
}

getChannel(query)
    .then((channelId) => {
        return getVideosFromChannel(channelId);
    })
    .then((videos) => {
        console.log(videos);
        generateContentFromVideo(videos[0]);
    })
    .catch((err) => {
        console.error('Error:', err);
    });