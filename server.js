const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const authRoutes = require('./routes/auth');
const mapRoutes = require('./routes/map');
const userRoutes = require('./routes/user');

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());

mongoose.connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => console.log('DB connected'));

if (process.env.NODE_ENV === 'DEVELOPMENT') {
    app.use(cors({ origin: `${ process.env.CLIENT_URL }` }));
}

app.use('/api', authRoutes);
app.use('/api', mapRoutes);
app.use('/api', userRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${ port }`);
});