const express = require( "express");
const http = require("http");
const cors = require ("cors");
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 5000;

var server = http.createServer(app);
var io = require("socket.io")(server);

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database: 'realtime',
});

connection.connect((err)=> console.log(err));

app.use(express.json());
app.use(cors());
var suser;

function setUser(user){
    suser = {};
    suser=user;
}
function getuser(){
    return suser;
}

io.on("connection",(socket)=>{
    socket.on("/connect",(userData)=>{

        console.log("User is conected this is the token : "+userData.fcm_token);
        if(userData){
            GetUser(userData);
            var user = getuser();
            if(!user){
                UpdateUser(userData);
            }else{
                AddUser(userData);
            }    
        }
        
    });
    socket.on("/message",(message,user)=>{
        if(user!==null){
                console.log("There are a message going to  : "+user.fcm_token);
                io.to(user.fcm_token).emit('/recieved',message);
            
        }
    });
    socket.on("/disconnect",(userData)=>{
        if(userData!==null){
            console.log("User disconected");
            DeleteUser(userData);
        }
    
    });
})

server.listen(port,()=>{
    console.log("server started to listen on port " +port);
});

function  GetUser(user){

    if(!user)
    console.log("Please provide a user");
    else
    connection.query("SELECT * FROM users where id= ?",[user.id],(err,rows,fields)=>{
        if(!err){
            console.log(rows);
            setUser(rows[0]);
        }
        else
            console.log(err);
    });

    
    
}
function AddUser(user) {
    if(!user)
        console.log("Please provide a user");
    else
    connection.query("INSERT INTO users(id,fullName,email,fcm_token) values (?,?,?,?) ",[user.id,user.fullName,user.email,user.fcm_token],(err,rows,fields)=>{
        if(!err)
            console.log(rows);
        else
            UpdateUser(user);
    });
}

function UpdateUser(user){
    if(!user)
    console.log("Please provide a user");
    else
    connection.query(`UPDATE users SET fullName=?, email=?,fcm_token=? WHERE id=?`,[user.fullName,user.email,user.fcm_token,user.id],(err,rows,fields)=>{
        if(!err)
            console.log(rows);
        else{
            console.log(err);
            AddUser(user);
        }
            
    });
}
function DeleteUser(user){
    if(!user)
        console.log("Please provide a user");
    else
    connection.query("DELETE FROM users where id = ?",[user.id],(err,rows,fields)=>{
        if(!err)
            console.log(rows);
        else
        console.log(err);
    });
}
