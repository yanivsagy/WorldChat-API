const users = [];

exports.addUser = ({ id, name, room }) => {
    name = name.trim();
    room = room.trim().toLowerCase();

    const existingUser = users.find(user => {
        return user.name === name && user.room === room;
    });

    if (existingUser) {
        return { error: 'Username is taken.' };
    }

    const user = { id, name, room };
    users.push(user);

    return { user };
};

exports.removeUser = (id) => {
    const index = users.findIndex(user => {
        return user.id === id;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

exports.getUser = (id) => {
    return users.find(user => {
        return user.id === id;
    });
};

exports.getUsersInRoom = (room) => {
    return users.filter(user => {
        return user.room === room;
    })
};