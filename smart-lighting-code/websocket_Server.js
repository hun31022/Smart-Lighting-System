//server.js (2017_02_22 By JAEJUn)
// Webserver Module
var util = require('util');
var bodyParser = require('body-parser');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var app = express();
var request = require('ajax-request');
const BASE_URL = "http://202.31.200.143:3333/"; ///////////////////DELAB
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.text());

var server = require('http').Server(app);

// Websocket Module.
var io = require('socket.io')(server);
var url = require('url');
//var WebSocket = require('ws').Server;
//var wss = new WebSocket({ server });

var WebSocket = require('ws');
var wss = new WebSocket.Server({ port:8080 });///////////////////DELAB
io.sockets.on('connection', function (socket) {
    socket.on(EVENT_NAME, function(data){

    });
});

wss.broadcast = function(data) {
    wss.clients.forEach(function each(client) {
        if(client.readyState == WebSocket.OPEN) {
            var BroadData = JSON.stringify(data);
            client.send(BroadData);
            console.log('Braodcasting : ' + data);
        }
    });
}; //

// mysql Module
var mysql = require('mysql');//////////////////////////////////////DELAB 
var pool = mysql.createPool({
    host    :'202.31.200.143',
    port : 3306,
    user : 'root',
    password : 'root',
    database:'smart_lighting',
    connectionLimit:0,
    waitForConnections:false,
    multipleStatements:true,
    acquireTimeout:60*60*1000
});

var config = {
    sid : 'SmartLighting',
  secret: 'smartlighting2017',
};

// Server Configuration
const PORT = 80;
const EVENT_NAME = 'test';

var notify='';
var myflag=1;

/***************************************************************************************/
/*                                      SERVER RUN                                     */
/***************************************************************************************/

var nools = require("nools"); //rule engine nools!!!!!DELAB


var Clock = function(){//clock define! //시간관련 RULE입니다. 룰을 만들기 위한 CLOCK 객체
    this.name='clock';
    this.date = new Date();

    this.getHours = function() {return this.date.getHours();}
    this.getMinutes = function() {return this.date.getMinutes();}
    this.getSeconds=function(){return this.date.getSeconds();}
    this.getDay=function(){return this.date.getDay();}
    this.isSeconds=function(sec){return this.getSeconds() == sec;}
    this.isMinute=function(min){return this.getMinutes() == min;}
    this.isHour=function(hour){return this.getHours() == hour;}
    this.isWeekdays=function(){return this.date.getDay()>0&&this.date.getDay()<6;}
    this.isWeekly=function(d){return this.date.getDay()==d;}
    this.hoursIsBetween = function(a, b) {return this.date.getHours() >= a && this.date.getHours() <=b;}
    this.setRepeat=function(repeat,d){
        if(repeat=='Daily'){//굳이 할 필요가 있을까....???
            return true;
        }else if(repeat=='Weekdays'){
            return this.isWeekdays();
        }else if(repeat=='Weekends'){
            return !this.isWeekdays();
        }else if(repeat=='Weekly'){
            return this.isWeekly(d);
        }else if(repeat=='None'){
            return true;
        }else{
            console.log('예외');
            return false;
        } 
    }
    this.timeComp=function(dat){
        dat=new Date(dat);
        return this.isHour(dat.getHours())&&this.isMinute(dat.getMinutes())&&this.isSeconds(dat.getSeconds());
    }

    this.durationCheck=function(dat){
        dat=new Date(dat);
        if(this.date.getTime()>=dat.getTime()){//정해진 시간이 되었다!=>지금이 정해진 시간보다 더 크다!!시간이 지났다...
            return false;
        }
        else{
            return true;
        }
    }

    this.step = function(){
        this.date = new Date();
        // this.isMorning = this.hoursIsBetween(6, 11);
        // this.isNoon = this.hoursIsBetween(12, 14);
        // this.isAfternoon = this.hoursIsBetween(15, 17);
        // this.isEvening = this.hoursIsBetween(18, 23);
        // this.isNight = this.hoursIsBetween(0,5);
        return this;
    }
}

var myfacts=[];
const s=1000;
var clockinterval=[];
var interval;
var clock=new Clock();
var noolsData={ 
        define: [],
        rules: [],
        scope: [],
        loaded: [],
        file: '' 
    };
var flow=nools.compile(noolsData,{name : 's', define: {Clock: Clock}});
var Message;
var sessionR=flow.getSession();
loadRules();

function TUQ_test(name,property){
    var Message=flow.getDefined(name);
    var randomData=Math.floor(Math.random()*100);

    var s=sessionR.getFacts();
    for(var i=0;i<s.length;i++){
        if(s[i].name==name){sessionR.retract(s[i]);}
    }
    console.log('>>>>>>>>>>>>>>>>>'+name+' : '+randomData);
    var me=new Message();
    if(property==1)me.p1=randomData;
    if(property==2)me.p2=randomData;
    if(property==3)me.p3=randomData;
     //session.modify(new Message(randomData)).match();
    sessionR.assert(me);
    sessionR.match();
}

function Thing_Action(ThenDevice,ThenValue){//필요없어서 미완..
    console.log(ThenDevice);
    console.log(ThenValue);
}

function updateFact(data){
  var s=sessionR.getFacts();
  var name='t'+data.ThingID;
  for(var i=0;i<s.length;i++){
      if(s[i].name==name)sessionR.retract(s[i]);
  }
   var Message=flow.getDefined('t'+data.ThingID);
   sessionR.assert(new Message(data));
   sessionR.match();
}

function updateWFact(data){
  var s=sessionR.getFacts();
  var name='weather';
  for(var i=0;i<s.length;i++){
    console.log(s[i]);
      if(s[i].name==name){sessionR.retract(s[i]);}
  }
   var Message=flow.getDefined('weather');
   sessionR.assert(new Message(data));
   sessionR.match();
}

function sendLight(data,ThenDevice,ThenBright,ThenTemperature,R,G,B){// light Send[DELAB] , RULE의 ACTION 부분
    console.log("***");
        var LTQ = {
            Format : "LTQ",
            Data : {
                RoomID : data.room_id,
                LightID : data.light_id,
                MACAddr : data.device_mac,
                Time : new Date(),
                Control : {
                    Bright : ThenBright,
                    Temp : ThenTemperature,
                    Color : {
                        Red : R,
                        Green : G,
                        Blue : B
                    },
                    BLE : {
                        Status : "OFF",
                        Connect : "None"
                    },
                    Sensor : data.sensor_mode,
                    Sensor_Related : data.sensor_related,
                    VoiceControl : data.voice_control,
                    SmartControl : data.smart_control
                }
            }
        };
        console.log(LTQ);

        pool.getConnection(function(err,connection){
            var myQuery="Update light_table set brightness = %d, temperature='%s', red= %d,green=%d,blue=%d where light_id='%s';";
            var Query_Str=util.format(myQuery,LTQ.Data.Control.Bright,LTQ.Data.Control.Temp,R,G,B,ThenDevice.substring(1));
            var query=connection.query(Query_Str,function(err,rows){
                if(err){
                        res.json('{Error : "Database Error"}');
                        connection.release();
                        throw err;
                }
               wss.broadcast(LTQ);
               connection.release();
            });
        });
    
}

function Light_Action(ThenDevice,ThenBright,ThenTemperature,ThenRGB){//DEALB LIght ACTION
    console.log("LTQ send");
    console.log(ThenBright,ThenTemperature,ThenRGB);
    var sttr=ThenRGB.split(',');
    var strR=sttr[0];
    console.log(">>>"+strR);
    var G=sttr[1];
    var strB=sttr[2];
    console.log("중간점검",strR,G,strB);
    var R=strR.substring(4);
    var BB=strB.split(')');
    var B=BB[0];
    console.log(R,G,B);
    var data;
    console.log(ThenDevice);
    pool.getConnection(function(err,connection){
        console.log('___________');
        var myquery="select * from light_table where light_id=%d";
        console.log(ThenDevice.substring(1));
        var Query_Str=util.format(myquery,parseInt(ThenDevice.substring(1)));
        console.log(Query_Str);
        var query=connection.query(Query_Str,function(err,rows){
            if(err){
                    connection.release();
                    throw err;
            }
            data=rows[0];
            console.log(data);
            console.log("__________");
            sendLight(rows[0],ThenDevice,ThenBright,ThenTemperature,R,G,B); //SEND LIGHT 부분
           //console.log(data);
           connection.release();
        });
    });
}

function notIn(name,length){//
    for(var i=0;i<length;i++)
        if(name==myfacts[i].name)
            return false;
    return true;
}
///////////////@@여기서부터 [DELAB] @@@@@@@@@@@@@@@@///////////////////
function update(){ //시간 룰 관련 동기화 
    sessionR.modify(clock.step());
    sessionR.match();
    //console.log(clock.getSeconds()); 
}

function tjsonWrite(tId){// Define 된 룰을 JSON파일로 저장
    console.log("뀨");
    var fs=require('fs');

    var d={ name: 't'+tId+'',
       properties: '({name : \'t'+tId+'\',     p1 : \'\',p2 : \'\',p3 : \'\',     text2 : \'\',constructor : function(message){         this.p1=message.ThingData.Part1; this.p2=message.ThingData.Part2;  this.p1=message.ThingData.Part1;}, })' };

    noolsData.define.push(d);
    fs.writeFile("./define.json",JSON.stringify(noolsData.define));

    nools.deleteFlows();
    flow = nools.compile(noolsData,{name:"test", define: {Clock: Clock}, scope: {Thing_Action: Thing_Action, Light_Action: Light_Action, all_light_off: all_light_off, systemNotify: systemNotify}});
    sessionR=flow.getSession();
    sessionR.assert(clock);
    
    //session에 원래 있던 값을 여기서 넣어줄거야.. 그리고 만약에 지금 넣을 조건문에 새로운 device가 있으면, 이 친구를 Define 시켜 줘야해!!
    var length=myfacts.length;
    for(var j=0;j<length;j++)sessionR.assert(myfacts[j]);
    sessionR.on('retract',function(facts){//session의 fact가 제거될 때, myfacts의 값도 일단 제거...
        if(facts.name!='clock')myfacts.splice(myfacts.indexOf(facts),1);
    })
    sessionR.on('assert',function(facts){//session의 fact가 추가될 때, myfacts의 값도 일단 추가...
        if(facts.name!='clock')myfacts.push(facts);
    })
    sessionR.match();//rule 걸려라!
    console.log("휴");
}


function loadRules(){//서버 부팅 했을 때, 바로 rule 동작할 수 있도록!
    console.log("____");
    var fs=require("fs");
    var contents=fs.readFileSync("./define.json");
    contents=JSON.parse(contents);
    noolsData.define=contents;
    flow = nools.compile(noolsData,{name:"test", define: {Clock: Clock}, scope: {Thing_Action: Thing_Action, Light_Action: Light_Action, all_light_off: all_light_off, systemNotify: systemNotify}});
    //tjsonWrite();

    sessionR=flow.getSession();
    sessionR.assert(clock);
    sessionR.match();
    interval=setInterval(update,1000,sessionR);
    pool.getConnection(function(err,connection){
        var myQuery = 'select * from rule_table';
        var query=connection.query(myQuery,function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            for(var i=0;i<rows.length;i++){
                var rule_details=JSON.parse(rows[i].rule_details);
                if(rule_details.if.length!=0&&rule_details.then.length!=0)
                    makeNools(rule_details.if,rule_details.then,rows[i].rule_name);
            }            
            connection.release();
        });
    });
    //(JSON.parse(req.body.if),JSON.parse(req.body.then),req.body.rulename);
}

app.post('/API/all_lights',function(req,res){
    console.log(req.body);
    if(req.body.check=='true'){
    	all_lights(req.body.roomid.substring(6),1);
    }
   	else{ 
   		all_lights(req.body.roomid.substring(6),0);
   	}
    res.json('{Success : ok}');
});

function all_light_off(){ // all light off[DELAB]
    var data;
    pool.getConnection(function(err,connection){
        var myquery="select * from light_table"
        var Query_Str=util.format(myquery);
        var query=connection.query(Query_Str,function(err,rows){
            if(err){
                    connection.release();
                    throw err;
            }
           data=rows;
           connection.release();
        });
        
    });
    pool.getConnection(function(err,connection){
        var query=connection.query('update light_table set brightness=0',function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            connection.release();
        });
    });
    if(data!=null){
        for(var i=0;i<data.length;i++)
        {
            var LTQ = {
                Format : "LTQ",
                Data : {
                    RoomID : data.room_id,
                    LightID : data.light_id,
                    MACAddr : data.device_mac,
                    Time : new Date(),
                    Control : {
                        Bright : 0,
                        Temp : data.temperature,
                        Color : {
                            Red : 0,
                            Green : 0,
                            Blue : 0
                        },
                        BLE : {
                            Status : "OFF",
                            Connect : "None"
                        },
                        Sensor : data.sensor_mode,
                        Sensor_Related : data.sensor_related,
                        VoiceControl : data.voice_control,
                        SmartControl : data.smart_control
                    }
                }
            };
            wss.broadcast(LTQ);
        }
    }
}

