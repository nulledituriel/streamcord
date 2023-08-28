const config = require('../../config.json');

module.exports = (results) => {

    const hd = config.hd;
    const vost = config.vost;

    if (!hd && !vost) return results;
    if(hd) {
        for(let result of results) {
            if(!result[2].includes('HD')) {
                delete results[results.indexOf(result)];
                results = results.filter(function (el) {
                    return el != null;
                });
            }
        }
    }

    if(vost) {
        for(let result of results) {
            if(!result[2].includes('VOST')) {
                delete results[results.indexOf(result)];
                results = results.filter(function (el) {
                    return el != null;
                });
            }
        }
    }

    results = results.filter(function (el) {
        return el != null;
    });

    return results;

}