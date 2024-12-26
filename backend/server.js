const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const cors = require('cors')
require('./config/db')
const morgan = require('morgan')

app.use(morgan('tiny'))
app.disable('x-powered-by') //less hackers know about our stack
const router = require('./router/route')
const fileupload = require('express-fileupload');
app.use(fileupload());
app.use(express.static('assets'))
const path = require('path');
app.use('/assets', express.static(path.join(__dirname, 'assets')));
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET, POST, PUT, DELETE',
    credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())

const port = 2000

app.use('/api', router)

/*** HTTP Get Request ***/
app.get('/', (req, res) => {
    res.status(200).json('Home GET Request')
})

/*** Start Server ***/
app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})

