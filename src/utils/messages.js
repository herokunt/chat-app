const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocationMessage = (username, url) => {
  return {
    username,
    text: 'My current location',
    createdAt: new Date().getTime(),
    url
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}
