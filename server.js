const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const moment = require('moment');
require('dotenv').config();

const { addUser, removeUser, getUser, getUsersInRoom } = require('./helpers/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', socket => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) {
            return callback(error);
        }

        socket.emit('message', { user: 'WorldChat', text: `Welcome to the chat, ${ user.name }!`, time: moment().format('h:mm a')});
        socket.broadcast.to(user.room).emit('message', { user: 'WorldChat', text: `${ user.name } has joined.`, time: moment().format('h:mm a') })

        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message, time: moment().format('h:mm a') });

        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', { user: 'WorldChat', text: `${ user.name } has left the chat.`, time: moment().format('h:mm a') });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        }
    });
});

const authRoutes = require('./routes/auth');
const mapRoutes = require('./routes/map');
const userRoutes = require('./routes/user');

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());

mongoose.connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true  })
    .then(() => console.log('DB connected'));

if (process.env.NODE_ENV === 'DEVELOPMENT') {
    app.use(cors({ origin: `${ process.env.CLIENT_URL }` }));
}

app.use('/api', authRoutes);
app.use('/api', mapRoutes);
app.use('/api', userRoutes);

const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server is running on port ${ port }`);
});