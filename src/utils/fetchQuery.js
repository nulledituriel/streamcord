const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (query, page) => {
    const { data } = await axios.get(`https://www.wawacity.homes/?search=${query}&page=${page}`);
	return cheerio.load(data);
}