function all_lights(roomid, set){//all light [DELAB]
	console.log(roomid);
    pool.getConnection(function(err,connection){
        var query=connection.query('update light_table set brightness='+set+' where room_id='+roomid,function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            connection.release();
        });
    });

    pool.getConnection(function(err,connection){
        var myquery="select * from light_table where room_id="+roomid;
        var Query_Str=util.format(myquery);
        var query=connection.query(Query_Str,function(err,rows){
            if(err){
                    connection.release();
                    throw err;
            }
           var data=rows;

           for(var i=0;i<data.length;i++)
	       {
	            if(set==0){
                    var LTQ = {
        	                Format : "LTQ",
        	                Data : {
        	                    RoomID : data[i].room_id,
        	                    LightID : data[i].light_id,
        	                    MACAddr : data[i].device_mac,
        	                    Time : new Date(),
        	                    Control : {
        	                        Bright : set,
        	                        Temp : data[i].temperature,
        	                        Color : {
        	                            Red : 0,
        	                            Green : 0,
        	                            Blue : 0
        	                        },
        	                        BLE : {
        	                            Status : "OFF",
        	                            Connect : "None"
        	                        },
        	                        Sensor : data[i].sensor_mode,
        	                        Sensor_Related : data[i].sensor_related,
        	                        VoiceControl : data[i].voice_control,
        	                        SmartControl : data[i].smart_control
        	                    }
        	                }
                        }
                        console.log(LTQ);
                        wss.broadcast(LTQ);
                    }
                    else{
                        var LTQ = {
                            Format : "LTQ",
                            Data : {
                                RoomID : data[i].room_id,
                                LightID : data[i].light_id,
                                MACAddr : data[i].device_mac,
                                Time : new Date(),
                                Control : {
                                    Bright : set,
                                    Temp : data[i].temperature,
                                    Color : {
                                        Red : 255,
                                        Green : 255,
                                        Blue : 255
                                    },
                                    BLE : {
                                        Status : "OFF",
                                        Connect : "None"
                                    },
                                    Sensor : data[i].sensor_mode,
                                    Sensor_Related : data[i].sensor_related,
                                    VoiceControl : data[i].voice_control,
                                    SmartControl : data[i].smart_control
                                }
                            }
                        }
                        console.log(LTQ);
                        wss.broadcast(LTQ);
                    }
	            }
	          
           connection.release();
        });
        
    });    
}

function systemNotify(d){// system noti [DELAB]
    notify=notify+d+'at '+new Date()+'\n';
    io.sockets.emit('toAllClient',notify);
}

function makeNools(ifAry,thenAry,rulename){// @@@@@@@@@@@@@@ 룰 만들기  @@@@@@@@@@@@@@@@@@@@@@@@@@
    console.log(thenAry);
    //var str='modify('+ifAry[0][1].value+',function(facts){facts.p1='+thenAry[0][3].value+';}); emit("myevent"); nnn("asda")';
    var str='';
    for(var i=0;i<thenAry.length;i++){
        var all=thenAry[i].all_light_off;
        var noti=thenAry[i].systemNoti;
        if(all==0&&noti==0){
            var flag=thenAry[i].device.substring(0, 1);
            if(flag=='l'){
                //str=str+'Light_Action("'+thenAry[i].device+'",'+thenAry[i].bright+',"'+thenAry[i].temperature+'","'+thenAry[i].color0+'"); modify(m'+thenAry[i].device+',function(facts){facts.p1='+thenAry[i].bright+';facts.p2='+thenAry[i].temperature+'});';
                str=str+'Light_Action("'+thenAry[i].device+'",'+thenAry[i].bright+',"'+thenAry[i].temperature+'","'+thenAry[i].color0+'");';    
            }
            else if(flag=='t'){
                str=str+'Light_Action("'+thenAry[i].device+'",'+thenAry[i].bright+',"'+thenAry[i].temperature+'","'+thenAry[i].color0+'"); modify(m'+thenAry[i].device+',function(facts){facts.p1='+thenAry[i].bright+';facts.p2='+thenAry[i].temperature+';});';    
            }
        }
        else if(all==1){
            str=str+'all_light_off();';    
        }
        else if(noti==1){
            str=str+'systemNotify("System Notify : weather_today 맑음 ");';
            // for(var j=0;j<ifAry.length;j++){
            //  if(Object.keys(ifAry[i]).length>3)str=str+'systemNotify(ifAry[i].);';
            //  else str=str+'systemNotify(ifAry[i]);';
            // }
        }
    }
    console.log(str);
    var rule={
        name:rulename,
        options:{},
        constraints: [],
        action: str 
    };
    
    //conditions rule json에 넣기
    for(var i=0;i<ifAry.length;i++){
        if(Object.keys(ifAry[i]).length>3){
            if(ifAry[i].device=='weather')rule.constraints.push([ifAry[i].device,'m'+ifAry[i].device,'m'+ifAry[i].device+'.p'+ifAry[i].property+ifAry[i].operator+'"'+ifAry[i].value+'"']);
            else rule.constraints.push([ifAry[i].device,'m'+ifAry[i].device,'m'+ifAry[i].device+'.p'+ifAry[i].property+ifAry[i].operator+ifAry[i].value+'']);
        }
        else
        {
            if(ifAry[i].type=="Now"){//
                rule.constraints.push(['Clock','c','c.setRepeat("'+ifAry[i].repeat+'",'+new Date().getDay()+')']);//이 룰을 설정한 '지금'의 요일에 비교하여....weekly를 실행!
            }else if(ifAry[i].type=="Delay"){
                var d=new Date();
                d.setMinutes(d.getMinutes()+parseInt(ifAry[i].detail));
                //일회성이지!repeat하면 달라지려나...
                //현재 delay는 이 룰을 설정한 시간으로부터 10분 후, action되게 되어있다. 그럼 ... repeat은...??어떻게 되어야 하지???
                rule.constraints.push(['Clock','c','c.timeComp("'+d+'")']);
                rule.constraints.push(['Clock','c','c.setRepeat("'+ifAry[i].repeat+'",'+new Date().getDay()+')']);//이 룰을 설정한 '지금'의 요일에 비교하여....weekly를 실행!
                
            }else if(ifAry[i].type=="onTime"){
                rule.constraints.push(['Clock','c','c.timeComp("'+new Date(ifAry[i].detail)+'")']);
                rule.constraints.push(['Clock','c','c.setRepeat("'+ifAry[i].repeat+'",'+new Date(ifAry[i].detail).getDay()+')']);
                
            }else if(ifAry[i].type=="Duration"){
                //지금으로부터 정해진 시간동안 이거를 계속 해라!!!=> 정해진 시간이 되면 false, 아니면 true하면 되지!
                var d=new Date();
                d.setMinutes(d.getMinutes()+parseInt(ifAry[i].detail));
                rule.constraints.push(['Clock','c','c.durationCheck("'+d+'")']);
                rule.constraints.push(['Clock','c','c.setRepeat("'+ifAry[i].repeat+'",'+new Date().getDay()+')']);
            }
        }
    }
    noolsData.rules.push(rule);

    //flow를 재컴파일 하기 위해 이전의 flow는 지워준다.
    nools.deleteFlows();
    flow = nools.compile(noolsData,{name:"test", define: {Clock: Clock}, scope: {Thing_Action: Thing_Action, Light_Action: Light_Action, all_light_off: all_light_off, systemNotify: systemNotify}});
    sessionR=flow.getSession();
    sessionR.assert(clock);

    
    //session에 원래 있던 값을 여기서 넣어줄거야.. 그리고 만약에 지금 넣을 조건문에 새로운 device가 있으면, 이 친구를 Define 시켜 줘야해!!
    var length=myfacts.length;
    for(var j=0;j<length;j++)sessionR.assert(myfacts[j]);

    sessionR.on('retract',function(facts){//session의 fact가 제거될 때, myfacts의 값도 일단 제거...
        if(facts.name!='clock')myfacts.splice(myfacts.indexOf(facts),1);
    })

    sessionR.on('assert',function(facts){//session의 fact가 추가될 때, myfacts의 값도 일단 추가...
        if(facts.name!='clock')myfacts.push(facts);
    })

    sessionR.match();//rule 걸려라!
    

   
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////여기까지 눌스(RULE 관련)임
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.post('/API/savedetails',function(req,res){//[DELAB] //룰 DB에 if, then 절 저장(update)하는 부분
    //console.log(req.body.if);
    //console.log(req.body.then);
    var data={
        'if' : JSON.parse(req.body.if),
        'then' : JSON.parse(req.body.then)
    };
    pool.getConnection(function(err,connection){
        var myQuery = 'UPDATE rule_table SET rule_details = ? WHERE rule_id='+req.query.ruleid
        var query=connection.query(myQuery,[JSON.stringify(data || "{}")],function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            
            connection.release();
        });
    });
    makeNools(JSON.parse(req.body.if),JSON.parse(req.body.then),req.body.rulename);
    res.send('success');
})

app.post('/API/deleteRule',function(req,res){
    pool.getConnection(function(err,connection){
        var query=connection.query('DELETE from smart_lighting.rule_table where rule_id="'+req.body.id+'"',function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            res.send('success');
            connection.release();
        })
    })
})

app.get('/API/loadRuleByDevice',function(req,res){
    pool.getConnection(function(err,connection){
        var query=connection.query('SELECT * FROM smart_lighting.thing_table where t_id="'+req.query.deviceid+'"',function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            res.send(rows[0]);
        })
    })
})

function colorTemperatureToRGB(kelvin){

    var temp = kelvin / 100;
    var red, green, blue;

    if( temp <= 66 ){

        red = 255;

        green = temp;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;


        if( temp <= 19){

            blue = 0;

        } else {

            blue = temp-10;
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307;

        }
    } else {

        red = temp - 60;
        red = 329.698727446 * Math.pow(red, -0.1332047592);

        green = temp - 60;
        green = 288.1221695283 * Math.pow(green, -0.0755148492 );

        blue = 255;

    }
    return {
        r : clamp(red,   0, 255),
        g : clamp(green, 0, 255),
        b : clamp(blue,  0, 255)
    }
}

// RGBToColorTemperature 수정 요망
function RGBToColorTemperature(r,g,b){

    var k = 0;

    return k;
}

function isLogin(req,res){
    if (req.session.user_id != null && req.session.user_id != "")
        return true;
    else{
        var rv = {
            err : 1,
            message : '로그인을 먼저 해주세요.'
        };

        res.status(400).send(rv);
        return false;
    }
}

function isAvailable(strTime) {
    var currentTime = new Date();
    var reqTime = new Date(strTime);
    var diffTime = currentTime - reqTime;

    if(diffTime > 60000 || diffTime < 0)
        return false;
    else
        return true;
    
    return true;
}

function sendLTQ(lightID){
    pool.getConnection(function(err,connection){
        if(err){
            connection.release();
            throw err;
        }

        // check state
        var RawQueryString = 'SELECT * FROM light_table WHERE light_id = %d';

        var Query_Str = util.format(RawQueryString, lightID);

        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                ws.send('{Error : "Database Error"}');
                connection.release();
                throw err;
            }

            var LTQ = {
                Format : "LTQ",
                Data : {
                    RoomID : rows[0].room_id,
                    LightID : rows[0].light_id,
                    MACAddr : rows[0].device_mac,
                    Time : new Date(),
                    Control : {
                        Bright : rows[0].brightness,
                        Temp : rows[0].temperature,
                        Color : {
                            Red :rows[0].red,
                            Green : rows[0].green,
                            Blue : rows[0].blue
                        },
                        BLE : {
                            Status : "OFF",
                            Connect : "None"
                        },
                        Sensor : rows[0].sensor_mode,
                        Sensor_Related : rows[0].sensor_related,
                        VoiceControl : rows[0].voice_control,
                        SmartControl : rows[0].smart_control
                    }
                }
            };

            wss.broadcast(LTQ);
        });

        
    });
}

function updateRuleDB(ifArr, thenArr,ws,ruleName){ //룰 DB에 있는 내용 불러와서 makenool 함수 호출
    pool.getConnection(function(err,connection){
        var myQuery='select rule_id from rule_table where rule_name="%s"';
        var myquery=util.format(myQuery,ruleName);
        var query=connection.query(myquery,function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            console.log("----------------------------");
            console.log(rows[0].rule_id);
            console.log(ifArr,thenArr);
            makeNools(ifArr,thenArr,rows[0].rule_id);//makeNool 함수@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            var SUS = {
                Format : "SUS",
                Data : {
                    Status : "Success",
                    Info : "None"
                }
            }
            // Send to Response
            ws.send(JSON.stringify(SUS));
        });
    });
}

app.use(cookieParser(config.secret));
app.use(session({
    sid : config.sid,
  secret: config.secret,
  cookie: {
    maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
  }
}));

/*
// Web Socket Event Listener
io.sockets.on('connection', function (socket) {
    socket.on(EVENT_NAME, function(data){

    });
});
*/

/*
wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);

    ws.on('open', function incoming(message) {
        console.log('received: %s', message);
    });
    
    ws.send('something');
});
*/


