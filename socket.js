const socketIo = require('socket.io');

function initializeSocket(server) {
    return new Promise((resolve, reject) => {
        try {
            const io = socketIo(server, {
                cors: {
                    origin: '*',
                }
            });

            io.on("connection", (socket) => {
                console.log("New client connected", socket.id);

                socket.on("bid", (lotId) => {
                    console.log("Received bid event for lot:", lotId);
                    // Handle the bid logic here
                    // For example, you can broadcast the bid to other clients or update the database

                    // Emitting an event back to the client as an example
                    io.emit('bidReceived', {
                        lotId,
                        status: 'received'
                    });
                });

                // Handle disconnections
                socket.on("disconnect", () => {
                    console.log("Client disconnected");
                });
            });

            // Log when the server is initialized
            console.log("Socket.IO server initialized");

            resolve(io);
        } catch (error) {
            reject(`Failed to initialize Socket.IO server: ${error.message}`);
        }
    });
}

module.exports = {
    initializeSocket
};