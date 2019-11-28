
const BASE_URL = "http://light.kumoh.ac.kr:80/";
const API_URL = "API/"
var Modify_Mode = 0;
var Now_Case_Id = -1;
var Now_Light_Id = -1;
var edit_mode = 0;
/*
function separatedRGB2stringRGB(r, g, b) {
    rgb = r.toString(16).toUpperCase() + '-' + g.toString(16).toUpperCase() + '-' + b.toString(16).toUpperCase();

    return rgb;
}
*/



var socket = io.connect(BASE_URL); // 룰관련 system notify
socket.on('toAllClient', function(msg){ 
    $('#notify').val(msg);
    toastr.success(msg);
});


// function ToggleModify(){
//     $.ajax({
//         type: "get",
//         url : BASE_URL+"users/login/check",
//         timeout : 2000,
//         success: function(data){
//             var ModifyButton = $('#modify_button');

//             if ( Modify_Mode == 0){
//                 toastr.success('시나리오 수정을 시작합니다.');

//                 Modify_Mode = 1;
//                 ModifyButton.text("완료");
//             }
//             else{
//                 toastr.warning('시나리오 수정을 종료합니다.');

//                 Modify_Mode = 0;
//                 ModifyButton.text("수정");
//             }
//         },
//         error: function(err){
//             toastr.warning(err.responseJSON.message);
//         }
//     });

// }
function Messagefunc(){ 
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this imaginary file!",
        icon: "warning",
        buttons: true,
    })
    .then((willDelete) => {
        if (willDelete) {
            swal("Poof! Your imaginary file has been deleted!", {
                icon: "success",
            });
        } else {
            swal("Your imaginary file is safe!");
        }
    });
}

// // Mode Change Button
// function ChangeMode(){

//     // AddCase Form
//     var Form = $('#active_edit_light_form');
//     var light_id = $('#active_edit_light_form').data('light_id');

//     GetLightInfomration(light_id, function(data){

//         var value = 0;
//         if(data.color_mode == 0){
//             value = 1;
//         }
//         else{
//             value = 0;
//         }

//         var Data = {
//             mode : value
//         };

//         // 서버에 모드 변경 넣기
//         $.ajax({
//             type: "put",
//             url : BASE_URL+API_URL+"lights/"+light_id,
//             timeout : 2000,
//             data : Data,
//             success: function(data){
//                 //var Form = $('#active_edit_light_form');

//                 if (value == 1){
//                     // View Mode
//                     Form.find("#wrap_color_temparature").show();
//                     Form.find("#wrap_color").hide();
//                 }
//                 else{
//                     // View Mode
//                     Form.find("#wrap_color").show();
//                     Form.find("#wrap_color_temparature").hide();
//                 }
//             },
//             error: function(err){
//                 alert(err.responseJSON.message);
//                 console.log(err)
//             }
//         });
//     });
// }



// Sumbit Modify Button
// function SumbitModify(){
//     ToggleModify();
// }

// Add Case CASE관련은 지금 없어짐
function SubmitCaseInformation(){ 

    // Dom
    var Dom = $('#active_add_case_form');

    // Data
    var Data = {
        case_name : Dom.find('#case_name').val()
    };

    // 서버랑 통신 및 등록 처리
    $.ajax({
        type: "post",
        url : BASE_URL+API_URL+"case",
        timeout : 2000,
        data : Data,
        success: function(data){
            // 화면 갱신
            console.log("success!!!!!!!!!!1");
            LoadCaseInformation(null);
        },
        error: function(err){
            toastr.warning(err.responseJSON.message);
        }
    });

    CloseDialog();
}


/*
function Submit1(){
    alert("111111");
    $.ajax({
        type: "post",
        url : BASE_URL+"users/login/check",
        timeout : 2000,
        success: function(data){
            var ModifyButton = $('#modify_button');

            if ( Modify_Mode == 0){
                toastr.success('시나리오 수정을 시작합니다.');

                Modify_Mode = 1;
                ModifyButton.text("완료");
            }
            else{
                toastr.warning('시나리오 수정을 종료합니다.');

                Modify_Mode = 0;
                ModifyButton.text("수정");
            }
        },
        error: function(err){
            toastr.warning(err.responseJSON.message);
        }
    });

}
*/

// Submit Modified Information
function SetDetailCase (light_id,Data) {
    // 서버랑 통신 및 등록 처리
    $.ajax({
        type: "post",
        url : BASE_URL+API_URL+"case/"+Now_Case_Id+'/'+light_id,
        timeout : 2000,
        data : Data,
        success: function(data){
            // 화면 갱신
            //LoadRoomInformation();
        },
        error: function(err){
            toastr.warning(err.responseJSON.message);
        }
    });
}

// Run Case
function DoCase(case_id){
    $.ajax({
        type: "post",
        url : BASE_URL+API_URL+"case"+"/"+case_id,
        timeout : 2000,
        success: function(data){
            console.log(data);
        },
        error: function(err){
            toastr.warning(err.responseJSON.message);
        }
    });
}

function GetLightInfomration(light_id, func){ // 제목 그대로 lightid에 따른 light정보 불러오는거 *오타주의
    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"lights/"+light_id,
        timeout : 2000,
        success: func,
    });
}

/*
// Set RGB
function setLight(light_id,r,g,b,mode){
    var Data = {
        r : r,
        g : g,
        b : b,
        mode : mode,
    }

    $.ajax({
        type: "put",
        url : BASE_URL+"lights/"+light_id,
        data : Data,
        timeout : 2000,
        success: function(data){

        },
        error: function(err){
            //toastr.warning(err.responseJSON.message);
        }
    });
}
*/

function LightControl(light_id, data, roomid) { // ajax가 있으니까 DB에 넣으려 했던게 아닐까...
    var Data = {
        Format : "LTQ",
        Data : {
            RoomID : roomid,
            LightID : light_id,
            MACAddr : data.device_mac,
            Time : new Date(),
            Control : {
                Bright : data.brightness,
                Temp : data.temperature,
                Color : {
                    Red : data.red,
                    Green : data.green,
                    Blue : data.blue
                },
                BLE : {
                    Status : "OFF",
                    Connect : "None"
                },
                Sensor : data.sensor_mode,
                VoiceControl : data.voice_mode,
                SmartControl : data.smart_mode
            }
        }
    }

    $.ajax({
        type: "put",
        url : BASE_URL+API_URL+"lights/"+light_id+"/control",
        data : Data,
        timeout : 2000,
        success: function(data){

        },
        error: function(err){
            //toastr.warning(err.responseJSON.message);
        }
    });
}

/*
// Remove 17-04-20 By Jaejun
function SetRGB(case_id,r,g,b) {

    var Data = {
        case_id : case_id,
        r : r,
        g : g,
        b : b,
    }

    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"set",
        data : Data,
        timeout : 2000,
        success: function(data){

        },
        error: function(err){

        }
    });
}
*/