wss.on('connection', function connection(ws) {  ////////////////@@@@@@@@@@@@@@여기서부터는 nplab @@@@@@@@@@@@@@///////////////////
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        
        var reqObj = JSON.parse(message);
        
        if(reqObj.Format == "UCQ") {
            var UCQ = reqObj;

            if( isAvailable(UCQ.Data.Time) ) {
                var UCS = {
                    Format : "UCS",
                    Data : {
                        Status : "Fail",
                        Info : "RequestTimeout"
                    }
                }

                ws.send(JSON.stringify(UCS));
                return;
            }

            pool.getConnection(function(err,connection){

                var queryStr = util.format("SELECT user_id, user_name FROM user_table WHERE user_id = '%s AND user_password = '%s' LIMIT 1",UCQ.Data.UserID,UCQ.Data.Password);

                var query = connection.query(queryStr, function (err, rows) {
                    if(err){
                        connection.release();
                        throw err;
                    }

                    if(rows.length < 1){
                        var UCS = {
                            Format : "UCS",
                            Data : {
                                Status : "Fail",
                                Info : "NotExist"
                            }
                        }

                        ws.send(JSON.stringify(UCS));
                        return;
                    }
                    else{

                        // Processing
                        var UCS = {
                            Format : "UCS",
                            Data : {
                                Status : "Success",
                                Info : "None",
                            }
                        }

                        /*
                        // Session Registration
                        req.session.user_id = rows[0].user_id,
                        req.session.user_name = rows[0].user_name
                        req.session.logined = true;
                        */

                        ws.send(JSON.stringify(UCS));
                    }
                    connection.release();
                });
            });
            
            console.log('received UCQ : ' + UCQ);
            //ws.send('received UCQ');
        }
        
        else if(reqObj.Format == "LRQ") {
            var LRQ = reqObj;

            // Exception
            var reg_mac = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;

            if(reg_mac.test(LRQ.Data.MacAddr) != true){
                var LRS = {
                    Format : "LRS",
                    Data : {
                        Status : "Fail",
                        Info : "EtcProblem"
                    }
                }

                ws.send(JSON.stringify(LRS));
                return;
            }
            
            else if(reg_mac.test(LRQ.Data.BLEMacAddr) != true &&  LRQ.Data.BLEMacAddr!= undefined ) {
                var LRS = {
                    Format : "LRS",
                    Data : {
                        Status : "Fail2",
                        Info : "EtcProblem"
                    }
                }

                ws.send(JSON.stringify(LRS));
                return;
            }
        if(LRQ.Data.BLEMacAddr==undefined){
            console.log('===============================');
            console.log('!Warning>>LRQ.Data.BLEMacAddr is undefined. Is data thing?');
                    console.log('===============================');
        }
            var convert_mode_string_to_integer = LRQ.Data.Property.Color;
            if(convert_mode_string_to_integer == "BW") {
                convert_mode_string_to_integer = 0;
            }
            
            else if(convert_mode_string_to_integer == "24bColor") {
                convert_mode_string_to_integer = 1;
            }

            else {
                var LRS = {
                    Format : "LRS",
                    Data : {
                        Status : "Fail3",
                        Info : "EtcProblem"
                    }
                }

                ws.send(JSON.stringify(LRS));
                return;
            }

            var data = {
                MacAddr : LRQ.Data.MacAddr,
                BLEMacAddr : LRQ.Data.BLEMacAddr,
                Color : convert_mode_string_to_integer,
                Temp : LRQ.Data.Property.Temp,
                Lumen : LRQ.Data.Property.Lumen,    //  maximum
                BLE : LRQ.Data.Property.BLE,
                Sensor : LRQ.Data.Property.Sensor,
                VoiceControl : LRQ.Data.Property.VoiceControl,
                SmartControl : LRQ.Data.Property.SmartControl
            }

            // Insert Light,  need to modify
            
            pool.getConnection(function(err,connection){
                var Query_Str = util.format('INSERT INTO light_table (device_mac, ble_mac, color_mode, light_temperature, lumen, ble_ver, sensor_mode, voice_control, smart_control) VALUES("%s", "%s", "%s", "%s", %d, "%s", "%s", "%s", "%s")', data.MacAddr, data.BLEMacAddr, data.Color, data.Temp, data.Lumen, data.BLE, data.Sensor, data.VoiceControl, data.SmartControl);
                //var Query_Str = util.format('UPDATE light_table SET device_state = "ON"');

                console.log(Query_Str);
                
                if(err) {
                    console.log('err connection');
                }

                var query = connection.query(Query_Str, function (err, rows) {
                    if(err){
                        connection.release();
                        throw err;
                    }

                    var LRS = {
                        Format : "LRS",
                        Data : {
                            Status : "Success",
                            Info : "None"
                        }
                    }

                    ws.send(JSON.stringify(LRS));
                    
                    connection.release();
                });
            });
            
            /*
            pool.getConnection(function(err,connection){
                var Query_Str = util.format('INSERT INTO light_table (device_mac, ble_mac, color_mode, light_temperature, lumen, ble_ver, sensor_mode, voice_control, smart_control) VALUES("%s", "%s", "%s", "%s", %d, "%s", "%s", "%s", "%s")', data.MacAddr, data.BLEMacAddr, data.Color, data.Temp, data.Lumen, data.BLE, data.Sensor, data.VoiceControl, data.SmartControl);

                var query = connection.query(Query_Str, function (err, rows) {
                    if(err){
                        connection.release();
                        throw err;
                    }

                    var LRS = {
                        Format : "LRS",
                        Data : {
                            Status : "Success",
                            Info : "None"
                        }
                    }

                    ws.send(JSON.stringify(LRS));
                    
                    connection.release();
                });
            });*/
            
            console.log('Processed LRQ : ' + LRQ);
            
            // // LIQ making and send
            // var LIQ = {
            //     Format : "LIQ",
            //     Data : {
            //         RoomInfo : [],
            //         LightInfo : []
            //     }
            // }

            // pool.getConnection(function(err,connection){
            //     var Query_Str = 'SELECT * FROM room_table';
            //     var query = connection.query(Query_Str, function (err, rows) {
            //         if(err){
            //             //res.json('{Error : "Database Error"}');
            //             console.log("Database Error");
            //             connection.release();
            //             throw err;
            //         }

            //         for (var i = 0; i < rows.length; i++){
            //             var temp = {
            //                 RoomID : rows[i].room_id,
            //                 NickName : rows[i].room_name
            //             }

            //             LIQ.Data.RoomInfo.push(temp);
            //         }

            //         connection.release();
            //     });
            // });
            
            // pool.getConnection(function(err,connection){            
            //     var Query_Str = 'SELECT * FROM light_table';
            //     var query = connection.query(Query_Str, function (err, rows) {
            //         if(err){
            //             //res.json('{Error : "Database Error"}');
            //             console.log("Database Error");
            //             connection.release();
            //             throw err;
            //         }

            //         for (var i = 0; i < rows.length; i++){
            //             var temp = {
            //                 LightID : rows[i].light_id,
            //                 RoomID : rows[i].room_id,
            //                 NickName : rows[i].light_name,
            //                 MacAddr : rows[i].device_mac
            //             }

            //             LIQ.Data.LightInfo.push(temp);
            //         }

            //         wss.broadcast(LIQ);
            //         connection.release();
            //     });
            // });
                            
            // wss.broadcast(LIQ);
                
            console.log('Processed LIQ : ' + LRQ);
            //ws.send('received LRQ');
        }
        
        else if(reqObj.Format == "LUQ") {
            var LUQ = reqObj;

            // Time check
            if( isAvailable(LUQ.Data.Time) ) {
                var LUS = {
                    Format : "LUS",
                    Data : {
                        Status : "Fail",
                        Info : "RequestTimeout"
                    }
                }

                ws.send(JSON.stringify(LUS));
                return;
            }

            var data ={
                LightID : LUQ.Data.Info.LightID,
                Bright : LUQ.Data.Info.Bright,
                Temp : LUQ.Data.Info.Temp,
                Color : {
                    Red : LUQ.Data.Info.Color.Red,  
                    Green : LUQ.Data.Info.Color.Green,
                    Blue : LUQ.Data.Info.Color.Blue
                },
                BLE : {
                    Status : LUQ.Data.Info.BLE.Status,
                    Connect : LUQ.Data.Info.BLE.Connect
                },
                Sensor : LUQ.Data.Info.Sensor,
                Sensor_Related : LUQ.Data.Info.Sensor_Related,
                VoiceControl : LUQ.Data.Info.VoiceControl,
                SmartControl : LUQ.Data.Info.SmartControl
            }

            // Updating DB
            pool.getConnection(function(err,connection){
                if(err){
                    connection.release();
                    throw err;
                }

                // 이거도 마찬가지로 where 할게 없음
                // 일단 light_id로
                console.log("LUQ");
                var RawQueryString = 'UPDATE light_table SET brightness = %d, temperature = "%s", red = %d, green = %d, blue = %d, ble_status = "%s", ble_connect = "%s", sensor_mode = "%s", sensor_related = "%s", voice_mode = "%s", smart_mode = "%s" WHERE light_id = %d';

                var Query_Str = util.format(RawQueryString, data.Bright, data.Temp, data.Color.Red, data.Color.Green, data.Color.Blue, data.BLE.Status, data.BLE.Connect, data.Sensor, data.Sensor_Related, data.VoiceControl, data.SmartControl, data.LightID);

                var query = connection.query(Query_Str, function (err, rows) {
                    if(err){
                        ws.send('{Error : "Database Error"}');
                        connection.release();
                        throw err;
                    }
                    else {
                        var LUS = {
                            Format : "LUS",
                            Data : {
                                Status : "Success",
                                Info : "None"
                            }
                        }
                        // Send to Response
                        ws.send(JSON.stringify(LUS));
                    }
                    connection.release();
                });
            });

            console.log('received LUQ : ' + LUQ);
            //ws.send('received LUQ');
        }
        
        else if(reqObj.Format == "LCQ") {
            var LCQ = reqObj;

            var data ={
 //               light_id : LCQ.Data.LightID,
                MACAddr : LCQ.Data.MACAddr
            }

            // Get Status
  /*          if( data.light_id == null)
            {
                ws.send({error : 'light_id is Null'});
            }

            else{
*/
                // Updating DB
                pool.getConnection(function(err,connection){
                    if(err){
                        connection.release();
                        throw err;
                    }

                    // check state
                    var RawQueryString = 'SELECT * FROM light_table WHERE device_mac = "%s"';

                    var Query_Str = util.format(RawQueryString, data.MACAddr);

                    var query = connection.query(Query_Str, function (err, rows) {
                        if(err){
                            ws.send('{Error : "Database Error"}');
                            connection.release();
                            throw err;
                        }

                    var RawQueryString = 'UPDATE light_table SET device_state = "%s" WHERE device_mac = "%s"';

                    var Query_Str = util.format(RawQueryString, 'ON', data.MACAddr);

                    var query=connection.query(Query_Str,function(err,rows){
                            if(err){
                                connection.release();
                                throw err;
                            }
                    });

                    var LCS = {
                        Format : "LCS",
                        Data : {
                            Status : "Success",
                            Info : "None"
                        }
                    }
                    // Send to Response
                    ws.send(JSON.stringify(LCS));
                    // if already exist then return err, need to modify
                    // check sample
                    // if(rows[0].device_state == 'ON') {
                    //     var LCS = {
                    //         Format : "LCS",
                    //         Data : {
                    //             Status : "Fail",
                    //             Info : "AlreadyExist"
                    //         }
                    //     }
                    //     // Send to Response
                    //     ws.send(JSON.stringify(LCS));
                    // }

                    // // else success
                    // else {
                    //     var RawQueryString = 'UPDATE light_table SET device_state = "%s" WHERE device_mac = "%s"';

                    //     var Query_Str = util.format(RawQueryString, 'ON', data.MACAddr);
                    //     var LCS = {
                    //         Format : "LCS",
                    //         Data : {
                    //             Status : "Success",
                    //             Info : "None"
                    //         }
                    //     }
                    //     // Send to Response
                    //     ws.send(JSON.stringify(LCS));
                    // }
                    // connection.release();
                });
            });
            //          }

            console.log('received LCQ : ' + LCQ);
            //ws.send('received LCQ');
        }
        
        else if(reqObj.Format == "CCQ") {
            var CCQ = reqObj;

            // Time check
            if( isAvailable(CCQ.Data.Time) ) {
                var CCS = {
                    Format : "CCS",
                    Data : {
                        Status : "Fail",
                        Info : "RequestTimeout"
                    }
                }

                ws.send(JSON.stringify(CCS));
                return;
            }

            var data ={
                Type : CCQ.Data.Type,
                MacAddr : CCQ.Data.MacAddr
            }

            // Updating DB
            pool.getConnection(function(err,connection){
                if(err){
                    connection.release();
                    throw err;
                }

                // check state
                
                if(data.Type == "Light") {
                    var RawQueryString = 'SELECT * FROM light_table WHERE device_mac = "%s"';

                    var Query_Str = util.format(RawQueryString, data.MacAddr);

                    var query = connection.query(Query_Str, function (err, rows) {
                        if(err){
                            ws.send('{Error : "Database Error"}');
                            connection.release();
                            throw err;
                        }

                        if(rows[0].device_state == 'ON') {
                            var CCS = {
                                Format : "CCS",
                                Data : {
                                    Status : "Success",
                                    Info : "None"
                                }
                            }
                            // Send to Response
                            ws.send(JSON.stringify(CCS));
                        }

                        else {
                            var CCS = {
                                Format : "CCS",
                                Data : {
                                    Status : "Fail",
                                    Info : "EtcProblem"
                                }
                            }
                            // Send to Response
                            ws.send(JSON.stringify(CCS));
                        }
                        connection.release();
                    });
                }
                
                else if(data.Type == "Thing") {
                    
                    var RawQueryString = 'SELECT * FROM thing_table WHERE t_mac = "%s"';

                    var Query_Str = util.format(RawQueryString, data.MacAddr);

                    var query = connection.query(Query_Str, function (err, rows) {
                        if(err){
                            ws.send('{Error : "Database Error"}');
                            connection.release();
                            throw err;
                        }

                        if(rows[0].state == 'ON') {
                            var CCS = {
                                Format : "CCS",
                                Data : {
                                    Status : "Success",
                                    Info : "None"
                                }
                            }
                            // Send to Response
                            ws.send(JSON.stringify(CCS));
                        }

                        else {
                            var CCS = {
                                Format : "CCS",
                                Data : {
                                    Status : "Fail",
                                    Info : "EtcProblem"
                                }
                            }
                            // Send to Response
                            ws.send(JSON.stringify(CCS));
                        }
                        connection.release();
                    });
                }
                
                else {
                    var CCS = {
                        Format : "CCS",
                        Data : {
                            Status : "Fail",
                            Info : "TypeError"
                        }
                    }
                    
                    ws.send(JSON.stringify(CCS));
                    
                    connection.release();
                }
            });
            
            console.log('received CCQ : ' + CCQ);
            //ws.send('received CCQ');
        }
        
        else if(reqObj.Format == "TRQ") {
            var TRQ = reqObj;

            // Exception MAC
            var reg_mac = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;

            if(reg_mac.test(TRQ.Data.MacAddr) != true){
                var TRS = {
                    Format : "TRS",
                    Data : {
                        ThingID : 0,
                        Status : "Fail",
                        Info : "EtcProblem"
                    }
                }

                ws.send(JSON.stringify(TRS));
                return;
            }

            var data ={
                MacAddr : TRQ.Data.MacAddr,
                Property : {
                    Type : TRQ.Data.Property.Type,
                    Name : TRQ.Data.Property.Name,
                    DataFormat : TRQ.Data.Property.DataFormat,
                    RefreshRate : TRQ.Data.Property.RefreshRate
                }
            }

            // Insert Thing, need to modify
            pool.getConnection(function(err,connection){
                var Query_Str = util.format('INSERT INTO thing_table (t_mac, t_type, t_name, t_format, t_refresh) VALUES("%s", "%s", "%s", "%s", %d)', data.MacAddr, data.Property.Type, data.Property.Name, data.Property.DataFormat, data.Property.RefreshRate);

                var query = connection.query(Query_Str, function (err, rows) {
                    if(err){
                        connection.release();
                        throw err;
                    }
                    connection.release();
                });
            });
            pool.getConnection(function(err,connection){
                var Query='select t_id from thing_table order by t_id desc';
                var query=connection.query(Query,function(err,rows){
                    if(err){
                        connection.release();
                        throw err;
                    }
                    var tId=rows[0].t_id;
                    tjsonWrite(tId);
                    var TRS = {
                        Format : "TRS",
                        Data : {
                            ThingID : tId,
                            Status : "Success",
                            Info : "None"
                        }
                    }
                    ws.send(JSON.stringify(TRS));
                });
            });
        }

        else if(reqObj.Format == "DRQ") {
            var DRQ = reqObj;

            var data ={
                Time : DRQ.Data.Time,
                ThingID : DRQ.Data.ThingID,
                ThingData : {
                    Part1 : String(DRQ.Data.ThingData.Part1),
                    Part2 : String(DRQ.Data.ThingData.Part2),
                    Part3 : String(DRQ.Data.ThingData.Part3)
                    // 제일 데이터 개수가 많은 센서를 기준으로 Part 수를 결정
                }
            }

            // Insert Thing's Data, need to modify
            pool.getConnection(function(err,connection){
                var RawQueryString = 'UPDATE thing_table SET property_1 = "%s", property_2 = "%s", property_3 = "%s" WHERE t_id = %d';
                var Query_Str = util.format(RawQueryString, data.ThingData.Part1, data.ThingData.Part2, data.ThingData.Part3, data.ThingID);

                var query = connection.query(Query_Str, function (err, rows) {
                    if(err){
                        connection.release();
                        throw err;
                    }

                    updateFact(data);

                    var DRS = {
                        Format : "DRS",
                        Data : {
                            Status : "Success",
                            Info : "None"
                        }
                    }

                    ws.send(JSON.stringify(DRS));

                    connection.release();
                });
            });
        }
        
        else if(reqObj.Format == "TCQ") {
            // Configuration set (from mobile?)
            var TCQ = reqObj;
            var data = {
                ThingID : TCQ.Data.ThingID,
                RefreshRate : TCQ.Data.RefreshRate
            };
            

            pool.getConnection(function(err,connection){
                // 일단 light_id로 식별
                var RawQueryString = 'UPDATE thing_table SET t_refresh = %d WHERE t_id = %d';
                Query_Str = util.format(RawQueryString, data.RefreshRate, data.ThingId);

                var query = connection.query(Query_Str, function (err, rows) {

                    if(err){
                        ws.send(JSON.stringify("Database Error"));
                        connection.release();
                        throw err;
                    }

                    wss.broadcast(TCQ);
                    // TCS 받아서 success인지 확인 후 DB 업데이트
                    // 전역 변수에 담아두고 있다가, TAS를 ws로 받으면 전역 변수의 것을 업뎃

                    connection.release();
                });
            });
        }
        
        else if(reqObj.Format == "TAQ") {
            // Actuation Request Info (from mobile?)
            var TAQ = reqObj;
            
            var data = {
                Time : TAQ.Data.Time,
                ThingID : TAQ.Data.ThingID,
                ThingData : {
                    Part1 : TAQ.Data.ThingData.Part1,
                    Part2 : TAQ.Data.ThingData.Part2,
                    Part3 : TAQ.Data.ThingData.Part3
                }
            };

            pool.getConnection(function(err,connection){
                // 일단 light_id로 식별
                var RawQueryString = 'UPDATE thing_table SET property_1 = "%s", property_2 = "%s", property_3 = "%s" WHERE t_id = %d';
                var Query_Str = util.format(RawQueryString, data.ThingData.Part1, data.ThingData.Part2, data.ThingData.Part3, data.ThingId);

                var query = connection.query(Query_Str, function (err, rows) {

                    if(err){
                        ws.send(JSON.stringify("Database Error"));
                        connection.release();
                        throw err;
                    }

                    wss.broadcast(TAQ);
                    // TAS 받아서 success인지 확인 후 DB 업데이트
                    // 전역 변수에 담아두고 있다가, TAS를 ws로 받으면 전역 변수의 것을 업뎃

                    connection.release();
                });
            });
        }
        
        else if(reqObj.Format == "SUQ") {
            var SUQ = reqObj;

            var suq_data ={
                RequestLight : {
                    RoomID : SUQ.Data.RequestLight.RoomID,
                    LightID : SUQ.Data.RequestLight.LightID
                },

                TargetLight : {
                    RoomID : SUQ.Data.TargetLight.RoomID,
                    LightID : SUQ.Data.TargetLight.LightID
                },

                Control : {
                    Bright : SUQ.Data.Control.Bright,
                    Temp : SUQ.Data.Control.Temp,
                    Color : {
                        Red : SUQ.Data.Control.Color.Red,
                        Green : SUQ.Data.Control.Color.Green,
                        Blue : SUQ.Data.Control.Color.Blue
                    },
                    BLE : {
                        Status : SUQ.Data.Control.BLE.Status,
                        Connect : SUQ.Data.Control.BLE.Connect
                    },

                    Sensor : SUQ.Data.Control.Sensor,
                    Sensor_Related : SUQ.Data.Control.Sensor_Related,
                    VoiceControl : SUQ.Data.Control.VoiceControl,
                    SmartControl : SUQ.Data.Control.SmartControl,
                }
            }

            var ifArr=[{
                type : SUQ.Data.Time.Type,
                detail : '',
                repeat : SUQ.Data.Repeat,
            }];
            //ifArr.push(SUQ.Data.Time);
            if(SUQ.Data.Time.Type=="Now")ifArr[0].detail=new Date();
            else if(SUQ.Data.Time.Type=="Delay")ifArr[0].detail=SUQ.Data.Time.Delay;
            else if(SUQ.Data.Time.Type=="onTime")ifArr[0].detail=SUQ.Data.Time.onTime;
            else if(SUQ.Data.Time.Type=="Duration")ifArr[0].detail=SUQ.Data.Time.Duration;



            var thenArr=[{
                description:"change light "+SUQ.Data.TargetLight.LightID+"'s value = bright : "+SUQ.Data.Bright+", color :",  
                all_light_off : '0',
                systemNoti : '0',
                bright : SUQ.Data.Control.Bright,
                temperature : SUQ.Data.Control.Temp,
                color0 : 'rgb('+SUQ.Data.Control.Color.Red+','+SUQ.Data.Control.Color.Green+','+SUQ.Data.Control.Color.Blue+')',
                device : 'l'+SUQ.Data.TargetLight.LightID
            }];

            thenArr[0].description=thenArr[0].description+thenArr[0].color0;

            var data={
                'if' : ifArr,
                'then' : thenArr
            }

            var string="Repeat("+ifArr[0].repeat+")  "+ifArr[0].type+"  ";
            if(ifArr[0].type=="onTime"){
                string=string+ifArr[0].detail;
            }else string=string+ifArr[0].detail+" min";

            var ruleName='test schedule'+myflag;
            myflag=myflag+1;
            var ruleDesc=string;

            if(ifArr[0].type!="Now"){
                pool.getConnection(function(err,connection){
                    var myQuery = 'Insert into rule_table values(null,"'+ruleName+'","'+ruleDesc+'",?)';
                    var query=connection.query(myQuery,[JSON.stringify(data || "{}")],function(err,rows){
                        if(err){
                            connection.release();
                            throw err;
                        }
                        updateRuleDB(ifArr,thenArr,ws,ruleName);
                        connection.release();
                    });
                });
            }
            else{
                // Updating DB (satisfy schedule)
                pool.getConnection(function(err,connection){
                    if(err){
                        connection.release();
                        throw err;
                    }

                    var RawQueryString = 'UPDATE light_table SET brightness = %d, temperature = "%s", red = %d, green = %d, blue = %d, ble_status = "%s", ble_connect = "%s", sensor_mode = "%s", sensor_related = "%s", voice_mode = "%s", smart_mode = "%s" WHERE room_id = %d and light_id = %d';
                    Query_Str = util.format(RawQueryString, suq_data.Control.Bright, suq_data.Control.Temp, suq_data.Control.Color.Red, suq_data.Control.Color.Green, suq_data.Control.Color.Blue, suq_data.Control.BLE.Status, suq_data.Control.BLE.Connect, suq_data.Control.Sensor, suq_data.Control.Sensor_Related, suq_data.Control.VoiceControl, suq_data.Control.SmartControl, suq_data.TargetLight.RoomID, suq_data.TargetLight.LightID);

                    var query = connection.query(Query_Str, function (err, rows) {

                        if(err){
                            var SUS = {
                                Format : "SUS",
                                Data : {
                                    Status : "Fail",
                                    Info : "EtcProblem"
                                }
                            }
                            ws.send(JSON.stringify(SUS));
                            connection.release();
                            throw err;
                        }

                        // else success
                        else {
                            var SUS = {
                                Format : "SUS",
                                Data : {
                                    Status : "Success",
                                    Info : "None"
                                }
                            }
                            // Send to Response
                            ws.send(JSON.stringify(SUS));
                            sendLTQ(suq_data.TargetLight.LightID);
                        }
                        connection.release();
                    });
                });
            }
        }
        
        else if(reqObj.Format == "EDQ") {
            var EDQ = reqObj;

            pool.getConnection(function(err,connection){
                if(err){
                    connection.release();
                    throw err;
                }

                if(EDQ.DataType == "API") {
                    var Query_Str = 'SELECT * FROM weather';

                    var query = connection.query(Query_Str, function (err, rows) {

                        if(err){s
                            //res.json('{Error : "Database Error"}');
                            var EDS = {
                                Format : "EDS",
                                DataType : "API",
                                Result : "Fail"
                            }
                            ws.send(JSON.stringify(EDS));

                            connection.release();
                            throw err;
                        }

                        var EDS = {
                            Format : "EDS",
                            DataType : "API",
                            Result : "Success",
                            APIData : {
                                ExtAPIData : []
                            }
                        }

                        var weather_type = EDQ.APIInfo.ExtAPIID;
                        var weather_locationr = EDQ.APIInfo.ExtAPILoc;
                        var weather_time = EDQ.APIInfo.ExtAPITime;

                        if(weather_type == 1) {
                            if(weather_time == "오늘") {
                                var temp = {
                                    DataName : "날씨",
                                    DataValue : rows[0].weather_today
                                }
                                EDS.APIData.ExtAPIData.push(temp);

                                var temp = {
                                    DataName : "온도",
                                    DataValue : rows[0].temperature_today
                                }
                                EDS.APIData.ExtAPIData.push(temp);

                                var temp = {
                                    DataName : "습도",
                                    DataValue : rows[0].humidity_today
                                }
                                EDS.APIData.ExtAPIData.push(temp);
                            }

                            else if(weather_time == "내일") {
                                var temp = {
                                    DataName : "날씨",
                                    DataValue : rows[0].weather_tomorrow
                                }
                                EDS.APIData.ExtAPIData.push(temp);

                                var temp = {
                                    DataName : "온도",
                                    DataValue : rows[0].temperature_tomorrow
                                }
                                EDS.APIData.ExtAPIData.push(temp);

                                var temp = {
                                    DataName : "습도",
                                    DataValue : rows[0].humidity_tomorrow
                                }
                                EDS.APIData.ExtAPIData.push(temp);
                            }
                            else {
                                console.log('weather_time error');
                            }

                        }

                        else if(weather_type == 2) {
                            if(weather_time == "오늘") {
                                var temp = {
                                    DataName : "미세먼지",
                                    DataValue : rows[0].fineDust_today
                                }
                                EDS.APIData.ExtAPIData.push(temp);

                                var temp = {
                                    DataName : "초미세먼지",
                                    DataValue : rows[0].ultrafineDust_today
                                }
                                EDS.APIData.ExtAPIData.push(temp);
                            }

                            else if(weather_time == "내일") {
                                var temp = {
                                    DataName : "미세먼지",
                                    DataValue : rows[0].fineDust_tomorrow
                                }
                                EDS.APIData.ExtAPIData.push(temp);

                                var temp = {
                                    DataName : "초미세먼지",
                                    DataValue : rows[0].ultrafineDust_tomorrow
                                }
                                EDS.APIData.ExtAPIData.push(temp);
                            }

                            else {
                                console.log('weather_time error');
                            }                
                        }

                        else {
                            console.log('weather_type error');
                        }
                        console.log(EDS);
                        ws.send(JSON.stringify(EDS));

                        connection.release();
                    });
                }

                else if(EDQ.DataType == "Light") {
                    var RawQueryString = 'SELECT * FROM light_table where light_id=%d and room_id=%d';
                    var Query_Str = util.format(RawQueryString, EDQ.LightInfo.LightID, EDQ.LightInfo.RoomID);

                    var query = connection.query(Query_Str, function (err, rows) {
                        if(err){
                            //res.json('{Error : "Database Error"}');
                            var EDS = {
                                Format : "EDS",
                                DataType : "Light",
                                Result : "Fail"
                            }
                            ws.send(JSON.stringify(EDS));

                            connection.release();
                            throw err;
                        }

                        var EDS = {
                            Format : "EDS",
                            DataType : "Light",
                            Result : "Success",
                            LightData : {
                                Bright : rows[0].brightness,
                                Temp : rows[0].temperature,
                                Color : {
                                    Red : rows[0].red,
                                    Green : rows[0].green,
                                    Blue : rows[0].blue
                                }
                            }
                        }

                        ws.send(JSON.stringify(EDS));

                        connection.release();
                    });
                }

                else {
                    var EDS = {
                        Format : "EDS",
                        DataType : EDQ.DataType,
                        Result : "Fail"
                    }

                    ws.send(JSON.stringify(EDS));
                }
            });
        }

        else if(reqObj.Format == "TNQ") {
            var TNQ = reqObj;

            var data ={
                MACAddr : TNQ.Data.MACAddr
            }

            // Updating DB
            pool.getConnection(function(err,connection){
                if(err){
                    connection.release();
                    throw err;
                }

                // update state in thing_table
                var RawQueryString = 'UPDATE thing_table SET state = "%s" WHERE t_mac = "%s"';

                var Query_Str = util.format(RawQueryString, 'ON', data.MACAddr);

                var query=connection.query(Query_Str,function(err,rows){
                    if(err){
                        connection.release();
                        throw err;
                    }
                });

                var TNS = {
                    Format : "TNS",
                    Data : {
                        Status : "Success",
                        Info : "None"
                    }
                }

                // Send to Response
                ws.send(JSON.stringify(TNS));
            });

            console.log('received TNQ : ' + TNQ);
        }
        
        else {
            console.log('received ' + reqObj.Format + ' : ' + reqObj);
            //ws.send('received ' + reqObj.Format +  ' : ' + reqObj);
        }
        
    });
    // ws.send('something');
});


