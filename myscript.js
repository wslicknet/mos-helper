var port = chrome.runtime.connect({name: "mos"});//通道名称

var mosId='';
var body=document.body;
document.addEventListener('mousedown',function (e) {
    if(e.which==3){ //鼠标右击事件
        var mosFlag=false;
        var mosEle=e.target;

        while(mosEle==null || (mosEle != body)){
            if(mosEle.dataset.midea_mos_id != undefined){
                mosId=mosEle.dataset.midea_mos_id;
                mosFlag=true;
                break;
            }
            mosEle=mosEle.parentNode;
        }
        port.postMessage({mosId: mosId,mosFlag:mosFlag});//发送消息
    }
})
