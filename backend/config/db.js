const mongoose = require('mongoose')

const URI = process.env.MONGO_URL

mongoose.connect(URI)
.then(() => {
    console.log('connection is done to DB')
})
.catch((error) => {
    console.log('error in connection', error)
})