// Serve Static Page
app.use('/', express.static(__dirname));

// Index Page
app.get('/',function(req,res){
    io.sockets.emit('toAllClient',notify);
    var room,car_thing;
    pool.getConnection(function(err,connection){
        var query=connection.query('select * from room_table;',function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            room=rows;
            connection.release();
        });    
    }); 
    pool.getConnection(function(err,connection){
        var query=connection.query('select *from thing_table where t_name="Car_Detection";',function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            car_thing=rows;
            connection.release();
        });    
    });

    pool.getConnection(function(err,connection){
        var query=connection.query('select * from light_table where (light_name is null) OR (room_id is null);',function(err,rows){
            if(err){
                connection.release();
                throw err;
            }

            res.render('index', {
                user_id : req.session.user_id,
                user_name : req.session.user_name,
                Light_data: rows,
                room_data : room,
                car_data: car_thing,
            });
            connection.release();
        });
    });
});

app.get('/rooms',function(req,res){ //[DELAB] 페이지 랜더링
    var Light;
     pool.getConnection(function(err,connection){
        var query=connection.query('select * from light_table',function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            Light=rows;
            connection.release();
        });
    });
        res.render('rooms',{
            user_id : req.session.user_id,
            user_name : req.session.user_name,
            Light_data : Light,
        });
});
app.get('/regist',function(req,res){//[DELAB]  페이지 랜더링
        res.render('regist',{
            user_id : req.session.user_id,
            user_name : req.session.user_name,
        });
});