function saveLight(light_id, room_id){ // light view쪽
    if(typeof(light_id)!='number')light_id=light_id.substring(1);
    GetLightInfomration(light_id, function(data){
        data.brightness=parseInt($("#bright-temperature").val());
        data.temperature=parseInt($("#temperature").val());
        var Form = $('.rgbpanel');
        var spec = Form.find('#flat');
        // var value=Form.find('#rgbBtns input[type=radio]')..val();
        // console.log(value);

        var sttr=spec.val().split(', ');
        var R=sttr[0].substring(4);
        var G=sttr[1];
        var B=sttr[2].substring(0,1);

        data.red = R;
        data.green = G;
        data.blue = B;


        data.voice_mode=$('#voice_mode label.active input').val();
        data.smart_mode=$('#smart_mode label.active input').val();
        var str=$('#rgbBtns label.active input').val().split(',');
        data.red=parseInt(str[0]);
        data.green=parseInt(str[1]);
        data.blue=parseInt(str[2]);

        LightControl(light_id, data, room_id);
    });
}


// Edit Bulb (전구) ROOM 패널과 관련된 부분일..거야..아마 //
function ViewEditBulb(room_id, light_id, smart_control,voice_control ){ 
    if(typeof(light_id)!='number')light_id=light_id.substring(1);
    GetLightInfomration(light_id, function(data){ // 이 data는 light_table의 data라서 다 있음
        // AddCase Form
        var Form = $('.rgbpanel').show();
        Form.attr('id','active_edit_light_form');
        Form.attr("data-light_id", light_id);
        Form.attr("data-room_id", room_id);

        console.log(smart_control);
        console.log(voice_control);
   

        var container1=$('#header');
        //var container2=$('#');
        var container2=$('#voice_mode_header');
        var container3=$('#voice_mode_');
        var container4=$('#smart_mode_header');
        var container5=$('#smart_mode_');
        var container6=$('#NotHeader');

        container1.empty();
        container2.empty();
        container3.empty();
        container4.empty();
        container5.empty();
        container6.empty();

        var str;
        if(data.voice_mode=="ON"){
            str='<div class="col-md-12 col-md-12" align="center"><div class="btn-group" data-toggle="buttons" id="voice_mode" align="center">'+
                '<label class="btn btn-default btn-md active"><input type="radio" name="operator" autocomplete="off" value="ON">on</input></label>'+
                '<label class="btn btn-default btn-md"><input type="radio" name="operator" autocomplete="off" value="OFF">off</input></label>'+
                '</div></div>';
        }
        else{
            str='<div class="col-md-12 col-md-12" align="center"><div class="btn-group" data-toggle="buttons" id="voice_mode" align="center">'+
                '<label class="btn btn-default btn-md "><input type="radio" name="operator" autocomplete="off" value="ON">on</input></label>'+
                '<label class="btn btn-default btn-md active"><input type="radio" name="operator" autocomplete="off" value="OFF">off</input></label>'+
                '</div></div>';
        }

        var str1;
        if(data.smart_mode=="OFF"){
            str1='<div class="btn-group" data-toggle="buttons" id="smart_mode" style="word-break:nowrap;">'+
                 '<label class="btn btn-default btn-sm active"><input type="radio" name="operator" autocomplete="off" value="OFF">off</input></label>'+
                 '<label class="btn btn-default btn-sm" style="white-space:nowrap;"><input type="radio" name="operator" autocomplete="off" value="Sensor_Mode">Sensor_Mode</input></label>'+ 
                 '<label class="btn btn-default btn-sm" style="white-space:nowrap;"><input type="radio" name="operator" autocomplete="off" value="AI_Mode">AI_Mode</input></label>'+                                         
                 '</div>';
        }else if(data.smart_mode=="Sensor_Mode"){
            str1='<div class="btn-group" data-toggle="buttons" id="smart_mode" style="word-break:nowrap;">'+
                 '<label class="btn btn-default btn-sm "><input type="radio" name="operator" autocomplete="off" value="OFF">off</input></label>'+
                 '<label class="btn btn-default btn-sm active" style="white-space:nowrap;"><input type="radio" name="operator" autocomplete="off" value="Sensor_Mode">Sensor_Mode</input></label>'+ 
                 '<label class="btn btn-default btn-sm" style="white-space:nowrap;"><input type="radio" name="operator" autocomplete="off" value="AI_Mode">AI_Mode</input></label>'+                                         
                 '</div>';
        }else if(data.smart_mode=="AI_Mode"){
            str1='<div class="btn-group" data-toggle="buttons" id="smart_mode" style="word-break:nowrap;">'+
                 '<label class="btn btn-default btn-sm "><input type="radio" name="operator" autocomplete="off" value="OFF">off</input></label>'+
                 '<label class="btn btn-default btn-sm" style="white-space:nowrap;"><input type="radio" name="operator" autocomplete="off" value="Sensor_Mode">Sensor_Mode</input></label>'+ 
                 '<label class="btn btn-default btn-sm active" style="white-space:nowrap;"><input type="radio" name="operator" autocomplete="off" value="AI_Mode">AI_Mode</input></label>'+                                         
                 '</div>';
        }

        var str2='<br><label>Smart Mode</label>';
        // container1.append('<label>Action Mode</label>');
        // container2.append('<br><label>Voice Mode</label>')
        // container3.append(str);
        // container5.append(str1);
       // container2.append('<div class="btn-group" data-toggle="buttons" id="rgbBtns"></div>');

       if(smart_control==1 || voice_control==1){
        container1.append('<br><label>Action Mode</label>');
        if(smart_control==1){
            container4.append(str2);
            container5.append(str1);
        }
        else{
            container5.append('<br><label>Smart Mode is not defined</label>');
        }

        if(voice_control==1){
            container2.append('<br><label>Voice Mode</label>');
            container3.append(str);
        }
        else{
            container2.append('<br><label>Voice Mode is not defined</label>');
        }

       }
       else{
       
        container6.append('<br><label>Action Mode is not defined</label>');
       }
     

        var sForm = $('#lightControlTab');
        sForm.find('#bright-temperature').val(data.brightness);
        sForm.find('#temperature').val(data.temperature);

        // View Mode
        //if(edit_mode == 0){
        // Set Spectrum
        var spec = Form.find('#flat').spectrum({
            color : rgbToHex(data.red,data.green,data.blue),
            flat: true,
            showInput: true,
            clickoutFiresChange: true,
            preferredFormat: "rgb",
            chooseText: '선택',
            move: function(color) {
                if (Modify_Mode == 1) {

                    if(Now_Case_Id <= 0){
                        alert("먼저 케이스를 선택해 주세요.");
                        return;
                    }

                    // Data
                    var case_data = {
                        light_id : light_id,
                        case_id : Now_Case_Id,
                        room_id : room_id,
                        light_order : 1,    // 수정 요망
                        intensity : 0,      // 수정 요망
                        red : color.toRgb().r,
                        green : color.toRgb().g,
                        blue : color.toRgb().b,
                        color_mode : 1,     // 0 : BW, 1 : RGB
                    };

                    SetDetailCase (light_id, case_data);
                }
                data.red = color.toRgb().r;
                data.green = color.toRgb().g;
                data.blue = color.toRgb().b; 
                                
                 // BLE 통신으로 컨트롤 할 때는 여기에 들어오지 않음. 고로 off
                //setLight(light_id, color.toRgb().r,color.toRgb().g,color.toRgb().b, 0);
            }
        });
        $('#save_chages').attr("onclick","saveLight("+data.light_id+","+data.room_id+");");
        $('#selected').html(data.light_name);
        
    });
}

