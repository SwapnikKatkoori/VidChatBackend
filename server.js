const server = require('http').createServer((req,res)=>{
	res.write("Socket server started up");
	res.end();
});
const io = require('socket.io')(server);
let socket_rooms = new Map()
let socket_got_stream = new Map

io.on('connection', function (socket) {
	console.log("sockets are connected");
	socket.emit('initial_message', "working")

	socket.on('room_name', (room_name)=>{
		console.log("room name:", room_name)
		socket.join(room_name)
	
		if (!socket_rooms.has(socket)){
			socket_rooms.set(socket, room_name)
		}
		let numClients;
		io.of('/').in(room_name).clients(function(error,clients){
        	numClients=clients.length;
        	console.log(numClients)
        	if (numClients > 1){
        		io.in(room_name).emit('clients_in_room', "clients are both in room")
        	}

    	});
    	
	})

	socket.on("got_stream", (mssg)=>{
		let room = socket_rooms.get(socket);
		if (socket_got_stream.has(room)){
			let streams_available = socket_got_stream.get(room);
			streams_available.push(socket);
		}else{
			let streams_available = [socket];
			socket_got_stream.set(room, streams_available);
		}

		if (socket_got_stream.get(room).length > 1){
			io.in(room).emit('both_streams_available', "Both streams are now available!" );
		}
	})

	socket.on('message',(mssg)=>{
		let room = socket_rooms.get(socket)
		//Emits the mesasge to all clients on the server 
		socket.to(room).emit('recieve_message', mssg)
	});
	socket.on('disconnect', (client)=>{
		socket.leave(socket_rooms.get(socket));
		socket_rooms.delete(socket);
	})
})
	


// server.listen(8000,(err)=>{
// 	console.log("server started")
// })
server.listen(process.env.PORT || 5000,(err)=>{
	console.log("server started")
})