app.get('/controller',function(req,res){//[DELAB]  페이지 랜더링
        res.render('controller',{
            user_id : req.session.user_id,
            user_name : req.session.user_name,
        });
});

app.get('/dataLogs',function(req,res){//[DELAB] 페이지 랜더링
        res.render('dataLogs',{
            user_id : req.session.user_id,
            user_name : req.session.user_name,
        });
});

app.get('/rules',function(req,res){//[DELAB] 페이지 랜더링
    var rules;
    if(req.query.device_id!=undefined){
        pool.getConnection(function(err,connection){
            var query_str="select * from smart_lighting.rule_table where rule_details like \'%t"+req.query.device_id+"%\'"
            var query=connection.query(query_str,function(err,rows){
                if(err){
                    connection.release();
                    throw err;
                }
                rules=rows;
                connection.release();
            });
        });
        pool.getConnection(function(err,connection){
            var query=connection.query('select * from room_table',function(err,rows){
                if(err){
                    connection.release();
                    throw err;
                }
                res.render('rules',{
                    user_id : req.session.user_id,
                    user_name : req.session.user_name,
                    rule_data:rules,
                    room_data:rows,
                });
                connection.release();
            });    
        });
    }else{
        pool.getConnection(function(err,connection){
            var query=connection.query('select * from rule_table',function(err,rows){
                if(err){
                    connection.release();
                    throw err;
                }
                rules=rows;
                connection.release();
            });
        });
        pool.getConnection(function(err,connection){
            var query=connection.query('select * from room_table',function(err,rows){
                if(err){
                    connection.release();
                    throw err;
                }
                res.render('rules',{
                    user_id : req.session.user_id,
                    user_name : req.session.user_name,
                    rule_data:rules,
                    room_data:rows,
                });
                connection.release();
            });    
        }); 
    }
    
});

app.get('/addRules',function(req,res){//[DELAB] 페이지 랜더링
    var ruledata;
    pool.getConnection(function(err,connection){
            var query=connection.query('select * from rule_table where rule_table.rule_id='+req.query.ruleid,function(err,rows){
                if(err){
                    connection.release();
                    throw err;
                }
                ruledata=rows[0];
                connection.release();
            });
        });
    pool.getConnection(function(err,connection){
            var query=connection.query('select * from room_table',function(err,rows){
                if(err){
                    connection.release();
                    throw err;
                }
                res.render('addRules',{
                    user_id : req.session.user_id,
                    user_name : req.session.user_name,
                    rule_data:ruledata,
                    room_data:rows,
                    device_id:req.query.deviceid
                });
                connection.release();
            });
        });
});





/*------ About User Start ------*/
// Check
var User_Check = function(req,res){ //@@@@여기서부터 안봐도됨@@//////////////////

    var UCQ = req.query;

    // Exception
    if (UCQ.Format != "UCQ"){

        var UCS = {
            Format : "UCS",
            Data : {
                Status : "Fail",
                Info : "RequestTypeError"
            }
        }

        res.status(400).send(UCS);
        return;
    }

    if( isAvailable(UCQ.Data.Time) ) {
        var UCS = {
            Format : "UCS",
            Data : {
                Status : "Fail",
                Info : "RequestTimeout"
            }
        }

        res.status(400).send(UCS);
        return;
    }

    pool.getConnection(function(err,connection){

        var queryStr = util.format("SELECT user_id, user_name FROM user_table WHERE user_id = '%s' AND user_password = '%s' LIMIT 1",UCQ.Data.UserID,UCQ.Data.Password);

        var query = connection.query(queryStr, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            if(rows.length < 1){
                var UCS = {
                    Format : "UCS",
                    Data : {
                        Status : "Fail",
                        Info : "NotExist"
                    }
                }

                res.status(400).send(UCS);
                return;
            }
            else{

                // Processing
                var UCS = {
                    Format : "UCS",
                    Data : {
                        Status : "Success",
                        Info : "None",
                    }
                }

                /*
                // Session Registration
                req.session.user_id = rows[0].user_id,
                req.session.user_name = rows[0].user_name
                req.session.logined = true;
                */

                res.status(200).send(UCS);
            }
            connection.release();
        });
    });
};
app.get('/API/users/check',User_Check);

// Registration
app.get('/users/regist', function(req,res){
    res.sendFile(__dirname+'/regist.html');
});


app.post('/API/users/regist', function(req,res){

    // Exception
    var reg_uid = /^[a-z0-9_]{5,12}$/;
    var reg_upw = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-]|.*[0-9]).{6,24}$/;
    var reg_nickname = /^[0-9a-zA-Z가-힣]{4,20}$/;


    if(reg_uid.test(req.body.user_id) != true){
        var rv = {
            err : 1,
            message : '계정명이 올바르지 않습니다.'
        };

        res.status(400).send(rv);
        return;
    }
    else if(reg_nickname.test(req.body.user_password) != true){
        var rv = {
            err : 1,
            message : '이름이 올바르지 않습니다.'
        };

        res.status(400).send(rv);
        return;
    }
    else if(req.body.user_password != req.body.user_password2){
        var rv = {
            err : 1,
            message : '패스워드가 일치하지 않습니다.'
        };

        res.status(400).send(rv);
        return;
    }

    var shasum = crypto.createHash('sha1'); // shasum은 Hash 클래스의 인스턴스입니다.
    shasum.update(req.body.user_password);
    var output = shasum.digest('hex');

    var data = {
        user_id : req.body.user_id,
        user_name : req.body.user_name,
        user_password : output,
    }

    // Loading Case
    pool.getConnection(function(err,connection){

        var queryStr = util.format("INSERT INTO user_table (user_id, user_name, user_password) SELECT '%s', '%s', '%s' FROM dual WHERE NOT EXISTS (SELECT * FROM user_table WHERE user_id = '%s')", data.user_id,data.user_name, data.user_password, data.user_id);

        var query = connection.query(queryStr, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            if(rows.affectedRows != 1){
                var rv = {
                    err : 1,
                    message : '중복되는 계정이 존재합니다.'
                };

                res.status(400).send(rv);

                connection.release();
                return;
            }

            res.json('{Success : ok}');

            connection.release();
        });
    });
});



// Login & Logoff
app.get('/API/users/login',function(req,res){

    var data = {
        user_id : req.query.user_id,
        user_password : req.query.user_password,
    }

    pool.getConnection(function(err,connection){

        var queryStr = util.format("SELECT user_id, user_name FROM user_table WHERE user_id = '%s' AND user_password = '%s' LIMIT 1",data.user_id,data.user_password);

        var query = connection.query(queryStr, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            if(rows.length < 1){
                var rv = {
                    err : 1,
                    message : '로그인 정보가 올바르지 않습니다.'
                };

                res.status(400).send(rv);
            }
            else{
                // Success
                req.session.user_id = rows[0].user_id,
                req.session.user_name = rows[0].user_name
                req.session.logined = true;

                res.json(rows[0]);
            }
            connection.release();
        });
    });
});
app.get('/API/checkNames',function(req,res){
    
})
app.get('/users/login/check',function(req,res){
    if(req.session.user_id != null && req.session.user_id != ""){

        res.json({
            user_id : req.session.user_id,
            user_name : req.session.user_name
        });

        return;
    }
    else{

        var rv = {
            err : 1,
            message : '로그인을 먼저 해주세요.'
        };

        res.status(400).send(rv);
    }
});
app.get('/users/logout',function(req,res){

    if (isLogin(req,res) == false)
        return;

    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }else
        {

            res.clearCookie(config.sid); // 세션 쿠키 삭제
            res.send({message : '성공적으로 로그아웃 되었습니다.'});

        }
    });

});
/*------ About User End ------*/



/*------ About Light Start ------*/
// Registration
var Light_Registration = function(req,res){
    var LRQ = req.body;

    // Exception
    if (LRQ.Format != "LRQ"){
        var LRS = {
            Format : "LRS",
            Data : {
                Status : "Fail",
                Info : "EtcProblem"
            }
        }

        res.status(400).send(LRS);
        return;
    }

    // Exception
    var reg_mac = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;

    if(reg_mac.test(LRQ.Data.MacAddr) != true){
        var LRS = {
            Format : "LRS",
            Data : {
                Status : "Fail",
                Info : "EtcProblem"
            }
        }

        res.status(400).send(LRS);
        return;
    }
    else if(reg_mac.test(LRQ.Data.BLEMacAddr) != true) {
        var LRS = {
            Format : "LRS",
            Data : {
                Status : "Fail",
                Info : "EtcProblem"
            }
        }

        res.status(400).send(LRS);
        return;
    }

    var data = {
        MacAddr : LRQ.Data.Property.MacAddr,
        BLEMacAddr : LRQ.Data.Property.BLEMacAddr,
        Color : LRQ.Data.Property.Color,
        Temp : LRQ.Data.Property.Temp,
        Lumen : LRQ.Data.Property.Lumen,    //  maximum
        BLE : LRQ.Data.Property.BLE,
        Sensor : LRQ.Data.Property.Sensor,
        VoiceControl : LRQ.Data.Property.VoiceControl,
        SmartControl : LRQ.Data.Property.SmartControl
    }

    // Insert Light,  need to modify
    pool.getConnection(function(err,connection){
        
        var Query_Str = util.format('INSERT INTO light_table (device_mac, ble_mac, color_mode, light_temperature, lumen, ble_ver, sensor_mode, voice_control, smart_control) VALUES("%s", "%s", "%s", "%s", %d, "%s", "%s", "%s", "%s")', data.MacAddr, data.BLEMacAddr, data.Color, data.Temp, data.Lumen, data.BLE, data.Sensor, data.VoiceControl, data.SmartControl);
        
        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            var LRS = {
                Format : "LRS",
                Data : {
                    Status : "Success",
                    Info : "None"
                }
            }

            res.status(200).send(LRS);

            //connection.release();
        });
        
        connection.release();
    });
};
app.post('/API/lights/regist', Light_Registration);

