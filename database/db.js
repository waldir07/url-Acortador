const mongoose = require('mongoose');
require('dotenv').config()

const clientDB = mongoose.connect(process.env.URI || 5000)
.then((m) => {
    console.log('db conectada') 
    return m.connection.getClient() 
})
.catch(e => console.log('falló la conexión' + e))

module.exports = clientDB