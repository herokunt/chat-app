const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom  } = require('./utils/users')

const app = express();
const server = http.createServer(app) // this is done behind the scenes by default, but we need to store this in the 'server' variable.
const io = socketio(server) // the reason why we called http.createServer(app) above is to run this specific command

const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res, next) => {
  res.send('index.html', {
    title: 'Chatroom',
    body: 'Welcome to the chatroom'
  })
})

app.use((req, res, next) => {
  res.status(404).render('404', {title: 'Page Not Found'})
});

io.on('connection', (socket) => {
  console.log('New WebSocket connection')

  socket.on('join', (options, callback) => {
    // We are using the spread operator to pass username and room as parameters to addUser
    const { error, user } = addUser({ id: socket.id, ...options })

    if (error){
      return callback(error)
    }

    // Introducing the concept of rooms or chat rooms, but using the 'join' method provided by socketio
    socket.join(user.room)

    socket.emit('message', generateMessage(`Welcome to ${user.room}!`))
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`)) // emits to all except current (new) socket.

    callback()
  })

  /*
  send message to a particular socket, all sockets, and all sockets except for the current one
    socket.emit, io.emit, socket.broadcast.emit

  send message to all sockets in a particular room, and to all sockets in a room except the current one
    io.to(room).emit, socket.broadcast.to(room).emit
  */

  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter()
    if (filter.isProfane(msg)){
      return callback('Profanity is not allowed')
    }

    io.emit('message', generateMessage(msg))
    callback()
  })

  socket.on('fakeLocation', url => {
    socket.emit('locationMessage', generateLocationMessage(url))
  })

  // Note this 'disconnect' event happens WITHIN io.on('connection')
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if(user){
      io.to(user.room).emit('message', generateMessage(`${user.username} has left.`))
    }

  })
})

server.listen(PORT, () => console.log(('server running on port ' + PORT)))

/* Commenting this one out because it does not work in Waterfox
socket.on('sendLocationError', (err) => {
  io.emit('message', err)
})

socket.on('sendLocation', (coordinates) => {
  io.emit('message', `https://google.com/maps?q=${coordinates.lat}, ${coordinates.lon}`)
  io.emit('message', `https://www.openstreetmap.org/#map=11/${coordinates.lat}/${coordinates.lon}`)
})
*/