// Connection, light_id is LC's ID
var Light_Connection = function(req,res){
    var LCQ = req.body;

    // Exception
    if (LCQ.Format != "LCQ"){

        var LCS = {
            Format : "LCS",
            Data : {
                Status : "Fail",
                Info : "EtcProblem"
            }
        }

        res.status(400).send(LCS);
        return;
    }

    var data ={
        light_id : req.params.light_id,
        RoomID : LCQ.Data.RoomID,
        MACAddr : LCQ.Data.MACAddr
    }

    // Get Status
    if( data.light_id == null)
    {
        res.send({error : 'light_id is Null'});
    }
    else{

        // Updating DB
        pool.getConnection(function(err,connection){
            if(err){
                connection.release();
                throw err;
            }

            // check state
            var RawQueryString = 'SELECT * FROM light_table WHERE device_mac = "%s"';

            var Query_Str = util.format(RawQueryString, data.MACAddr);

            var query = connection.query(Query_Str, function (err, rows) {
                if(err){
                    res.json('{Error : "Database Error"}');
                    connection.release();
                    throw err;
                }

                // if already exist then return err, need to modify
                // check sample
                if(rows[0].device_state == 'ON') {
                    var LCS = {
                        Format : "LCS",
                        Data : {
                            Status : "Fail",
                            Info : "AlreadyExist"
                        }
                    }
                    // Send to Response
                    res.status(400).send(LCS);
                }

                // else success
                else {
                    var RawQueryString = 'UPDATE light_table SET device_state = "%s" WHERE device_mac = "%s"';

                    var Query_Str = util.format(RawQueryString, 'ON', data.MACAddr);
                    var LCS = {
                        Format : "LCS",
                        Data : {
                            Status : "Success",
                            Info : "None"
                        }
                    }
                    // Send to Response
                    res.status(200).send(LCS);
                }
                connection.release();
            });
        });
    }
};
app.put('/API/lights/:light_id/connect', Light_Connection);

var Connection_Check = function(req,res){
    var CCQ = req.query;

    // Exception
    if (CCQ.Format != "CCQ"){

        var CCS = {
            Format : "CCS",
            Data : {
                Status : "Fail",
                Info : "EtcProblem"
            }
        }

        res.status(400).send(CCS);
        return;
    }

    // Time check
    if( isAvailable(CCQ.Data.Time) ) {
        var CCS = {
            Format : "CCS",
            Data : {
                Status : "Fail",
                Info : "RequestTimeout"
            }
        }

        res.status(400).send(CCS);
        return;
    }

    var data ={
        light_id : req.params.light_id,
        MACAddr : CCQ.Data.MACAddr,
    }

    // Get Status
    if( data.light_id == null)
    {
        res.send({error : 'light_id is Null'});
    }

    else{

        // Updating DB
        pool.getConnection(function(err,connection){
            if(err){
                connection.release();
                throw err;
            }

            // check state
            var RawQueryString = 'SELECT * FROM light_table WHERE device_mac = "%s"';

            var Query_Str = util.format(RawQueryString, data.MACAddr);

            var query = connection.query(Query_Str, function (err, rows) {
                if(err){
                    res.json('{Error : "Database Error"}');
                    connection.release();
                    throw err;
                }

                /* ???
                else if( data.light_id.MAC != data.MACAddr ) {
                    res.json('{Error : "Database Error"}');
                    connection.release();
                    throw err;
                }*/

                if(rows[0].device_state == 'ON') {
                    var CCS = {
                        Format : "CCS",
                        Data : {
                            Status : "Success",
                            Info : "None"
                        }
                    }
                    // Send to Response
                    res.status(200).send(CCS);
                }

                else {
                    var CCS = {
                        Format : "CCS",
                        Data : {
                            Status : "Fail",
                            Info : "EtcProblem"
                        }
                    }
                    // Send to Response
                    res.status(400).send(CCS);
                }
                connection.release();
            });
        });
    }
};
app.get('/API/lights/:light_id/check', Connection_Check);

// Control
var Light_Control = function(req,res){
    console.log(req.body.Data);

    /*if (isLogin(req,res) == false) {
        console.log("pls login")
        return;
    }*/

    // Time check, DB에서 최근 received 된 시간을 받아서  보내야 함
    //if( isAvailable(req.body.Time) )
    //    res.status({error : 'Time out'});

    // To Client
    if( req.params.light_id == null)
        res.send({error : 'cid is Null'});
    else {
        // Data Set
        var LTQ = {
            Format : "LTQ",
            Data : {
                RoomID : req.body.Data.RoomID,
                LightID : req.body.Data.LightID,
                MACAddr : req.body.Data.MACAddr,
                Time : new Date(),
                Control : {
                    Bright : req.body.Data.Control.Bright,
                    Temp : req.body.Data.Control.Temp,
                    Color : {
                        Red : req.body.Data.Control.Color.Red,
                        Green : req.body.Data.Control.Color.Green,
                        Blue : req.body.Data.Control.Color.Blue
                    },
                    BLE : {
                        Status : "OFF",
                        Connect : "None"
                    },
                    Sensor : req.body.Data.Control.Sensor,
                    Sensor_Related : req.body.Data.Control.Sensor_Related,
                    VoiceControl : req.body.Data.Control.VoiceControl,
                    SmartControl : req.body.Data.Control.SmartControl
                }
            }
        };

        // Updating DB // wss.broadcast(LTQ) 외에는 Response 받고 난 후에 하는 것으로 변경해야함
        pool.getConnection(function(err,connection){
            // 일단 light_id로 식별
            var RawQueryString = 'UPDATE light_table SET brightness = %d, temperature = "%s", red = %d, green = %d, blue = %d, ble_status = "%s", ble_connect = "%s", sensor_mode = "%s", sensor_related = "%s", voice_mode = "%s", smart_mode = "%s", time = "%s" WHERE light_id = %d and room_id = %d';
            Query_Str = util.format(RawQueryString ,LTQ.Data.Control.Bright, LTQ.Data.Control.Temp, LTQ.Data.Control.Color.Red, LTQ.Data.Control.Color.Green, LTQ.Data.Control.Color.Blue, LTQ.Data.Control.BLE.Status, LTQ.Data.Control.BLE.Connect, LTQ.Data.Control.Sensor, LTQ.Data.Control.Sensor_Related, LTQ.Data.Control.VoiceControl, LTQ.Data.Control.SmartControl, LTQ.Data.Time, LTQ.Data.LightID, LTQ.Data.RoomID);

            var query = connection.query(Query_Str, function (err, rows) {

                if(err){
                    res.json('{Error : "Database Error"}');
                    connection.release();
                    throw err;
                }

                //io.sockets.emit("test",LTQ);

                /*
                // Old Version (2017-08-02)
                var opt = {
                    cid : data.light_id,
                    action : 'set',r : data.r, g : data.g, b : data.b
                }
                io.sockets.emit("test",opt);
                */

                wss.broadcast(LTQ);

                // Send to Response
                //res.send({cid : 1,action : 'toggle'});

                connection.release();
            });
        });
    }
};
app.put('/API/lights/:light_id/control', Light_Control);

// Condition Update
var Light_Condition_Update = function(req,res){
    var LUQ = req.body;

    // Exception
    if (LUQ.Format != "LUQ"){
        var LUS = {
            Format : "LUS",
            Data : {
                Status : "Fail",
                Info : "EtcProblem"
            }
        }

        res.status(400).send(LUS);
        return;
    }

    // Time check
    if( isAvailable(LUQ.Data.Time) ) {
        var LUS = {
            Format : "LUS",
            Data : {
                Status : "Fail",
                Info : "RequestTimeout"
            }
        }

        res.status(400).send(LUS);
        return;
    }

    // Get Status
    if( req.params.light_id == null)
    {
        res.send({error : 'light_id is Null'});
    }

    else{
        var data ={
            Bright : LUQ.Data.Info.Bright,
            Temp : LUQ.Data.Info.Temp,
            Color : {
                Red : LUQ.Data.Info.Color.Red,  
                Green : LUQ.Data.Info.Color.Green,
                Blue : LUQ.Data.Info.Color.Blue
            },
            BLE : {
                Status : LUQ.Data.Info.BLE.Status,
                Connect : LUQ.Data.Info.BLE.Connect
            },
            Sensor : LUQ.Data.Info.Sensor,
            VoiceControl : LUQ.Data.Info.VoiceControl,
            SmartControl : LUQ.Data.Info.SmartControl
        }

        // Updating DB
        pool.getConnection(function(err,connection){
            if(err){
                connection.release();
                throw err;
            }

            // 이거도 마찬가지로 where 할게 없음
            // 일단 light_id로
            console.log("LUQ");
            var RawQueryString = 'UPDATE light_table SET brightness = %d, temperature = "%s", red = %d, green = %d, blue = %d, ble_status = "%s", ble_connect = "%s", sensor_mode = "%s", voice_mode = "%s", smart_mode = "%s" WHERE light_id = %d';

            var Query_Str = util.format(RawQueryString, data.Bright, data.Temp, data.Color.Red, data.Color.Green, data.Color.Blue, data.BLE.Status, data.BLE.Connect, data.Sensor, data.VoiceControl, data.SmartControl, req.params.light_id);

            var query = connection.query(Query_Str, function (err, rows) {
                if(err){
                    res.json('{Error : "Database Error"}');
                    connection.release();
                    throw err;
                }
                else {
                    var LUS = {
                        Format : "LUS",
                        Data : {
                            Status : "Success",
                            Info : "None"
                        }
                    }
                    // Send to Response
                    res.status(200).send(LUS);
                }
                connection.release();
            });
        });


    }
};
app.post('/lights/:light_id/condition', Light_Condition_Update);
app.put('/API/lights/:light_id/condition', Light_Condition_Update);

// Getting Now Information Lights (2017-04-20 by JaejUN)
app.get('/API/lights/:light_id',function(req,res){ //[DELAB] light 하나의 정보요청

    var data ={
        light_id : req.params.light_id,
    }

    // Get Status
    if( data.light_id == null)
    {
        res.send({error : 'light_id is Null'});
    }
    else{

        // Updating DB
        pool.getConnection(function(err,connection){
            
            var RawQueryString = 'SELECT * FROM light_table WHERE light_id = %d';

            var Query_Str = util.format(RawQueryString, data.light_id);

            var query = connection.query(Query_Str, function (err, rows) {
                if(err){
                    res.json('{Error : "Database Error"}');
                    connection.release();
                    throw err;
                }

                // Send to Response
                res.send(rows[0]);

                connection.release();
            });
        });


    }
});
app.get('/API/GetNames/:room_id/:device/:property',function(req,res){ //[DELAB] id별 이름 정보 조회
    //console.log(req.body);
    var data={
        room_id : req.params.room_id,
        device : req.params.device,
        property : req.params.property,
    };
    var room_name;
    var light_thing_name;
    var property;

    var thing_type;
    // console.log(data.room_id);
    // console.log(data.device.substring(1));
    // console.log(data.property);
    var device_str=data.device.substring(0,1);

    var Data={
        room_name: null ,
        light_thing_name : null,
        real_property: null,
        thing_type: null,
        // light_property: null,
        // thing_property: null,

    };
    if(data.property==1){
            Data.real_property='bright';
        } 
      else if(data.property==2){
            Data.real_property='temperature';
         }  
   

    pool.getConnection(function(err,connection){
        var queryStr=util.format("select room_name from room_table where room_id=%d",data.room_id);
        var query=connection.query(queryStr,function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            Data.room_name=rows[0].room_name;
            //connection.ping();
            //connection.release();
            console.log(Data.room_name);
            if(device_str=='w'){
                console.log("------------");
                res.json(Data);
           }
        });
    });
  
   

    
    if(device_str=='l'){
             
        pool.getConnection(function(err,connection){
            var queryStr=util.format("select light_name from light_table where light_id=%d",data.device.substring(1));
            var query=connection.query(queryStr,function(err,rows){
                if(err){
                    connection.release();
                    throw err;
                }
                Data.light_thing_name=rows[0].light_name;
                connection.ping();
                //connection.release();
                 console.log(Data.light_thing_name);
                console.log(Data);
                res.json(Data);

            });
        });

    }

    else if(device_str=='t'){
       // pool.getConnection(function(err,connection){
       //  var queryStr=util.format("select t_name,t_type from thing_table where t_id=%d",data.device.substring(1));
       //  var query=connection.query(queryStr,function(err,rows){
       //      if(err){
       //          connection.release();
       //          throw err;
       //      }
       //      Data.light_thing_name=rows[0].t_name;
       //      Data.thing_type=rows[0].t_type;
       //      connection.ping();
       //      //connection.release();
       //       console.log(Data.light_thing_name);
       //       console.log(Data.thing_type);
       //  });

       // });
       select_name_type(Data,data.device.substring(1),res);

        // pool.getConnection(function(err,connection){
        //     var queryStr=util.format("select s_property_1 from spec_table where t_type='%s'",Data.thing_type);
        //     var query=connection.query(queryStr,function(err,rows){
        //         if(err){
        //             connection.release();
        //             throw err;
        //         }
        //        Data.real_property=rows[0].s_property_1;
        //         //connection.ping();
        //         //connection.release();
        //         console.log(Data.real_property);
        //         console.log(Data);
        //         res.json(Data);
                
        //     });
        // }); 

        
        
   }


});






function select_name_type(data,data2,res){ //[DELAB] //id에 따른 thing의 이름과 타입정보 요청
       pool.getConnection(function(err,connection){
        var queryStr=util.format("select t_name,t_type from thing_table where t_id=%d",data2);
        var query=connection.query(queryStr,function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            data.light_thing_name=rows[0].t_name;
            data.thing_type=rows[0].t_type;
            // connection.ping();
            //connection.release();
             console.log(data.light_thing_name);
             console.log(data.thing_type);
             select_property(data,res);
        });

       });
}
function select_property(data,res){ //[DELAB] 타입에 따른 property 정보요청

            pool.getConnection(function(err,connection){
            var queryStr=util.format("select s_property_1 from spec_table where t_type='%s'",data.thing_type);
            console.log(queryStr);
            var query=connection.query(queryStr,function(err,rows){
                if(err){
                    connection.release();
                    throw err;
                }
                console.log("asdjk"+rows);
               data.real_property=rows[0].s_property_1;
                //connection.ping();
                //connection.release();
                console.log(data.real_property);
                console.log(data);
                res.json(data);
                
            });
        }); 
}