// Add Room 
function SubmitRoomInformation(){  // 룸 정보 보내! 그리고 Load Room Information 호출

    // Dom
    var Dom = $('#active_add_room_form');

    // Data
    var Data = {
        room_name : Dom.find('#room_name').val(),
        room_exp : Dom.find('#room_exp').val()
    };

    // 서버랑 통신 및 등록 처리
    $.ajax({
        type: "post",
        url : BASE_URL+API_URL+"room",
        timeout : 2000,
        data : Data,
        success: function(data){
            // 화면 갱신
            LoadRoomInformation();
        },
        error: function(err){
            toastr.warning(err.responseJSON.message);
        }
    });

    CloseDialog();
}
function SubmitRegisterThing(){ // 제목 그대로ㅎㅎ 
  
    var Dom = $('#active_add_thing_form');
    var DDDom=$('#thing_type_view');

    var DDom=$('#add_thing_form');
    var Data = {
        thing_type : DDom.find('#add_thing_type').val(),
        thing_mac : Dom.find('#thing_mac').val(),
        thing_name : Dom.find('#thing_name').val(),
        room_id : DDom.find('#add_thing_roomid').val(),
    };
    console.log(Data.thing_type);

    $.ajax({
        type: "post",
        url : BASE_URL+API_URL+"things/register",
        timeout : 2000,
        data : Data,
        success: function(data){
            console.log("success");
            LoadThings(Data.room_id);
        },
        error: function(err){
            console.log("dddddddddd");
            //toastr.warning(err.responseJSON.message);
        }
    });
    CloseDialog();
}
function SubmitRegisterExThing(){ // 등록 위한 외부thing 정보 보내기
  
    var Dom = $('#add_Ex_thing_form');

    //var DDom=$('#add_thing_form');
    var Data = {
        thing_name : Dom.find('#Ex_thing_name').val(),
        t_id : Dom.find('#add_Ex_thing_id').val(),
        thing_type : Dom.find('#add_Ex_thing_type').val(),
    };
    console.log(Data.thing_name);
    console.log(Data.t_id);
    console.log(Data.thing_type);

    $.ajax({
        type: "post",
        url : BASE_URL+API_URL+"Exthings/register",
        timeout : 2000,
        data : Data,
        success: function(data){
            console.log("success");
           
        },
        error: function(err){
            console.log("dddddddddd");
            //toastr.warning(err.responseJSON.message);
        }
    });
    CloseDialog();
}
function SubmitRegisterLight(){ // 제목 그대로 light 정보 서버에 보내기 post는 보내는거 get은 받는거
    var Dom = $('#Light_Register_Form');

    var Data = {
        Light_name : Dom.find('#Light_name').val(),
        room_name : Dom.find('#room_name').val(),
        light_id : Dom.find('#lightId').val()
    };

    $.ajax({
        type: "post",
        url : BASE_URL+API_URL+"Light/register",
        timeout : 2000,
        data : Data,
        success: function(data){
            console.log("success");
        },
        error: function(err){
            console.log("dddddddddd");
            //toastr.warning(err.responseJSON.message);
        }
    });
    CloseDialog();
}

function ViewAddRoom(){ //add room form 띄우기
    // AddCase Form
    var Add_Room_Form = $('#add_room_form').clone().show();
    Add_Room_Form.attr('id','active_add_room_form');

    $.blockUI({
        message: Add_Room_Form,
        css : {
            width : '75%',
            height : '300px',
            top : '25%',
            left : '12.5%',
            padding : '5px',
            border : '0px',
            borderRadius : '5px',

        },

    });
}
function ThingAdd(room_id){ 
    LoadThingsType();
    ViewAddThing(room_id);
}
function External_ThingAdd(room_id){
    ViewAddExternal_Thing(room_id);
}

function ViewAddThing(room_id){ //add thing 폼 띄우기
    // AddThing Form

    var Add_Thing_Form = $('#add_thing_form').clone().show();
    Add_Thing_Form.attr('id','active_add_thing_form');

    $.blockUI({ message : Add_Thing_Form,
        css : {
                width : '50%',
                height : '600px',
                top : '5%',
                left : '25%',
                padding : '5px',
                border : '0px',
                borderRadius : '5px',
        },

    });
    $('#add_thing_roomid').val(room_id);
    
}
function ViewAddExternal_Thing(t_id){ //add external 폼 띄우기
    // AddThing Form
    var Add_Thing_Form = $('#add_Ex_thing_form').clone().show();
    Add_Thing_Form.attr('id','active_add_Ex_thing_form');

    $.blockUI({ message : add_Ex_thing_form,
        css : {
                width : '40%',
                height : '400px',
                top : '5%',
                left : '30%',
                padding : '5px',
                border : '0px',
                borderRadius : '5px',
        },

    });
    $('#add_Ex_thing_id').val(t_id);
}

function ViewAddLight(lightId){ //light 등록 폼 띄우기
    var Add_Light_Form=$('#Light_Register_Form').clone().show();
    Add_Light_Form.attr('id','active_Light_Register_Form');
    $('#lightId').val(lightId);

    $.blockUI({ message : Light_Register_Form,
        css: {
           width : '45%',
           height : '450px',
           top : '5%',
           left : '25%',
           padding : '5px',
           border : '0px',
           borderRadius : '5px',

        },
    });
}

function LoadThingsType(){ //서버에게 spec 정보 달라 요청
       $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"things/type",
        timeout : 2000,
        success: function(data){
            UpdateThingsType(data);
            UpdateRegistThingsType(data);
        },
        error: function(err){
            console.log(err)
        }
    });
}


function ViewMoreInfo(roomid){ //제목그대로
    LoadLights(roomid);
    LoadRoomInfo(roomid);
    LoadThings(roomid);
}

function ViewRoomInfo(){ //제목그대로
    // AddThing Form

    var Room_Info_Form = $('#room_info_form').clone().show();
    Room_Info_Form.attr('id','active_room_info_form');


    $.blockUI({ message : Room_Info_Form,
        css : {
                width : '75%',
                height : '600px',
                top : '5%',
                left : '12.5%',
                padding : '5px',
                border : '0px',
                borderRadius : '5px',
        },
        onBlock: null,
    });
    //var zIndex=$('div:regex(class,^blockUI.blockMsg.blockPage$)').css('z-index');
    
}


function CloseDialog(){
    setTimeout($.unblockUI, 50);
}



function ViewAddCase(){
    // AddCase Form
    var Add_Case_Form = $('#add_case_form').clone().show();
    Add_Case_Form.attr('id','active_add_case_form');

    $.blockUI({
        message: Add_Case_Form,
        css : {
            width : '75%',
            height : '200px',
            top : '25%',
            left : '12.5%',
            padding : '5px',
            border : '0px',
            borderRadius : '5px',

        }
    });

    //setTimeout($.unblockUI, 2000);
}

function UpdateCaseView(data){

    var container = $('#case');

    // Empty
    container.empty();


    for(var i = 0 ; i < data.length ; i++){
        var option = $('<option value = "'+data[i].case_id+'">' + data[i].case_name + '</option>');
        container.append(option);
    }

    container.selectmenu({
        width : 240,
        change : function(event, data){

            Now_Case_Id = data.item.value;
            DoCase(data.item.value);
        }
    });

    container.selectmenu('refresh');

}

