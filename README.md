# StreamCord
An easy-to-use discord bot to watch any of your favorite movies / tv shows.

## Installation
You need node.js installed. In the root directory, run `npm install`. Fill the `config.json` file with your information, and run `node index` in the `src` folder. Your bot should start.

## Features
- Supports discord.js 14 slash commands & buttons
- Search movies and tv shows with the `search` command
- Ability to filter the results (quality & subtitles) in the `config.json` file
- Direct download
- Multiple mirrors for file downloading

## How does it work?
It's using `https://wawacity.homes` as a reference to search the movies & shows. It then filters the results and format them through discord's embeds. Credits: cheerio and axios for web-scraping.
