const users = []

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // If client did not provide username or room return error
  if (!username || !room) {
    return { error: 'Username and room are required.' }
  }

  // Check for existing user
  const existingUser = users.find(user => user.room === room && user.username === username)

  // If user exists return error
  if (existingUser) {
    return { error: 'Username is already in use.' }
  }

  // Create user object and push into array
  const user = { id, username, room }
  users.push(user)

  // If all went well we return user object, otherwise we return an object with an error message.
  return { user }
}

const removeUser = id => {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

// Return user object that matches the id provided
const getUser = id => users.find(user => {
  return user.id === id
})

const getUsersInRoom = room => {
  // Clean room input a bit
  room = room.trim().toLowerCase()

  // Return an array with all users, or empty array
  return users.filter(user => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
