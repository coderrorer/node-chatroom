'use strict'
let clients={}; //根据socket.id保存每个用户的名字
let clientNo=0; //保存用户数量
let Rooms=['Ground'];  //房间名
let currentRoom={}; //每个用户所在的房间名
let ChatIO = function(io){

    io.on('connection', function(socket){
        _dealConnection(io,socket);
        _dealLeave(io,socket);
        _dealJoinRoom(io,socket);
        _dealNickName(io,socket);
        _dealMessage(io,socket);
        _dealHelp(io,socket);

    });

}
        function _dealConnection(io,socket){
            clients[socket.id]=clientNo+'号游客'
            currentRoom[socket.id]=0;
            clientNo++;
            let info={
                client:clients[socket.id],
                room:Rooms[currentRoom[socket.id]]
            };
            socket.join(info.room);
            io.to(info.room).emit('sys message',
                '欢迎 '+ info.client +' 进入'+info.room);
            socket.emit('sys message',
                '输入"/room 房间名称"即可进入或新建该房间; 输入"/nickname 昵称"即可更改本人昵称; 输入"/help"查看帮助')
        }
        function _dealLeave(io,socket){
            socket.on('disconnect', function(){
                let info={
                    client:clients[socket.id],
                    room:Rooms[currentRoom[socket.id]]
                }
                delete clients[socket.id];
                delete currentRoom[socket.id];
                io.to(info.room).emit('sys message',
                    info.client +' 离开了聊天室');
                socket.leave(info.room);
            });
        }
        function _dealMessage(io,socket){
            socket.on('chat message', function(msg){
                let info={
                    client:clients[socket.id],
                    room:Rooms[currentRoom[socket.id]]
                };
                io.to(info.room).emit('chat message',
                    info.client+' : '+ msg);
            });
        }
        function _dealJoinRoom(io,socket){
            socket.on('room',function(room){
                let roomNo=-1;
                for(let i=0;i<Rooms.length;i++){
                    if(Rooms[i]==room) roomNo=i;
                }
                if(roomNo==-1){
                    roomNo=Rooms.length;
                    Rooms.push(room);
                }
                let info={
                    client:clients[socket.id],
                    oldRoom:Rooms[currentRoom[socket.id]],
                    newRoom:Rooms[roomNo]
                }
                currentRoom[socket.id]=roomNo;
                io.to(info.oldRoom).emit('sys message',
                    info.client+' 离开了本聊天室')
                socket.leave(info.oldRoom);
                socket.join(info.newRoom);
                io.to(info.newRoom).emit('sys message',
                    '欢迎 '+ info.client +' 进入'+info.newRoom)
            })
        }
        function _dealNickName(io,socket){
            socket.on('nickname',function(name){
                let nameExist=false;
                for(let item in clients){
                    if(clients[item]==name) {nameExist=true;break;}
                }
                if(nameExist){
                    socket.emit('sys message','该用户名已被占用')
                }else {
                    let oldName=clients[socket.id];
                    clients[socket.id]=name;
                    io.to(Rooms[currentRoom[socket.id]]).
                        emit('sys message',
                        oldName+'已更改名字为'+name);
                }
            })
        }
        function _dealHelp(io,socket){
            socket.on('help',function(){
                socket.emit('sys message',
                    '输入"/room 房间名称"即可进入或新建该房间; 输入"/nickname 昵称"即可更改本人昵称; 输入"/help"查看帮助')
            })
        }
module.exports=ChatIO;