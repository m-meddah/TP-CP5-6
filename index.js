const express = require('express');
const cors = require('cors');

require('dotenv').config();

const router = require('./app/router');

const app = express()
const port = process.env.PORT || 3000;

app.use(express.urlencoded({extended : true}));

app.use(cors({
    origin: "*"
}));

const multer = require('multer');
const bodyParser = multer();

app.use( bodyParser.none() );

const bodySanitizer = require('./app/middlewares/body-sanitizer');
app.use(bodySanitizer);

app.use(express.static('./public'));

app.use(router);

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})
