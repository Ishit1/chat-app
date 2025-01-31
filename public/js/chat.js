const socket=io()

const $messageForm = document.querySelector('#message-form')
const $messageFormINput= $messageForm.querySelector('input')
const $messageFormButton =$messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $locationButton = $sendLocation.querySelector('button')
const $messages = document.querySelector('#messages')

const messagTemaplate = document.querySelector('#message-template').innerHTML
const locationTeamplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const {username,room}= Qs.parse(location.search,{ ignoreQueryPrefix:true })
const autoscroll = ()=>{
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
 

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messagTemaplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')

    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage',(link)=>{
    console.log(link)
    const html = Mustache.render(locationTeamplate,{
        username: link.username,
        url: link.url,
        createdAt: moment(link.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html= Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.querySelector('#message-form').addEventListener('submit', (e)=>{
    e.preventDefault()  

    $messageFormButton.setAttribute('disabled','disabled') 
    const message = e.target.elements.message.value

    socket.emit('sendmessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormINput.value =''
        $messageFormINput.focus()

        if(error){
            return console.log(error)
        }
        console.log('The message was delievered')
    })

})

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocation.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendlocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
            $sendLocation.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