// Change Light Status (2017-04-20 by JaejUN), Mode 변경에만 사용 중, rgb 변경은 Light_Control에서
app.put('/API/lights/:light_id',function(req,res){

    if (isLogin(req,res) == false)
        return;

    // Data Set
    var data = {
        light_id : req.params.light_id,
        r : req.body.r,
        g : req.body.g,
        b : req.body.b,
        mode : req.body.mode,
    };
    // To Client
    if( data.light_id == null)
    {
        res.send({error : 'cid is Null'});
    }
    else{
        // Updating DB
        pool.getConnection(function(err,connection){

            var Query_Str = "";
            if (data.r == null && data.b == null && data.g == null)
            {
                var RawQueryString = 'UPDATE light_table SET color_mode = %d WHERE light_id = %d';

                Query_Str = util.format(RawQueryString ,data.mode,data.light_id);

            }
            else{
                var RawQueryString = 'UPDATE light_table SET red = %d,green = %d,blue = %d, color_mode = %d WHERE light_id = %d';

                Query_Str = util.format(RawQueryString, data.r,data.g,data.b,data.mode,data.light_id);

                var LTQ = {
                    Format : "LTQ",
                    Data : {
                        Time : new Date.toString(),
                        Control : {
                            Bright : 0,
                            Color : "rgb",//data.r.toString(16)+"-"+data.g.toString(16)+"-"+data.b.toString(16),
                            Temp : "2700K",
                            Mode : "RGB",
                            BLE : {
                                Status : null,
                                Connect : "010-1234-1234"
                            }
                        }
                    }
                };
            }

            var query = connection.query(Query_Str, function (err, rows) {

                if(err){
                    res.json('{Error : "Database Error"}');

                    connection.release();
                    throw err;
                }

                // Send to LC


                wss.broadcast('test');


                //io.sockets.emit("test",LTQ);

                /*
                // Old Version (2017-08-02)
                var opt = {
                    cid : data.light_id,
                    action : 'set',r : data.r, g : data.g, b : data.b
                }
                io.sockets.emit("test",opt);
                */

                /*wss.on('connection', function connection(ws, req) {
                  const location = url.parse(req.url, true);
                  // You might use location.query.access_token to authenticate or share sessions
                  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

                  ws.on('message', function incoming(message) {
                    console.log('received: %s', message);
                  });

                  ws.send('something');
                });*/



                // Send to Response
                res.send({cid : 1,action : 'toggle'});

                connection.release();
            });
        });
    }
});

// Control이랑 Condition Query 수정 필요
/*------ About Light End ------*/



/*------ About Thing Start ------*/ // move to ws parts

// Registration
/*
var Thing_Registration = function(req,res){
    var TRQ = req.body;

    // Exception Format
    if (TRQ.Format != "TRQ"){
        var TRS = {
            Format : "TRS",
            Data : {
                ThingID : 0,
                Status : "Fail",
                Info : "EtcProblem"
            }
        }

        res.status(400).send(TRS);
        return;
    }

    // Exception MAC
    var reg_mac = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;

    if(reg_mac.test(TRQ.Data.MacAddr) != true){
        var TRS = {
            Format : "TRS",
            Data : {
                ThingID : 0,
                Status : "Fail",
                Info : "EtcProblem"
            }
        }

        res.status(400).send(TRS);
        return;
    }

    var data ={
        MacAddr : req.body.Data.MacAddr,
        Property : {
            Type : req.body.Data.Property.Type,
            Name : req.body.Data.Property.Name,
            DataCount : req.body.Data.Property.DataCount,
            DataFormat : req.body.Data.Property.DataFormat,
            RefreshRate : req.body.Data.Property.RefreshRate
        }
    }

    // Insert Thing, need to modify
    pool.getConnection(function(err,connection){
        var Query_Str = util.format('INSERT INTO thing_table (t_mac, t_type, t_name, t_count, t_format, t_refresh) VALUES("%s", "%s", "%s", %d, "%s", %d)', data.MacAddr, data.Property.Type, data.Property.Name, data.Property.DataCount, data.Property.DataFormat, data.Property.RefreshRate);
        
        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            var TRS = {
                Format : "TRS",
                Data : {
                    ThingID : Thing_Id,
                    Status : "Success",
                    Info : "None"
                }
            }

            Thing_Id = Thing_Id + 1;

            res.status(200).send(TRS);

            connection.release();
        });
    });
};
app.post('/API/things/regist', Thing_Registration);

// Data Reception
var Data_Reception = function(req,res){
    var DRQ = req.body;

    // Exception Format
    if (DRQ.Format != "DRQ"){
        var DRS = {
            Format : "DRS",
            Data : {
                Status : "Fail",
                Info : "EtcProblem"
            }
        }

        res.status(400).send(DRS);
        return;
    }

    var data ={
        Time : req.body.Data.Time,
        ThingID : req.body.Data.ThingID,
        ThingData : {
            Part1 : req.body.Data.ThingData.Part1,
            Part2 : req.body.Data.ThingData.Part2,
            Part3 : req.body.Data.ThingData.Part3
            // 제일 데이터 개수가 많은 센서를 기준으로 Part 수를 결정
        }
    }

    // Insert Thing's Data, need to modify
    pool.getConnection(function(err,connection){
        var Query_Str = util.format('INSERT INTO t_data_table (data_time, t_id, data_part1, data_part2, data_part3) VALUES("%s", %d, "%s", "%s", "%s")', data.Time, data.ThindID, data.ThindData.Part1, data.ThindData.Part2, data.ThindData.Part3);
        
        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            var DRS = {
                Format : "DRS",
                Data : {
                    Status : "Success",
                    Info : "None"
                }
            }

            res.status(200).send(DRS);

            connection.release();
        });
    });
};
app.post('/API/things/data', Data_Reception);

// Configuration Update
var Thing_Configuration = function(req,res){
    // Configuration set (from mobile?)
    var TCQ = {
        Format : "TCQ",
        Data : {
            ThingID : req.body.Data.ThingID,
            RefreshRate : req.body.Data.RefreshRate
        }
    };
    
    pool.getConnection(function(err,connection){
        // 일단 light_id로 식별
        var RawQueryString = 'UPDATE thing_table SET t_refresh = %d WHERE t_id = %d';
        Query_Str = util.format(RawQueryString, TCQ.Data.RefreshRate, TCQ.Data.ThingId);

        var query = connection.query(Query_Str, function (err, rows) {

            if(err){
                res.json('{Error : "Database Error"}');
                connection.release();
                throw err;
            }

            wss.broadcast(TCQ);
            // TCS 받아서 success인지 확인 후 DB 업데이트
            // 전역 변수에 담아두고 있다가, TAS를 ws로 받으면 전역 변수의 것을 업뎃

            connection.release();
        });
    });
};
app.post('/API/things/config', Thing_Configuration);

// Actuation
var Thing_Actuation = function(req,res){
    // Actuation Request Info (from mobile?)
    var TAQ = {
        Format : "TAQ",
        Data : {
            Time : req.body.Data.Time,
            ThingID : req.body.Data.ThingID,
            ThingData : {
                Part1 : req.body.Data.ThingData.Part1,
                Part2 : req.body.Data.ThingData.Part2,
                Part3 : req.body.Data.ThingData.Part3
            }
        }
    };
    
    pool.getConnection(function(err,connection){
        // 일단 light_id로 식별
        var RawQueryString = 'UPDATE t_data_table SET data_time = "%s", data_part1 = "%s", data_part3 = "%s", data_part3 = "%s" WHERE t_id = %d';
        Query_Str = util.format(RawQueryString ,TAQ.Data.Time, TAQ.Data.ThingData.Part1, TAQ.Data.ThingData.Part2, TAQ.Data.ThingData.Part3, TAQ.Data.ThingId);

        var query = connection.query(Query_Str, function (err, rows) {

            if(err){
                res.json('{Error : "Database Error"}');
                connection.release();
                throw err;
            }

            wss.broadcast(TAQ);
            // TAS 받아서 success인지 확인 후 DB 업데이트
            // 전역 변수에 담아두고 있다가, TAS를 ws로 받으면 전역 변수의 것을 업뎃

            connection.release();
        });
    });
    
};
app.post('/API/things/actuation', Thing_Actuation);
*/
/*------ About Thing End ------*/



/*------ About Room & Case Start ------*/
// Rest API, io.socket.emit 이용 중.
app.get('/API/set',function(req, res){

    if (isLogin(req,res) == false)
        return;

    // Data Set
    var data = {
        cid : req.query.case_id,
        r : req.query.r,
        g : req.query.g,
        b : req.query.b,
    };

    //console.log(data);

    // To Client
    if( data.cid == null)
    {
        res.send({error : 'cid is Null'});
    }
    else{
        io.sockets.emit(EVENT_NAME,{
            cid : data.cid,
            action : 'set',r : data.r, g : data.g, b : data.b
        });
        res.send({cid : 1,action : 'toggle'});
    }

});

// Add Room, INSERT query
app.post('/API/room',function(req, res){ //[DELAB] // Add Room, INSERT query

    if (isLogin(req,res) == false)
        return;

    // Data Set
    var data = {
        room_name : req.body.room_name,
        room_explain : req.body.room_exp
    };

    // Loading Case
    pool.getConnection(function(err,connection){
        var query = connection.query('INSERT INTO room_table set ?', data, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            res.json('{Success : ok}');

            connection.release();
        });
    });
});

function registerlight(){ //[DELAB] light 등록 함수
    var LIQ = {
        Format : "LIQ",
        Data : {
            RoomInfo : [],
            LightInfo : []
        }
    }
 
    //console.log(req.body.room)
     pool.getConnection(function(err,connection){
        var queryStr = util.format('select * from room_table');
        //console.log(queryStr);
        var query = connection.query(queryStr, function (err, rows) {
            if(err){
                console.log("zzzzz");
                connection.release();
                throw err;
            }
            console.log(rows);
            for(var i=0;i<rows.length;i++){
                var temp = {
                    RoomID : rows[i].room_id,
                    NickName : rows[i].room_name
                };
                LIQ.Data.RoomInfo.push(temp);
            }
            
            connection.release();
        });     
     });

     pool.getConnection(function(err,connection){
        var queryStr = util.format('select * from light_table');
        //console.log(queryStr);
        var query = connection.query(queryStr, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            for(var i=0;i<rows.length;i++){
                console.log(rows[i].room_id);
                var temp = {
                    LightID : rows[i].light_id,
                    RoomID : rows[i].room_id,
                    NickName : rows[i].light_name,
                    MacAddr : rows[i].device_mac
                };
                LIQ.Data.LightInfo.push(temp);
            }
            wss.broadcast(LIQ);
            connection.release();
        });         
    });
}

app.post('/API/Light/register',function(req,res){//[DELAB] 

    var data={
        light_name : req.body.Light_name,
        room_id : req.body.room_name,
        light_id : req.body.light_id,
    };


      pool.getConnection(function(err,connection){
        var queryStr = util.format("update light_table set room_id=%d, light_name='%s', device_state='ON' where light_id=%d",data.room_id,data.light_name,data.light_id);
        var query = connection.query(queryStr, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            registerlight(); //@@@@@@@@@@@@@@@@@@@@@@@등록 함수@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            res.json('{Success : ok}');
            
            
            connection.release();
        });
    });
    
});

app.post('/API/things/register',function(req,res){//[DELAB] thing 등록

     if (isLogin(req,res) == false)
        return;

    var data = {
        t_type : req.body.thing_type,
        t_mac : req.body.thing_mac,
        t_name : req.body.thing_name,
        room_id : req.body.room_id
    };
    //console.log(data);
   
    var num=1*data.room_id; // type casting 

    pool.getConnection(function(err,connection){
        var queryStr = util.format("insert into thing_table(t_mac,t_name,t_type,room_id) values('%s','%s','%s', %d)",data.t_mac, data.t_name, data.t_type,num);
        var query = connection.query(queryStr, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            res.json('{Success : ok}');

            connection.release();
        });     
    });
});

app.post('/API/Exthings/register',function(req,res){//[DELAB] external thing(차량센서 등) 등록

     if (isLogin(req,res) == false)
        return;

    var data = {
        //t_mac : req.body.thing_mac,
        t_name : req.body.thing_name,
        t_id : req.body.t_id,
        t_type : req.body.thing_type,
    };
    //console.log(data);
    //var num=1*data.room_id; // type casting 

    pool.getConnection(function(err,connection){
        var queryStr = util.format("update thing_table set t_name='%s',t_type='%s' where t_id=%d", data.t_name,data.t_type, data.t_id);
        var query = connection.query(queryStr, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            res.json('{Success : ok}');

            connection.release();
        });     
    });
});

app.get('/API/things/type',function(req,res){//thing_type inquery //[DELAB]
       pool.getConnection(function(err,connection){
        var query = connection.query('select *from spec_table', function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows);
            connection.release();
        });
    });
});


// /Rooms (getting Room Informations for Constructing Index Page)
app.get('/API/rooms',function(req, res){ //[DELAB]

    pool.getConnection(function(err,connection){

        var query = connection.query('select * from room_table', function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows);
            connection.release();
        });
    });

});

app.get('/API/devices/:room_id',function(req,res){//[DELAB] 방 id에 따른 디바이스 조회ㅍㅍㅍㅍ
    var thing=[];
    pool.getConnection(function(err,connection){
        var query = connection.query('select * from thing_table where room_id='+req.params.room_id, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            thing[0]=rows;
            connection.release();
        });
    });
    pool.getConnection(function(err,connection){
        var query = connection.query('select * from light_table where room_id='+req.params.room_id, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            thing[1]=rows;
            res.send(thing);
            connection.release();
        });
    });
});

