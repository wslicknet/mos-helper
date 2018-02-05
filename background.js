
var mosId='',mosIdArr=[];
var pageId= 0,pageSliceId=0;
function genericOnClick(info, tab) {
    var url='https://www.sherrywang.xin/?id='+pageId+'&sid='+pageSliceId;
    window.open(url,'_blank');
}

var mosHelper=null;

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        mosId=msg.mosId;
        if(msg.mosFlag){ //更新菜单
            mosIdArr=mosId.split(',');
            pageId=mosIdArr[0]?mosIdArr[0]:0;
            pageSliceId=mosIdArr[1]?mosIdArr[1]:0;
            if(mosHelper){
                chrome.contextMenus.update("mos-helper",{"title": "跳转到mos修改","contexts":["all"],"onclick":genericOnClick});
            }else{
                mosHelper=chrome.contextMenus.create({"id":"mos-helper","title": "跳转到mos修改","contexts":["all"],"onclick":genericOnClick});
            }
        }else{ //右击的元素没有data-midea_mos_id属性
            chrome.contextMenus.remove("mos-helper",function(){
                mosHelper=null;
            });
        }
    });
});
