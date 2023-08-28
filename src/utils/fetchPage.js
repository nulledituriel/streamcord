const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (page) => {
    const { data } = await axios.get(`https://www.wawacity.homes/${page}`);
	return cheerio.load(data);
}