function LoadCaseInformation(){
    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"case",
        timeout : 2000,
        success: function(data){
            UpdateCaseView(data);
        },
        error: function(err){
            console.log(err)
        }
    });
}
function UpdateThingListView(room_id,data){ //제목그대로
    var container = $('#thingControlTab').find('.thingView');
    container.empty();
    //var Room_id=room_number;

   //console.log(data);

    if(data == null || data.length == 0){
         var Adding_Msg = $('<span class = "adding_meesage">새로운 thing을 등록해주세요</span>');
        container.append(Adding_Msg);
        return;
    }

    for(var i=0; i<data.length; i++){
        console.log(data[i].image);
    
        var thing_container=$('<div class= "bulb_container"></div>');
        var thing_icon = $('<input class="thingimgg" type="image" src=' + data[i].image + '>');
        //var thing_tag=$('<span class= "thing_tag">' + data[i].t_name+'</span>');

        thing_container.append(thing_icon);
        thing_container.append(" ");
        //thing_container.append(thing_tag);

        container.append(thing_container);
    }
    
}

function j_test(data){
    console.log(data);
    
    $('#add_thing_type').val(data);
    $('#add_Ex_thing_type').val(data);

    //$('#add_thing_roomid').val(room_id);
}

function UpdateThingsType(data){ //제목그대로
    var container=$('#thing_add').find('.thing_type_view');
    container.empty(); 

       for(var i=0; i<data.length; i++){
           if(data[i].image=="Assets/img/car.png"){
            continue;
        }
        var type=data[i].t_type;

        var thing_container=$('<div class= "bulb_container"></div>');
        var thing_icon = $('<input class="thingimg" value= '+data[i].t_type+' onclick="j_test('+"value"+')" type="image" src=' + data[i].image + ' >');
        //var thing_tag=$('<span class= "thing_tag">' + data[i].t_name+'</span>');

        thing_container.append(thing_icon);
        thing_container.append(" ");
        //thing_container.append(thing_tag);

        container.append(thing_container);
    }
}

function UpdateRegistThingsType(data){ //제목그대로
    var container=$('#Ex_thing_add').find('#Exthing_add');
    container.empty(); 

       for(var i=0; i<data.length; i++){
       
        var type=data[i].t_type;

        var thing_container=$('<div class= "bulb_container"></div>');
        var thing_icon = $('<input class="thingimg" value= '+data[i].t_type+' onclick="j_test('+"value"+')" type="image" src=' + data[i].image + ' >');
        //var thing_tag=$('<span class= "thing_tag">' + data[i].t_name+'</span>');

        thing_container.append(thing_icon);
        thing_container.append(" ");
        //thing_container.append(thing_tag);

        container.append(thing_container);
    }
}
function UpdateLightListView(room_number, data){ //제목그대로

    //var container = $('#lightControlTab').find("[data-room_id='" + room_number + "']");
    var container = $('#lightControlTab').find('.lightView');
    //container = container.find('.bulb_layer');
    container.empty();

    var Room_id=room_number;
    //var Room_id = container.parent().data('room_id');
    // Exception
    if(data == null || data.length == 0)
    {
        var Adding_Msg = $('<span class = "adding_meesage">새로운 등을 등록해주세요.</span>');
        container.append(Adding_Msg);
        return;
    }
    
    for(var i = 0 ; i < data.length ; i++){

        if(data[i].smart_control=='Yes'){
            data[i].smart_control=1;
        }
        else if(data[i].smart_control=='No'){
            data[i].smart_control=0;
        }
        else {
            data[i].smart_control=null;
        }


        if(data[i].voice_control=='Yes'){
            data[i].voice_control=1;
        }
        else if(data[i].voice_control=='No'){
            data[i].voice_control=0;
        }
        else{
            data[i].voice_control=null;
        }
        
        var bulb_container = $('<div class = "bulb_container" onclick = "ViewEditBulb('+ Room_id +',' + data[i].light_id +','+data[i].smart_control+','+data[i].voice_control+')"></div>');
        
        var bulb_icon;
        if(data[i].device_state=='ON')bulb_icon = $('<div><input class="lightimg" type="image" src="Assets/img/light2.png"><span>'+data[i].light_name+'</span></div>');
        else bulb_icon= $('<div><input class="lightimg" type="image" src="Assets/img/light1.png"><span>'+data[i].light_name+'</span></div>');
        //var bulb_tag = $();

        bulb_container.append(bulb_icon);
        bulb_container.append(" "); // 171116
        //bulb_container.append(bulb_tag);

        container.append(bulb_container);

        // Edit Color Window 보여주기
    }

}

function LoadLights(room_number){ //제목그대로 room id 에 따른 light 정보 가져와서 update light list view호출
    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"rooms/"+room_number+'/lights',
        timeout : 2000,
        success: function(data){
            UpdateLightListView(room_number, data);
        },
        error: function(err){
            console.log(err)
        }
    });
}
function LoadThings(room_number){ //room id 에 따른 thing 정보 가져와서 update thing list view호출
    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"rooms/"+room_number+'/things',
        timeout : 2000,
        success: function(data){
            UpdateThingListView(room_number,data);
        },
        error: function(err){
            console.log(err)
        }
    });
}

function LoadRoomInfo(room_number){ //room id에 따른 정보 호출 ajax는 왠만하면 서버코드랑 같이 보는게 좋다.
    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"rooms/"+room_number,
        timeout : 2000,
        success: function(data){
            UpdateRoomInfoView(data);
        },
        error: function(err){
            console.log(err)
        }
    });
}
function LightCount(room_number){ //방의 light 개수
   var count;
    $.ajax({
        type: 'get',
        url : BASE_URL+API_URL+"rooms/light/count/"+room_number,
        timeout : 2000,
        async: false,
        success : function(data){
            count=data.count;
        },
        error: function(err) {
            console.log(err);
            /* Act on the event */
        }


    });
    return count;
}
function ThingCount(room_number){ //방의 thing 개수
    var count;
    $.ajax({
        type: 'get',
        url : BASE_URL+API_URL+"rooms/thing/count/"+room_number,
        timeout : 2000,
        async: false,
        success : function(data){
            count=data.count;
        },
        error: function(err) {
            console.log(err);
            /* Act on the event */
        }
    });
    return count;
}


function UpdateRoomInfoView(data){
    var container=$('.room_info');
    container.find('#roomid').html(data.room_id);
    container.find('#roomname').html(data.room_name);
    document.getElementById('myRoomLabel').innerHTML=data.room_name;
    container.find('#roomexp').html(data.room_explain);
}


function loadDevice(id,callback){ //device선택했을때 해당 디바이스의 property 정보 알려줘!
    $('#'+id+'device').empty();
    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"devices/"+$('#'+id+'room').val(),
        timeout : 2000,
        success: function(data){
            if($('#'+id+'room').val()==13)$('#'+id+'device').append('<option flag="w" value="weather">weatherAPI</option>'); //weather만 예외 준다.
            for(var i=0;i<data[0].length;i++){
                $('#'+id+'device').append('<option flag="t" value="t'+data[0][i].t_id+'">'+data[0][i].t_name+'</option>');
            }
            for(var i=0;i<data[1].length;i++){
                $('#'+id+'device').append('<option flag="s" value="l'+data[1][i].light_id+'">'+data[1][i].light_name+'</option>');
            }

            loadProperty(id);
            console.log("1");
            callback();

        },
        error: function(err){
            console.log(err);
        }
    });
}

