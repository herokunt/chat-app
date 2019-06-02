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

// Query the search options from url
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  // New message element
  const $newMsg = $messages.lastElementChild

  // Height of the new message
  const newMsgStyles = getComputedStyle($newMsg) // getComputedStyle() is provided by the browser
  const newMsgMargin = parseInt(newMsgStyles.marginBottom) // convert to number since the value is a string ("16px")
  const newMsgHeight = $newMsg.offsetHeight + newMsgMargin // offsetHeight does not include margins, which is why we calculated them right before

  // Visible Height
  const visibleHeight = $messages.offsetHeight

  // Container Height
  const containerHeight = $messages.scrollHeight // total height we can scroll through, so total height of the $messages element

  // Distance scrolled from top
  const scrollOffset = $messages.scrollTop + visibleHeight // We add the visibleHeight because scrollTop gives us the distance scrolled based on the top of the viewport

  // Calculating if we already are at the bottom
  if (containerHeight - newMsgHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight // Setting the scroll bar all the way to the bottom.

    /*
      A pretty cool alternative: $messages.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
    */
  }

  /*
    Note on the conditional logic, if we are scrolling upwards to see previous messages then the scrollOffset will be a smaller number the higher we go.
    That is why if the total height (containerHeight) - the height of the new message is less than that number, then we know we already are at the bottom.
    This way we won't autoscroll on every incoming message as that would be a bad user experience.
  */
}

/*
  Below reads as: when this socket receives a 'message' event, execute this code
  We are using Mustache to correctly place the messages where we want them,
  and moment.js to format the timestamp in a human readable way.
*/

socket.on('message', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', location => {
  console.log(location)
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    text: location.text,
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm a')
  })
  $location.insertAdjacentHTML('beforeend', html)
  autoscroll()
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
  $dummyLocationBtn.classList.add('is-loading') // Bulma style for loading buttons

  // Setting artificial delay
  setTimeout(() => {
    const dummyURL = 'https://www.openstreetmap.org/#map=4/100/100'
    socket.emit('fakeLocation', dummyURL)
    $dummyLocationBtn.classList.remove('is-loading')
    $dummyLocationBtn.removeAttribute('disabled')
  }, 2000)
})

// username and room come from QS above
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
