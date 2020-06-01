const express=require('express')
const http= require('http')
const path=require('path')
const socketio=require('socket.io')
const Filter= require('bad-words')
const {generateMessage, generateLocationMessage}= require('./utils/message')
const {addUser,removeUser,getuser, getUsersinRoom }=require('./utils/users')


const app=express()
const server=http.createServer(app)
const io= socketio(server)

const port= process.env.PORT || 3000
const publicDirectorypath=path.join(__dirname,'../public')


app.use(express.static(publicDirectorypath))

io.on('connection',(socket)=>{
    console.log('new WebSocket connection')


    socket.on('join',({username,room},callback)=>{
        const {error,user}= addUser({ id:socket.id,username,room })

        if(error){
            return callback(error)
        }

        socket.join(user.room) 
        
        socket.emit('message',generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('',`${user.username} has joined!`))

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersinRoom(user.room)
        })

        callback()
    })


    socket.on('sendmessage',(message,callback)=>{
        const filter= new Filter()
        const user = getuser(socket.id)
        if(filter.isProfane(message)){
            return callback('gandi bhasha ka upyog na kare')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendlocation',(posti,callback)=>{
        const user = getuser(socket.id)

        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${posti.latitude},${posti.longitude}`))
        callback()
    })


    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('',`${user.username} has left the room`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }
    })

})


server.listen(port,()=>{
    console.log('server is up on port '+port)
})

