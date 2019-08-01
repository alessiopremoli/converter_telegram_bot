const Axios = require('axios');
BASE_URL = 'https://api.exchangeratesapi.io/latest';

module.exports = {
    /**
     * Get the rate exchange
     * @param {*} source 
     * @param {*} destination 
     */
    getRate(source, destination) {
        url = `${BASE_URL}?base=${source}&symbols=${destination}`;
        return Axios.get(url);
    }
}