function onChangeWeather(property){ //날씨 select box 바뀔때...?
    console.log('onchangeweather');
    var container;
    var str1,str2;
  
    container=$('#constraintTab').find('#if_value');//
    container.empty();
    //     <select class="form-control" name="device" onchange="loadProperty('if');" id="ifdevice" value=""></select>
    if( property==('weather_today') || property==('weather_tomorrow'))  {
        $('.btn-group > .btn').removeClass('active')  
        $('.btn-group > .btn').eq(4).addClass('active');
        str2='<option value="비">비</option>'+'<option value="진눈깨비">진눈깨비</option>'+'<option value="눈">눈</option>'+'<option value="맑음">맑음</option>'+'<option value="구름조금">구름조금</option>'+'<option value="구름많음">구름많음</option>'+'<option value="흐림">흐림</option>';        
        $('#selectValue').show();
        $('#inputValue').hide();
    }
    else if(property=='fineDust_today'|| property=='fineDust_tomorrow'|| property=='ultrafineDust_today'|| property=='ultrafineDust_tomorrow'){
        $('.btn-group > .btn').removeClass('active')  
        $('.btn-group > .btn').eq(4).addClass('active');
        str2='<option value="좋음">좋음</option>'+'<option value="보통">보통</option>'+'<option value="나쁨">나쁨</option>'+'<option value="매우나쁨">매우나쁨</option>';
        $('#selectValue').show();
        $('#inputValue').hide();
    }
    else{
        $('#selectValue').hide();
        $('#inputValue').show();
    }

    container.append(str2);

}

function loadProperty(id){ //제목그대로
    $('#'+id+'property').empty();
    $('#editProperty').empty();
    $('#selectValue').hide();
    $('#inputValue').show();
    //console.log($('#'+id+'device'));
    if($('#'+id+'device').val()!=null){ //거의 하드코딩임.....
        if($('#'+id+'device option:selected').attr('flag')=='t'){
            $.ajax({
                type: "get",
                url : BASE_URL+API_URL+"properties/"+$('#'+id+'device').val().substring(1),
                timeout : 2000,
                success: function(data){
                    if(id=='if'){
                        var i=data.t_count;
                        if(i!=0){$('#'+id+'property').append('<option value="'+i+'">'+data.s_property_1+'</option>');i--;}
                        if(i!=0){$('#'+id+'property').append('<option value="'+i+'">'+data.s_property_2+'</option>');i--;}
                        if(i!=0){$('#'+id+'property').append('<option value="'+i+'">'+data.s_property_3+'</option>');i--;}

                        if(data.s_property_1=='isDetect'){
                            var container=$('#constraintTab').find('#if_value');
                            container.empty();

                            $('.btn-group > .btn').removeClass('active')  
                            $('.btn-group > .btn').eq(4).addClass('active');
                            
                            var str2='<option value="0">OFF</option>'+'<option value="1">ON</option>';        
                            
                            $('#selectValue').show();
                            $('#inputValue').hide();
                            container.append(str2);
                        }
                    }
                    else{
                        var i=data.t_count;
                        if(i!=0){
                            //console.log(">"+data.s_property_1.indexOf('binary'));
                            if(data.s_property_1.indexOf('binary')>=0)
                                $('#editProperty').append('<span style="display : inline-block;width: 30%" >'+data.s_property_1+' : </span>'
                                    +'<input class="toggle-demo" data-width="35%" data-size="mini" name="property1" type="checkbox" data-on="Active" checked data-off="Deactive" data-toggle="toggle" data-onstyle="success" data-offstyle="danger" value='+data.property_1+'><br>');
                            else
                                $('#editProperty').append('<span style="display : inline-block;width: 30%" >'+data.s_property_1
                                    +'</span><input type="range" name="property1" value = "'+data.property_1+'" id="bright-temperature" max = "100" min = "0" />');
                            i--;
                        }
                        if(i!=0){
                            if(data.s_property_2.indexOf('binary')>=0)
                                $('#editProperty').append('<span style="display : inline-block;width: 30%" >'+data.s_property_2+' : </span>'
                                    +'<input class="toggle-demo" data-width="35%" data-size="mini" name="property2" type="checkbox" data-on="Active" checked data-off="Deactive" data-toggle="toggle" data-onstyle="success" data-offstyle="danger" value='+data.property_2+'><br>');
                            else
                                $('#editProperty').append('<span style="display : inline-block;width: 30%" >'+data.s_property_2
                                    +'</span><input type="range" name="property2" value = "'+data.property_2+'" id="bright-temperature" max = "100" min = "0" />');
                            i--;
                        }
                        if(i!=0){
                            if(data.s_property_3.indexOf('binary')>=0)
                                $('#editProperty').append('<span style="display : inline-block;width: 30%" >'+data.s_property_3+' : </span>'
                                    +'<input class="toggle-demo" data-width="35%" data-size="mini" name="property3" type="checkbox" data-on="Active" checked data-off="Deactive" data-toggle="toggle" data-onstyle="success" data-offstyle="danger" value='+data.property_3+'><br>');
                            else
                                $('#editProperty').append('<span style="display : inline-block;width: 30%" >'+data.s_property_3
                                    +'</span><input type="range" name="property3" value = "'+data.property_3+'" id="bright-temperature" max = "100" min = "0" />');
                            i--;
                        }
                    }  
                    $('.toggle-demo').bootstrapToggle();            
                    
                },
                error: function(err){
                    console.log(err)
                }
            });
        }
        else if($('#'+id+'device option:selected').attr('flag')=='w'){
            $('#'+id+'property').append('<option value="weather_today">오늘 날씨</option>');
            $('#'+id+'property').append('<option value="temperature_today">오늘 온도</option>');
            $('#'+id+'property').append('<option value="humidity_today">오늘 습도</option>');
            $('#'+id+'property').append('<option value="fineDust_today">오늘 미세먼지</option>');
            $('#'+id+'property').append('<option value="ultrafineDust_today">오늘 초미세먼지</option>');
            $('#'+id+'property').append('<option value="weather_tomorrow">내일 날씨</option>');
            $('#'+id+'property').append('<option value="temperature_tomorrow">내일 온도</option>');
            $('#'+id+'property').append('<option value="humidity_tomorrow">내일 습도</option>');
            $('#'+id+'property').append('<option value="fineDust_tomorrow">내일 미세먼지</option>');
            $('#'+id+'property').append('<option value="ultrafineDust_tomorrow">내일 초미세먼지</option>');
            $('#'+id+'property').attr("onclick","onChangeWeather(this.value);");
        }
        else{
            if(id=='then')ViewEditBulb($('#'+id+'room').val(),$('#'+id+'device').val());
            else{
                $('#'+id+'property').append('<option value="1">bright</option>');
                $('#'+id+'property').append('<option value="2">temperature</option>');
            }
            //$('#modeBtn').val($('#'+id+'device').val());
        }
        
    }
}

