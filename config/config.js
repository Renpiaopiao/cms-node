const dev = require('./config.env.dev')
const prod = require('./config.env.prod')
const common = require('@bigbighu/altas')

const config = {
    dev,
    prod
}

for(let i in config){
    config[i][common] = common
}

module.exports = config