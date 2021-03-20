const {
    RSS_YOUTUBE, 
    FIRST_VIDEO_ID,
    FIRST_VIDEO_TITLE,
    VIDEO_LIST
} = require('./utils/constants')

const {
    YOUTUBE_CHANNEL_ID
} = process.env

const fs = require("fs").promises
const Parser = require('rss-parser');

const parser = new Parser();

// Getting my lastest 6 videos on YouTube
const getLatestVideosFromYouTube = () =>
    parser.parseURL(`${RSS_YOUTUBE}${YOUTUBE_CHANNEL_ID}`)
        .then(({ items }) => items && items.map(({ id, title, link }) => {
            const twoPointsLastIndex = id.lastIndexOf(":");
            const newId = twoPointsLastIndex !== -1 ? id.substring(twoPointsLastIndex + 1) : id
            
            return {
                id: newId,
                title,
                link
            }
        }).slice(0, 6))

const updateReadme = async () => {
    const [
        template, 
        ytVideos
    ] = await Promise.all(
        [
            fs.readFile("./templates/README.md.tpl", { encoding: "utf-8" }),
            getLatestVideosFromYouTube()
        ]
    );
    
    const [
        first,
        ...videos
    ] = ytVideos;

    const { 
        title: firstVideoTitle,
        id: firstVideoId
    } = first;

    const videoList = 
        videos.map(({ title, link }) => [`* [${title}](${link})`])
        .join("\n")

    const newREADME = template
        .replace(FIRST_VIDEO_ID, firstVideoId)
        .replace(FIRST_VIDEO_TITLE, firstVideoTitle)
        .replace(VIDEO_LIST, videoList);

    await fs.writeFile("README.md", newREADME);
};

updateReadme();