function saveCondition(){ //rule에서 조건 부분 저장
    if ( $('#constraintTab').hasClass('active') )
    {
        var data={};
        $('#ifModal').serializeArray().map(function(x){if(x.name=='value'&&x.value=='')return;data[x.name] = x.value;});    
        data.operator=$('#if_operator label.active input').val();
        ifAry.push(data);
        
        var Data={
            room_id: data.room,
            device: data.device,
            property: data.property,
        }

        console.log(data);
  
        var string;
        console.log(Data);
        // if(data.device=='weather'){
        //     string=
        // }
        $.ajax({
            type: "get",
            url : BASE_URL+API_URL+"GetNames/"+data.room+"/"+data.device+"/"+data.property,
            data : Data,
            timeout : 2000,
            async: false,
            success: function(d){
                console.log('gooddddddddddddd');
                console.log(d);
                string=d.room_name+"'s device "+d.light_thing_name+" "+d.real_property;
                if(data.device=='weather')string=d.room_name+"'s "+data.device+" "+data.property;

                if(d.real_property=='isDetect'){
                    console.log("___________");
                    var v
                    if(data.value==1)v="ON";
                    else v="OFF";

                    string+=" "+data.operator+v;
                }
                else
                    string+=" "+data.operator+data.value;

            },
            error: function(err){
                console.log('errrrrrrrrrrr');
            }
        });


        //string="room"+data.room+"'s device "+data.device+"'s property"+data.property+" "+data.operator+data.value;
        console.log(string);
        var condition='<span class="form-control condition">'+string
                            +'<button type="button" class="btn btn-default btn-circle btn-xs">'
                                +'<i class="fa fa-minus"></i>'
                            +'</button>'
                        +'</span>';
        $('#ifBoard').append(condition);
    }

    else //clock
    {
        var data={};
        $('#clockModal').serializeArray().map(function(x){data[x.name] = x.value;});
        data.detail=$('#'+data.type).val();
        var string="Repeat("+data.repeat+")  "
            +data.type+"  ";
        if(data.type=="onTime"){
            data.detail=data.detail+" "+$("#onTime2").val();
            string=string+data.detail;
        }else string=string+data.detail+" min";
        var condition='<span class="form-control condition">'+string
                        +'<button type="button" class="btn btn-default btn-circle btn-xs">'
                            +'<i class="fa fa-minus"></i>'
                        +'</button>'
                    +'</span>';
        ifAry.push(data);
        $('#ifBoard').append(condition);
    }
    
}

function saveAction(){ //rule에서 action부분
    var data={};
    $('#thenModal').serializeArray().map(function(x){data[x.name] = x.value;});
    $.each($('#thenModal input[type=checkbox]')
        .filter(function(idx){
            return $(this).prop('checked')===false
        }),
        function(id,el){
            var emptyVal="0";
            data[$(el).attr('name')]= emptyVal;
        }
    );
    data['mode']=$('#modeBtn').val();
    data['all_light_off']=$('#all_off_btn').val();
    data['systemNoti']=$('#notify').val();

    if($('#thenrgbBtns label').hasClass('active')){
        var str=$('#thenrgbBtns label.active input').val().split(',');
        data['color0']='rgb('+$('#thenrgbBtns label.active input').val()+')';
    }

    console.log(data);
    thenAry.push(data);
    var condition='<span class="form-control condition">'+data.description
                        +'<button type="button" class="btn btn-default btn-circle btn-xs">'
                            +'<i class="fa fa-minus"></i>'
                        +'</button>'
                    +'</span>';
    $('#thenBoard').append(condition);
}

function saveRulenEdit(){ //제목 그대로..
    var Data=$(".modal-body > .addrule").serialize();

    $.ajax({
            type: "post",
            url : BASE_URL+API_URL+"addrule",
            data : Data,
            timeout : 2000,
            success: function(data){
                location.href=BASE_URL+"addRules?ruleid="+data.rule_id;
            },
            error: function(err){
                toastr.warning(err);
            }
        });
}

function saveRuleDetail(){  //제목 그대로
    $.ajax({
            type: "post",
            url : BASE_URL+API_URL+"savedetails?ruleid="+ruleid,
            data : {'if': JSON.stringify(ifAry),
                    'then' : JSON.stringify(thenAry),
                    'rulename': document.getElementById('ruleName').innerHTML} ,
            timeout : 2000,
            success: function(data){
                alert("룰 등록 완료");
                setTimeout(function(){
                    toastr.success("룰 등록 완료");
                }, 1000);
                location.href=BASE_URL+"rules";
            },
            error: function(err){
                toastr.warning(err.responseJSON.message);
            }

    });
}

function ruledelete(id){
    console.log(id);
    if(confirm("Are you sure?")!=0){
        $.ajax({
            type: "post",
            url : BASE_URL+API_URL+"deleteRule",
            data:{'id': id},
            timeout : 2000,
            success: function(data){
                location.reload();
            },
            close: function(){

            }
        });
    };
    
}

