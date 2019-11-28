const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

myEmitter.on('event', function(led) {

    led.color({
        red: randomIntInc(0,255),
        blue: randomIntInc(0,255),
        green: randomIntInc(0,255)
    });

    led.on();

});

var five = require("johnny-five");
var board = new five.Board({
    port: "COM3"
});

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

board.on("ready", function () {

    // Initialize the RGB LED
    led = new five.Led.RGB({
        pins: { // pin numbers
            red: 6,
            green: 5,
            blue: 3
        }
    });

    led.color({
        red: randomIntInc(0,255),
        blue: randomIntInc(0,255),
        green: randomIntInc(0,255)
    });

    led.on();

})
