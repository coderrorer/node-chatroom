var socket = io();
function processCommond(msg,socket){
    var command=msg.split(' ');
    switch(command[0]){
        case '/room': //切换房间
            if(command[1]=='') return false;
            $('#messages').html('');
            socket.emit('room',command[1]);
            break;
        case '/nickname': //换昵称
            if(command[1]=='') return false;
            socket.emit('nickname',command[1]);
            break;
        case '/help':  //显示提示信息
            socket.emit('help');
            break;
        default :  //提示没有该命令
            socket.emit('help');
    }
}
$(document).ready(function(e) {
    $(window).keydown(function(e) {
        if (e.keyCode == 13) {
            $('.button').trigger('click');
        }
    })
    $('.button').on('click', function () {
        var msg=$('#m').val();
        if(msg=='') return false;
        else if(msg.indexOf('/')==0) {
            processCommond(msg,socket);
        }
        else socket.emit('chat message', msg);
        $('#m').val('');
        return false;
    })
    socket.on('chat message',function(msg){
        $('#messages').append($('<li>').text(msg));
    })
    socket.on('sys message',function(msg){
        $('#messages').append($('<li class="sys">').text(msg));
    })
})

