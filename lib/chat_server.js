var socketio = require('socket.io')
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};



exports.listen = function(server){
	io = socketio.listen(server);
	io.set('log level', 1);
	io.sockets.on('connection', function(socket){
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed)
			joinRoom(socket, 'Lobby');
			handleMessageBroadcasting(socket, nickNames);
			handleNameChangeAttempts(socket, nickNames, namesUsed);
			handleRoomJoining(socket);
				socket.on('rooms', function(){
					socket.emit('rooms', io.sockets.manager.rooms)
				});
				handleClientDisconnection(socket, nickNames, namesUsed)
	});
}

function assignGuestName(socket, guestNumber, nickNames, namesUsed){
	var name = 'Guest' + guestNumber;
	nickNames[socket.id] = name;
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	namesUsed.push(name);
	return guestNumber + 1;
}

function updateChatterNames(socket){
	socket.emit('newNames', {names : namesUsed })
}

function joinRoom(socket, room){
	socket.join(room);
	currentRoom[socket.id] = room;
	socket.emit('joinResult', {room: room});
	socket.broadcast.to(room).emit('message', {text: nickNames[socket.id] + "has joined" + room + "."})
	socket.broadcast.to(room).emit('newNames', {names: namesUsed})
	var usersInRoom = io.sockets.clients(room)
		if (usersInRoom.length > 1){
			var usersInRoomSummary = 'Users currently here:' ;
			for(var index in usersInRoom){
				var userSocketId = usersInRoom[index].id;
				if (userSocketId != socket.id){
					if (index > 0){
						usersInRoomSummary += ', '
					}
					usersInRoomSummary += nickNames[userSocketId]
				}
			}
			usersInRoomSummary += '.'
			updateChatterNames(socket)
			socket.emit('message', {text: usersInRoomSummary})
			
		}
}

function handleNameChangeAttempts(socket, nickNames, namesUsed){
	socket.on('nameAttempt', function(name){
		console.log('name change event')
		if (name.indexOf('Guest') == 0) {
			socket.emit('nameResult', {
				success: false,
				message: 'Names cant begin with that'});
		} else {
			if (namesUsed.indexOf(name) == -1){
				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUsed.indexOf(previousName);
				namesUsed.push(name);
				nickNames[socket.id] = name;
				delete namesUsed[previousNameIndex]
				socket.emit('nameResult', {sucess:true, name:name});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: previousName + ' is now known as ' + name + '.'
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('newNames', {
					names: namesUsed
				});
				updateChatterNames(socket)
			} else {
				socket.emit('nameResult', { sucesss: false, message: "thats name is taken"
				});
			}
		}
	});

}

function handleMessageBroadcasting(socket){
	socket.on('message', function(message){
		socket.broadcast.to(message.room).emit('message', {
			text: nickNames[socket.id] + ': ' + message.text
		});
	});
}

function handleRoomJoining(socket){
	socket.on('join', function(room){
		socket.broadcast.to(room).emit('newNames', {names: namesUsed})
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom)
		
	});
}

function handleClientDisconnection(socket){
	
	socket.on('disconnect', function(){
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		delete namesUsed[nameIndex]
		socket.broadcast.emit('newNames', {names: namesUsed})
		delete nickNames[socket.id]
		
	});
}




















