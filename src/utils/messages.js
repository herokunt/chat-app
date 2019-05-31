const generateMessage = (text) => {
  return {
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocationMessage = (url) => {
  return {
    text: 'My current location',
    createdAt: new Date().getTime(),
    url
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}