function LoadWeather(){ //제목 그대로
    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"weather",
        timeout : 2000,
        success: function(data){
            $('#weatherToday').empty();
            var str='<table style="width : 80%">'+
                '<tbody><th>오늘</th>'+
                '<tr><td>날씨</td><td>'+data.weather_today+'</td>' +
                '<tr><td>온도</td><td>'+data.temperature_today+'</td>' +
                '<tr><td>습도</td><td>'+data.humidity_today+'</td>' +
                '<tr><td>미세먼지</td><td>'+data.fineDust_today+'</td>' +
                '<tr><td>초미세먼지</td><td>'+data.ultrafineDust_today+'</td>' +
                '</tbody></table>';
            $('#weatherToday').append(str);

            $('#weatherTomorrow').empty();
            var str='<table style="width : 80%">'+
                '<tbody><th>내일</th>'+
                '<tr><td>날씨</td><td>'+data.weather_tomorrow+'</td>' +
                '<tr><td>온도</td><td>'+data.temperature_tomorrow+'</td>' +
                '<tr><td>습도</td><td>'+data.humidity_tomorrow+'</td>' +
                '<tr><td>미세먼지</td><td>'+data.fineDust_tomorrow+'</td>' +
                '<tr><td>초미세먼지</td><td>'+data.ultrafineDust_tomorrow+'</td>' +
                '</tbody></table>';
            $('#weatherTomorrow').append(str);
        },
        error: function(err){
            console.log(err)
        }
    });
}
function LoadCar(){ //제목 그대로 차도 예외..
    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"car",
        timeout : 2000,
        success: function(data){
            var container=$('#carTab').find('#Car_Ex');
            container.empty();
            console.log(data);
         //   var str='<div class="col-md-6"></div>';
            for(var i=0;i<data.length;i++){
                var str;
                if(data[i].state=='ON'){
                    if( (data[i].property_1)=='1'){
                        str='Assets/img/car_state_on_1.png';
                    }
                    else if( (data[i].property_1)=='0'){
                        str='Assets/img/car_state_on.png';
                    }
                    else{
                        console.log("err!!!!!!!")
                        return;
                    }
                }
                else if(data[i].state=='OFF'){
                    str='Assets/img/car_state_off.png';
                }
                else{
                    console.log("err222222!!!!!!!")
                    return;

                }

                var st;
                if(data[i].property_1=='1') st="IN";
                else st="OUT";
                //<img class="btn-img" src="Assets/img/light2.png" style="display: block" /><%=Light_data[i].light_id%>
                var car_container=$('<div class="col-md-6"></div>');
                var car_icon=$('<input class="carimg" type="image" style="display: block" src='+str+'><label>'+data[i].t_name+'</label></input><br><div style="font-size:0.8em">연결 : <span>'+data[i].state+'</span><br>차량 상태 : <span>'+st+'</span></div>');

                car_container.append(car_icon);
                car_container.append(" ");

                container.append(car_container);
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}

function ViewEditExThing(){ //제목 그대로
    LoadWeather();
    LoadCar();
}

function sssss(roomid,check){ //all light 관련
    $.ajax({
            type: "post",
            url : BASE_URL+API_URL+"all_lights",
            data : {
                roomid: roomid,
                check: check
            } ,
            timeout : 2000,
            success: function(data){
                if(check)toastr.success('방의 모든 등이 켜졌습니다.');
                else toastr.success('방의 모든 등이 꺼졌습니다.');
            },
            error: function(err){
                toastr.warning(err.responseJSON.message);
            }

    });
}

function UpdateRoomListView(data){ //제목 그대로
    LoadThingsType();

    var container = $('#room_list');
    var next=0;
    var Light_count;
    var Thing_count=0;
    var inum;
    // Empty
    container.empty();

    if(data!=null){
        for(var i = 0 ; i < data.length ; i++){
            Light_count=LightCount(data[i].room_id);
            Thing_count=ThingCount(data[i].room_id);
            
            
            if(next%3==0){
                container.append('<div class="row">');
            }
            
            var room_object = $('<div id = "r' + next +  '" class = "room"></div>');
            room_object.attr('data-room_id', data[next].room_id);

            if(data[i].room_name=='External_thing'){
                inum=i;
                continue;
            }
            
            
        
            var room_panel=$('<div class="col-xs-6 col-md-4"></div>');
            room_panel.append('<div class="panel panel-info"><div class="panel-heading room_name" style="font-family:impact; white-space:nowrap;">' + 
                '<table width="100%">'+
                    '<tr>'+
                        '<td width="33%">' + "</td>" +
                        '<td width="33%">' +data[i].room_name+ '</td>' +
                        '<td width="16.5%" style="text-align:right;">'+'<button type="button" data-toggle="modal" onclick="ThingAdd('+data[i].room_id+')" class="btn btn-default btn-circle btn-md"><i class="fa fa-ambulance"></i></button></div>' + '</td>' +
                        '<td width="16.5%" style="text-align:center;">' + '<button type="button" data-toggle="modal" data-target="#room_info_form"  onclick="ViewMoreInfo('+data[i].room_id+');" class="btn btn-default btn-circle btn-md"><i class="fa fa-cog"></i></button></div>' + '</td>' +
                    '</tr>' + 
                '</table>' + '</div>' +
                '<div class="row panel-body mypanel bulb_layer" margin-top:10px;><div class="col-xs-6 col-md-4" align="left"><i class=" fa fa-lightbulb-o fa-2x"></i> Light : '+Light_count+'</div>'+
                '<div class="col-xs-6 col-md-4" align="left" "><i style="margin-top: 2px;" class="fa fa-desktop fa-2x" ></i> Thing : '+Thing_count+'</div>'+
                '<div class="col-xs-6 col-sm-4" align="right" style="margin-top: 2px;"><input class="toggle-demo" id="toggle'+data[i].room_id+'" style="margin-top: 10px;" type="checkbox" checked data-toggle="toggle"  align="left" data-size="small" data-onstyle="info" data-offstyle="danger"></div></div></div></div>');
            //<button type="button" style="width:77%;" onclick="location=\' '+BASE_URL+'addRules\'" class="btn btn-default btn-sm">+Rule</button>
             //<br><i class=" fa fa-desktop fa-2x"></i> Thing : '+Thing_count+'</div>'
               // '</div>'+ '<div class="row"><div class="col-xs-6 col-sm-4">Light : </div><div class="col-xs-6 col-sm-4"><button type="button" class="btn btn-primary btn-lg active">Active</button></div><div class="col-xs-6 col-sm-4"><button type="button" class="btn btn-default btn-lg active">+Thing</button></div></div>'
               //  +'<div class="row"><div class="col-xs-6 col-sm-4">Thing : </div><div class="col-xs-6 col-sm-4"><button type="button" class="btn btn-danger btn-lg active">Deactive</button></div><div class="col-xs-6 col-sm-4"><button type="button" class="btn btn-default btn-lg active">+Rule </button></div></div></div>');
            
               //<button type="button" class="btn btn-danger btn-sm">Deactive</button>

            //'<div class = "panel-body mypanel bulb_layer"></div></div>
          
            room_object.append(room_panel);


            //LoadLights(data[i].room_id);
            container.append(room_object);
            $('.toggle-demo').bootstrapToggle({
                on: 'Active',
                off: 'Deactive'
            });
            var id=data[i].room_id;
            $('#toggle'+id).change(function(){
                sssss($(this).prop('id'),$(this).prop('checked'));
            });

        // Edit Color Window 보여주기

        next++;
    }
}
    

    var external_thing = $('<div id = "r' + i +  '" class = "external_thing"></div>');

    var room_panel=$('<div class="col-md-4 col-sm-4"></div>');
    room_panel.append('<div class="panel panel-success"><div class="panel-heading room_name"  style="font-family:Verdana;">' +'<table width="100%">'+
                '<tr>'+
                    '<td width="33%">' + "</td>" +
                    '<td width="33%">' +data[inum].room_name+ '</td>' +
                    '<td width="16.5%" style="text-align:right;">'+'</div>' + '</td>' +
                    '<td width="16.5%" style="text-align:center;">' + '<button type="button" onClick="ViewEditExThing();" data-toggle="modal" data-target="#external_form"  class="btn btn-default btn-circle btn-md"><i class="fa fa-cogs"></i></button></div>' + '</td>' +
                '</tr>' + 
            '</table>'
        + '</div><div class = "panel-body mypanel bulb_layer row"><div class="row"><div class="col-md-6 col-xs-6"><i class="fa fa-car fa-3x"></i> </div><div class="col-md-6 col-xs-6"><i class="fa fa fa-umbrella fa-3x"></i> </div><div></div>');
    external_thing.append(room_panel);
        
    container.append(external_thing);
    // Make New Room Button
    var New_Room_Button = $('<div id = "r' + (i+1)+  '" class = "room" onclick = "ViewAddRoom()"></div>');

    var room_panel=$('<div class="col-md-4 col-sm-4"></div>');
    room_panel.append('<div class="panel panel-info"><div class="panel-heading room_name">' + '+' +  '</div><div class = "panel-body mypanel bulb_layer row"><span class = "adding_meesage">등록</span></div></div>');
    New_Room_Button.append(room_panel);
        
    container.append(New_Room_Button);
}

function LoadRoomInformation(){ //제목 그대로
    $.ajax({
        type: "get",
        url : BASE_URL+API_URL+"rooms",
        timeout : 10000,
        success: function(data){
            UpdateRoomListView(data);
            UpdateRoomListatController(data); //3차년도 부분으로 함수 내용은 controller.ejs에 뜰어가 있다~
        },
        error: function(err){
            console.log(err)
        }
    });
}

function UpdateRoomListatController(data)
{ //제목 그대로
if(data!=null){
    $('#controllerRooms').empty();
    for(var i = 0 ; i < data.length ; i++){
      if(data[i].room_name=="거실") //거실 default로 두려고;;;
      {
        $('#controllerRooms').append('<option flag="'+data[i].room_id+'" selected="selected" >'+data[i].room_name+'</option>');
      }
      else{
        $('#controllerRooms').append('<option flag="'+data[i].room_id+'">'+data[i].room_name+'</option>');
      }
    }
}
}

function MakingIndexPage(){ //

    // Load Library
    LoadRoomInformation();
    //LoadCaseInformation();
}

/////여기서부터 밑에까지는 안봐도 될듯!

function GoToPreviousPage(){
    setTimeout(function(){
        history.back();
    }, 200);

    return false;
}

function SubmitRegist(){

    setTimeout(function(){

        // Data
        var Dom = $('.centered > form');

        var Data = {
            user_name : Dom.find('#name').val(),
            user_id : Dom.find('#userid').val(),
            user_password : Dom.find('#password').val(),
            user_password2 : Dom.find('#password2').val(),
        };
        alert(JSON.stringify(Data));
        $.ajax({
            type: "post",
            url : BASE_URL+API_URL+"users/regist",
            data : Data,
            timeout : 2000,
            success: function(data){
                toastr.success('회원 가입을 축하드립니다.');
                setTimeout(function(){
                    history.back();
                }, 2000);
            },
            error: function(err){
                toastr.warning(err.responseJSON.message);
            }
        });


    }, 200);

    return false;
}

function activateBlackBackground(){
    $('#curtain').css("display", "block");
}

function closeBlackBackground(){
    $('#curtain').css("display", "None");
    $('#curtain').empty();
}
/**
*  Secure Hash Algorithm (SHA1)
*  http://www.webtoolkit.info/
**/
function SHA1(msg) {
  function rotate_left(n,s) {
    var t4 = ( n<<s ) | (n>>>(32-s));
    return t4;
  };
  function lsb_hex(val) {
    var str="";
    var i;
    var vh;
    var vl;
    for( i=0; i<=6; i+=2 ) {
      vh = (val>>>(i*4+4))&0x0f;
      vl = (val>>>(i*4))&0x0f;
      str += vh.toString(16) + vl.toString(16);
    }
    return str;
  };
  function cvt_hex(val) {
    var str="";
    var i;
    var v;
    for( i=7; i>=0; i-- ) {
      v = (val>>>(i*4))&0x0f;
      str += v.toString(16);
    }
    return str;
  };
  function Utf8Encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };
  var blockstart;
  var i, j;
  var W = new Array(80);
  var H0 = 0x67452301;
  var H1 = 0xEFCDAB89;
  var H2 = 0x98BADCFE;
  var H3 = 0x10325476;
  var H4 = 0xC3D2E1F0;
  var A, B, C, D, E;
  var temp;
  msg = Utf8Encode(msg);
  var msg_len = msg.length;
  var word_array = new Array();
  for( i=0; i<msg_len-3; i+=4 ) {
    j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
    msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
    word_array.push( j );
  }
  switch( msg_len % 4 ) {
    case 0:
      i = 0x080000000;
    break;
    case 1:
      i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
    break;
    case 2:
      i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
    break;
    case 3:
      i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8  | 0x80;
    break;
  }
  word_array.push( i );
  while( (word_array.length % 16) != 14 ) word_array.push( 0 );
  word_array.push( msg_len>>>29 );
  word_array.push( (msg_len<<3)&0x0ffffffff );
  for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
    for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
    for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;
    for( i= 0; i<=19; i++ ) {
      temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B,30);
      B = A;
      A = temp;
    }
    for( i=20; i<=39; i++ ) {
      temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B,30);
      B = A;
      A = temp;
    }
    for( i=40; i<=59; i++ ) {
      temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B,30);
      B = A;
      A = temp;
    }
    for( i=60; i<=79; i++ ) {
      temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B,30);
      B = A;
      A = temp;
    }
    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
  }
  var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

  return temp.toLowerCase();
}

