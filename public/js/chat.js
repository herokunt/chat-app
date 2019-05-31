const socket = io()

// DOM Elements
const $messageForm = document.getElementById('message-form')
const $formInput = document.getElementById('send-input')
const $formBtn = document.getElementById('send-btn')
const $sendLocationBtn = document.getElementById('send-location')
const $dummyLocationBtn = document.getElementById('dummy-location')
const $messages = document.getElementById('messages')
const $location = document.getElementById('location')

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

/*
  Below reads as: when this socket receives a 'message' event, execute this code
  We are using Mustache to correctly place the messages where we want them,
  and moment.js to format the timestamp in a human readable way.
*/

socket.on('message', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', location => {
  const html = Mustache.render(locationTemplate, {
    text: location.text,
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm a')
  })
  $location.insertAdjacentHTML('beforeend', html)
})

socket.on('broadcast', (broadcast) => {
  console.log(broadcast)
})


document.getElementById('message-form').addEventListener('submit', (e) => {
  e.preventDefault()

  // disable form immediately after sending message to prevent send duplicate by accident
  $formBtn.setAttribute('disabled', 'disabled')

  const msg = e.target.message.value
  socket.emit('sendMessage', msg, (err) => {
    // re-enabling the form
    $formBtn.removeAttribute('disabled')
    $formInput.value = ''
    $formInput.focus()

    if(err){
      return console.log(err)
    }

    console.log('message delivered')
  })
})

$dummyLocationBtn.addEventListener('click', () => {
  $dummyLocationBtn.setAttribute('disabeld', 'disabled')
  $dummyLocationBtn.classList.add('is-loading')

  setTimeout(() => {
    const dummyURL = 'https://www.openstreetmap.org/#map=4/100/100'
    socket.emit('fakeLocation', dummyURL)
    $dummyLocationBtn.classList.remove('is-loading')
    $dummyLocationBtn.removeAttribute('disabled')
  }, 2000)
})

// this comes from QS above
socket.emit('join', { username, room }, (error) => {
  if(error){
    alert(error)
    location.href = '/'
  }
})

/* NOT IN USE
$sendLocationBtn.addEventListener('click', e => {
  if (!navigator.geolocation) { // if this does not exist when page loads, it means the client browser does not support geolocation
    return alert('Geolocation is not supported by your browser')
  }

  $sendLocationBtn.setAttribute('disabled', 'disabled')

  // this fn() does not support promise at the moment so we use a traditional callback patern
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit('sendLocation', {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    })
  }, (error)  => {
    console.log(error)
    socket.emit('sendLocationError', error.message)
  })

  $sendLocationBtn.removeAttribute('disabled')
})*/
