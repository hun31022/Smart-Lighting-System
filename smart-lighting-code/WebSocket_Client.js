const Light_ID = 1;
const Main_Controller_IP = "202.31.200.143";
const Main_Controller_Port = "3000"

var Address = "http://"+Main_Controller_IP+":"+Main_Controller_Port;

var SerialPort = require("serialport");

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

const serial = new SerialPort("COM28", {
    baudrate: 115200,
    parser: SerialPort.parsers.readline("\n"),

});

serial.on('open', () => {

    console.log("Ready To Receive Data");

    setTimeout(function() {
        //client.js
        var io = require('socket.io-client');
        var socket = io.connect(Address, {
            reconnect: true
        });

        // Add a connect listener
        socket.on('test',function(data){

            if( Light_ID == data.cid )
            {
                var ColorQueryStr = "R"+parseInt(data.r)+" G"+parseInt(data.g)+" B"+parseInt(data.b)+"\n";

                console.log(ColorQueryStr);

                const buf5 = new Buffer(ColorQueryStr, 'ascii');
                serial.write(buf5);

            }

        });
    }, 3000);

});
