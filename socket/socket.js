let currentUsers = 0;
let connectedUsers = [];
let updatedConnectedUsers;

module.exports = function(io) {
    io.on('connection', function(socket) {
        let user = socket.request.user;
        let userSocket = { socketId: socket.id, userInfo: user };
        console.log('user ' + user.username + ' connected');

        connectedUsers.push({ socketId: socket.id, userInfo: user});
        
        currentUsers++;
        io.emit('user', {
            user: userSocket,
            users: connectedUsers,
            currentUsers,
            connected: true
        });

        socket.on('disconnect', function() {
            console.log(user.username + ' disconnected');
            currentUsers--;
            updatedConnectedUsers = connectedUsers.filter(function(connectedUser) {
                return user.username != connectedUser.userInfo.username;
            })
            connectedUsers = updatedConnectedUsers.slice();
            console.log('Connected users:');
            connectedUsers.forEach(function(user) {
                console.log(user.userInfo.username);
            });
            io.emit('user', {
                user: userSocket,
                users: connectedUsers,
                currentUsers,
                connected: false
            });
        });

        socket.on('typing', function(data) {
            io.to(data.currentChatUser.socketId).emit('typing', {
                userSocket,
                info: user.name + ' ' + user.lastname + ' is typing...',
                message: data.message
            });
        });

        socket.on('send-message', function(data) {
            io.to(socket.id).to(data.currentChatUser.socketId).emit('message', {
                userSocket, currentChatUser: data.currentChatUser, message: data.message
            });
        });
    });
};