function makingLoginForm(){
    var page = $('<div class = "login-page"></div>');

    var form = $('<div class = "form"></div>');

    var button_close = $('<span class = "close"><i class="fa fa-times fa-2x" aria-hidden="true"></i></span>');
    button_close.on('click',closeBlackBackground);

    var input_id = $('<input class="form-control" id="id_username" name="username" type="text" placeholder="username" required="">');

    var input_password = $('<input class="form-control" id="id_password" name="password" type="password" placeholder="password" required="">');

    var button_login = $('<button class = "login">로그인</button>');
    button_login.on('click',function(){

        var Data = {
            user_id : $('.form > #id_username').val(),
            user_password : SHA1($('.form > #id_password').val())
        };

        $.ajax({
            type: "get",
            url : BASE_URL+API_URL+"users/login",
            data : Data,
            timeout : 2000,
            success: function(data){

                toastr.success(data.user_name+'님 안녕하세요.');

                TweenMax.to($('#curtain'), 1, {
                    opacity: 0,
                    ease: Power1.easeInOut,
                    repeat: 0,
                    onComplete : function(){
                        location.reload();
                    }
                });

            },
            error: function(err){
                toastr.warning(err.responseJSON.message);
            }
        });
    });

    var p_message = $('<p class="message">가입을 안하셨다면? <a href="/regist">회원 가입</a></p>');

    form.append(button_close);
    form.append(input_id);
    form.append(input_password);
    form.append(button_login);
    form.append(p_message);

    page.append(form);

    return page;
}

function Login(){
    var container = $('#curtain');
    container.append(makingLoginForm());

    activateBlackBackground();

    return false;
}

function Logout(){

    $.ajax({
        type: "get",
        url : BASE_URL+"users/logout",
        timeout : 2000,
        success: function(data){
            toastr.success('로그아웃 되었습니다.');
            setTimeout(function(){
                location.reload();
            }, 1000);
        },
        error: function(err){
            toastr.warning(err.responseJSON.message);
        }
    });
}

function OpenScenarioBox(){
    /*
    TweenMax.fromTo($('.top_second_menu'), 1, {

        y : -100,
        opacity : 0,

    },{
        y : 0,
        display : 'block',
        opacity: 1,
        ease: Power1.easeInOut,
        repeat: 0,
        onComplete : function(){

        }
    });
    */
}


$(document).ready(function(){

    $('#widget').draggable();
    toastr.options = {
        positionClass : "toast-top-center"
    }
    // Loading Index Page
    MakingIndexPage();


    // Event Mapping
    $('.button_menu > .exit').on('click', GoToPreviousPage);
    $('.button_menu > input[type=submit]').on('click', SubmitRegist);

    $("#login_button").on('click', Login);
    $("#logout_button").on('click',Logout);
    $("#left").on('click',function(){

        TweenMax.fromTo($(".top_second_menu > .content"), 1, {
            opacity: 1,
        },{
            x : -400,
            display : 'block',
            opacity: 0,
            ease: Power1.easeInOut,
            repeat: 0,
            onComplete : function(){

            }
        });
    });
    
    // $('#modify_button').on('click', SumbitModify);
    $('#registration_button').on('click',ViewAddCase);

    //$('.activebtn').on('click',function(){
        //$(this).removeClass("btn-success");
        //$(this).toggleClass('btn-danger');
        //$(this)
        //$('.btn-success').toggleClass('btn-default');
    //})
    
});