app.get('/API/properties/:t_id',function(req,res){//[DELAB] thing id에 따른 thing과 spec정보 조회
    pool.getConnection(function(err,connection){
        var query = connection.query('select * from thing_table natural join spec_table where t_id='+req.params.t_id, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows[0]);
            connection.release();
        });
    });
})

///
app.get('/API/spec/:t_type',function(req,res){//[DELAB]//thing 타입에 따른 스펙 정보 불러오기
    pool.getConnection(function(err,connection){
        var query = connection.query('select * from thing_table natural join spec_table where t_type="'+req.params.t_type+'" and room_id="15"', function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows[0]);
            connection.release();
        });
    });
})

app.get('/API/thingsbyroom/:room_id',function(req, res){//[DELAB] 룸id별 스펙테이블과 thing테이블 정보 조회

    pool.getConnection(function(err,connection){
        var query = connection.query('select * from smart_lighting.thing_table natural join smart_lighting.spec_table where thing_table.t_type=spec_table.t_type and thing_table.room_id="' + req.params.room_id+'"' , function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows);
            //console.log(rows);
            connection.release();
        });
    });

});

app.get('/API/rulebythingid/:t_id',function(req,res){
    pool.getConnection(function(err,connection){
        var query_str="select * from smart_lighting.rule_table where rule_details like '%"+req.params.t_id+"%'";
        var query=connection.query(query_str,function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows);
            connection.release();
        });
    });
});


app.get('/API/rooms/light/count/:room_id',function(req,res){//light_count   //[DELAB] // 방아이디에 따른 light 개수
    pool.getConnection(function(err,connection){

        var query= connection.query('select count(if(room_id='+req.params.room_id+',room_id,null)) AS count from light_table;',function (err,rows){
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows[0]);
            connection.release();
        });

    });
});

app.get('/API/rooms/thing/count/:room_id',function(req,res){//thing_count  //[DELAB]
    pool.getConnection(function(err,connection){

        var query= connection.query('select count(if(room_id='+req.params.room_id+',room_id,null)) AS count from thing_table;',function (err,rows){
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows[0]);
            connection.release();
        });

    });
});


// /Room (getting Room Informations for More Tab)
app.get('/API/rooms/:room_id',function(req, res){ //[DELAB] 방id에 따른 룸 정보
    pool.getConnection(function(err,connection){
        var query = connection.query('select * from room_table where room_id = '+req.params.room_id, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows[0]);
            connection.release();
        });
    });

});

app.get('/API/weather',function(req,res){ //[DELAB] //날씨 정보 조회
    pool.getConnection(function(err,connection){
        var query=connection.query('select * from weather',function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows[0]);
            connection.release();
        })
    })
})
app.get('/API/car',function(req,res){ //[DELAB]
    pool.getConnection(function(err,connection){//차량센서 정보 불러오기
        var query=connection.query('select *from thing_table where t_type="Sensor";',function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            console.log(rows);
            res.json(rows);
            connection.release();
        })
    })
});

// Get Light List in the room
app.get('/API/rooms/:room_id/lights',function(req, res){ //[DELAB]//룸 id별 라이트정보 조회
    pool.getConnection(function(err,connection){
        var query = connection.query('select * from light_table where room_id = ' + req.params.room_id , function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows);
            connection.release();
        });
    });

});

// Get Thing List in the room
app.get('/API/rooms/:room_id/things',function(req, res){//[DELAB] 룸id별 스펙테이블과 thing테이블 정보 조회

    pool.getConnection(function(err,connection){
        var query = connection.query('select * from thing_table inner join spec_table ON thing_table.t_type=spec_table.t_type where room_id = ' + req.params.room_id , function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows);
            console.log(rows);
            connection.release();
        });
    });

});

// /Cases (getting Room Informations for Constructing Index Page),
app.get('/API/case',function(req, res){ 

    pool.getConnection(function(err,connection){
        var query = connection.query('select * from case_table', function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows);
            connection.release();
        });
    });

});

// /Cases (getting Room Informations for Constructing Index Page)
app.get('/API/case/:case_id',function(req, res){

    var case_id = req.params.case_id;

    // Exception
    if (case_id == null){
        res.json("{Error : 'Case Id Error'}");
        return;
    }

    pool.getConnection(function(err,connection){
        var query = connection.query('select * from detail_case_table where case_id =' + case_id, function (err, rows) {     
            if(err){
                connection.release();
                throw err;
            }
            res.json(rows);
            connection.release();
        });
    });

});

// Add Cases, INSERT query
app.post('/API/case',function(req, res){

    if (isLogin(req,res) == false)
        return;

    // Data Set
    var data = {
        case_name : req.body.case_name
    };

    // Loading Case
    pool.getConnection(function(err,connection){
        var query = connection.query('INSERT INTO case_table set ?', data, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            res.json('{Success : ok}');

            connection.release();
        });
    });
});

// Edit Detail Cases
app.post('/API/case/:case_id/:light_id',function(req, res){

    if (isLogin(req,res) == false)
        return;

    // Exception
    if (req.params == null){
        res.json('{Success : fail}');
        return;
    }

    // Data Set
    var data = {
        light_id : req.params.light_id,
        case_id : req.params.case_id,
        room_id : req.body.room_id,
        light_order : req.body.light_order,
        brightness : req.body.brightness,
        red : req.body.red,
        green : req.body.green,
        blue : req.body.blue,
        color_mode : req.body.color_mode,
    };

    // Loading Case
    pool.getConnection(function(err,connection){


        var Query_Str = util.format('INSERT INTO detail_case_table (light_id, case_id, room_id, light_order, brightness, red, green, blue, color_mode) VALUES(%d, %d, %d, %d, %d, %d, %d, %d, "%s") ON DUPLICATE KEY UPDATE brightness=%d, red=%d, green=%d, blue=%d, color_mode="%s"',data.light_id,data.case_id,data.room_id,data.light_order,data.brightness,data.red,data.green,data.blue,data.color_mode, data.brightness,data.red,data.green,data.blue,data.color_mode);
        
        //console.log(Query_Str);

        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                res.json('{Success : Error}');
                connection.release();
                throw err;
            }
            /*
            // To Client
            var r = Number(data.red);
            var g = Number(data.green);
            var b = Number(data.blue);

            //console.log(rows[i])

            io.sockets.emit(EVENT_NAME,{
                cid : data.light_id,
                action : 'set',
                r : r,
                g : g,
                b : b
            });
            */
            res.json('{Success : ok}');

            connection.release();
        });
    });

});

// Doing Cases
app.post('/API/case/:case_id',function(req, res){


    if (isLogin(req,res) == false)
        return;


    // Loading Case
    pool.getConnection(function(err,connection){
        var query = connection.query('select * from detail_case_table where case_id = '+ req.params.case_id, function (err, rows) {
            if(err){
                connection.release();
                throw err;
            }

            for(var i = 0 ; i < rows.length; i++){

                // To Client
                var r = Number(rows[i].red);
                var g = Number(rows[i].green);
                var b = Number(rows[i].blue);

                //console.log(rows[i])

                /*
                io.sockets.emit(EVENT_NAME,{
                    cid : rows[i].light_id,
                    action : 'set',
                    r : r,
                    g : g,
                    b : b
                });
                */
            }

            res.json('{Success : ok}');

            connection.release();
        });
    });
});

app.post('/API/addrule',function(req,res){ //[DELAB] //rule테이블에 추가
    if (isLogin(req,res) == false)
        return;
    pool.getConnection(function(err,connection){
        var data={
            'if' : [],
            'then' : [],
        }
        var queryStr='INSERT INTO rule_table(rule_name,rule_description,rule_details) VALUES("'+req.body.addruleName+'","'+req.body.addruleDesc+'",?)';
        var query=connection.query(queryStr,[JSON.stringify(data || "{}")],function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            connection.release();
        });
    });
    pool.getConnection(function(err,connection){
        var queryStr=util.format('select rule_id from rule_table order by rule_id desc');
        var query=connection.query(queryStr,function(err,rows){
            if(err){
                connection.release();
                throw err;
            }
            res.send(rows[0]);
            connection.release();
        });
    });
});


// BLE on
app.post('/API/BLE',function(req, res){

    if (isLogin(req,res) == false)
        return;

    // Data Set
    var data = {
        UserId : req.body.UserID,
        Password : req.body.Password,
        BLE_Status : req.body.BLE_Status,
    };

    io.sockets.emit(EVENT_NAME,{
        cid : -1,
        action : 'set',
        r : r,
        g : g,
        b : b
    });

    res.json(data);
});

// Sensor Controlling

// weather function
function weather_insert(weather_data) { //[DELAB] // 날씨정보 저장
    pool.getConnection(function(err,connection){
        var Query_Str = util.format('INSERT INTO weather (weather_today, temperature_today, humidity_today, fineDust_today, ultrafineDust_today, weather_tomorrow, temperature_tomorrow, humidity_tomorrow, fineDust_tomorrow, ultrafineDust_tomorrow, time) VALUES("%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s")', weather_data.weather_today, weather_data.temperature_today, weather_data.humidity_today, weather_data.fineDust_today, weather_data.ultrafineDust_today, weather_data.weather_tomorrow, weather_data.temperature_tomorrow, weather_data.humidity_tomorrow, weather_data.fineDust_tomorrow, weather_data.ultrafineDust_tomorrow, weather_data.time);

        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                console.log('DB Error in weather');
                connection.release();
                throw err;
            }   
            connection.release();
        });
    });
}

function weather_update(weather_data) { //[DELAB] // 날씨정보 update
    pool.getConnection(function(err,connection){
        var RawQueryString = 'UPDATE weather SET weather_today="%s", temperature_today="%s", humidity_today="%s", fineDust_today="%s", ultrafineDust_today="%s", weather_tomorrow="%s", temperature_tomorrow="%s", humidity_tomorrow="%s", fineDust_tomorrow="%s", ultrafineDust_tomorrow="%s", time="%s"';
        var Query_Str = util.format(RawQueryString, weather_data.weather_today, weather_data.temperature_today, weather_data.humidity_today, weather_data.fineDust_today, weather_data.ultrafineDust_today, weather_data.weather_tomorrow, weather_data.temperature_tomorrow, weather_data.humidity_tomorrow, weather_data.fineDust_tomorrow, weather_data.ultrafineDust_tomorrow, weather_data.time);

        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                console.log('DB Error in weather');
                connection.release();
                throw err;
            }

            updateWFact(weather_data);

            //console.log(rows)

            connection.release();
        });
    });
}

// Server On
server.listen(PORT, function () {
    console.log('Smart Lighting Server On');

    /*
    pool.getConnection(function(err,connection){
        var Query_Str = util.format('describe weather')

        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                res.json('{Success : Error}');
                connection.release();
                throw err;
            }

            console.log(rows)
            //res.json('{Success : ok}');

            connection.release();
        });
    });
    */

    /*
    pool.getConnection(function(err,connection){
        var Query_Str = util.format('delete from weather')
        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                console.log('DB Error in weather');
                connection.release();
                throw err;
            }   
            connection.release();
        });
    });
    
    pool.getConnection(function(err,connection){
        var Query_Str = util.format('INSERT INTO weather (weather_today, temperature_today, humidity_today, fineDust_today, ultrafineDust_today, weather_tomorrow, temperature_tomorrow, humidity_tomorrow, fineDust_tomorrow, ultrafineDust_tomorrow, time) VALUES("%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s")', "nothing", "nothing", "nothing", "nothing", "nothing", "nothing", "nothing", "nothing", "nothing", "nothing", "nothing");
        
        var query = connection.query(Query_Str, function (err, rows) {
            if(err){
                console.log('DB Error in weather');
                connection.release();
                throw err;
            }   
            connection.release();
        });
    });*/



    var testTime = setInterval(function(){ 
        request({
            url: BASE_URL,
            method: 'GET',
        }, function(err, res, body) {
            //console.log(err);
            //console.log(res);
            console.log(body);
            if(body!=undefined){var temp_string = body.split('"')[1]
            
            var weather_today = "" + String(temp_string.split('___')[10]) 
            var temperature_today = "" + String(temp_string.split('___')[9])
            var humidity_today = "" + String(temp_string.split('___')[8])
            var fineDust_today = "" + String(temp_string.split('___')[0])
            var ultrafineDust_today = "" + String(temp_string.split('___')[1])
            var weather_tomorrow = "" + String(temp_string.split('___')[6])
            var temperature_tomorrow = "" + String(temp_string.split('___')[5])
            var humidity_tomorrow = "" + String(temp_string.split('___')[4])
            var fineDust_tomorrow = "" + String(temp_string.split('___')[2])
            var ultrafineDust_tomorrow = "" + String(temp_string.split('___')[3])
            
            var weather_data = {
                weather_today : weather_today,
                temperature_today : temperature_today.split('도')[0],
                humidity_today : humidity_today.split('%')[0],
                fineDust_today : fineDust_today,
                ultrafineDust_today : ultrafineDust_today,
                weather_tomorrow : weather_tomorrow,
                temperature_tomorrow : temperature_tomorrow.split('도')[0],
                humidity_tomorrow : humidity_tomorrow.split('%')[0],
                fineDust_tomorrow : fineDust_tomorrow.split(' : ')[1],
                ultrafineDust_tomorrow : ultrafineDust_tomorrow.split(' : ')[1],
                time : String(new Date())
            }
            
            pool.getConnection(function(err,connection){
                var Query_Str = util.format('select * from weather')
                var query = connection.query(Query_Str, function (err, rows) {
                    if(err){
                        console.log('DB Error in weather');
                        connection.release();
                        throw err;
                    }  
                    
                    if(rows.length == 0) {
                        weather_insert(weather_data);
                    }
                    
                    else if(rows.length == 1) {
                        weather_update(weather_data);
                    }
                    connection.release();
                });
            });}
            
        });
    }, 1200000);

});
/*------ About Room & Case End ------*/
