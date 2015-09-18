function getDateTime() {
	//get the time and date, will be added to
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    //correct the numbers to two digits
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var time = hour+':'+minute+':'+second;   
     return time;
}

var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var portName = process.argv[2],
portConfig = {
	baudRate: 9600,
	parser: SerialPort.parsers.readline("\n")
};

var sp;

sp = new SerialPort.SerialPort(portName, portConfig);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    sp.write(msg + "\n");
  });
});

http.listen(3000, function(){
	//listen on localhost port 3000
  console.log('listening on *:3000');
});

sp.on("open", function () {
  console.log('open');

//creat an array to save the latest temperature of each sendor
  var num = 4;
  var Temps = [];
  for(var i = 0; i < num; i++){
    Temps[i] = 0;
  }
  var avg = 0;
  
  sp.on('data', function(data) {
    var dat = data.split(":");
    var index = parseInt(dat[0]);

//save the temperature to the right position
    for(var j = 0; j < num; j++){
      if(index == j) {Temps[j] = parseFloat(dat[1]); break;}
    }

//calculate the average
    var count = num;
    for(var k = 0; k < num; k++){
      avg = avg + Temps[k];
      if(Temps[k] == 0) count = count - 1;   
    }

    if(count > 0) avg = avg / count;
    var avg1 = avg.toPrecision(5) + '';//only save 5 digits after the decimal point
 
    console.log('data received: ' + dat[0]);// print the received temperature in the console
    io.emit("chat message", "Current room average temperature: " + avg1 + "°C at " + getDateTime());//add date and time to the message
    avg = 0;
  });
});

