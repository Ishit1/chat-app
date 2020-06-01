const users = []

const addUser = ({id,username,room})=>{
    //clean the data
    username= username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //valiate the data
    if(!username || !room){
        return{
            error:'username and room are required'
        }
    }

    //dupliation
    const existingUSer= users.find((user)=>{
        return user.room === room && user.username===username
    })

    //validate username
    if(existingUSer){
        return{
            error:'username not avilable'
        }
    }

    //store user
    const user = {id,username,room}
    users.push(user)
    return{user}
}

const removeUser =(id)=>{
    const index=users.findIndex((user)=>{
        return user.id===id
    })

    if(index!==-1){
        return users.splice(index,1)[0]
    }
}

const getuser = (id)=>{
    return found=users.find((user)=>{
        return user.id===id
    })
}

const getUsersinRoom = (room)=>{
    room =room.trim().toLowerCase()
    return users.filter((user)=> user.room===room)
}


module.exports ={
    addUser,
    removeUser,
    getuser,
    getUsersinRoom
}