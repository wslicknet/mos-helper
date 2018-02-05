### 背景介绍
一个网站，肯定有很多运营位，相信各家公司都有对应的运营系统去增删改。但是随着运营位、运营系统越来越多，人员更替，历史悠久，每个页面到底对应哪个运营系统哪个地方，运营很难一下子找到。尤其是一些设计不怎么合理的运营系统，恐怕只有开发翻出源代码才清楚。
前段时间，对公司内部的运营系统做了优化，就发现了这个痛点。然后就想着，怎么解决它。

要解决这个问题，首先要能建立页面与运营系统的某种联系。分析了下公司的运营系统，发现真的可以通过运营系统自动注入运营位的标识id，这样便能建立运营系统与使用页面的联系。
下一步要做的就是让运营怎么从页面上立刻找到对应的运营系统。然后就想到了Chrome插件也许能帮上我的忙。

所以，这个Chrome小插件主要是为运营做的。

### 使用说明
运营安装插件后，在页面中，右键点击，使用运营位的地方，右键菜单中便会出现插件“mos-helper”,点击跳转到对应运营系统的编辑页；无运营位，便不会出现此插件。
![使用截图](https://www.sherrywang.xin/static/img/mos_helper.png)

> 目前只能内部使用，并没有做什么通用化的处理，所以并没有提交Chrome应用商店。感兴趣的可以在这里[下载](https://www.sherrywang.xin/static/assets/mos_helper.crx)。代码很简单，主要是觉得Chrome插件，也是一个提高工作效率的利器，以后要多发掘，应该能做蛮多有意思的事。

### 代码解析
![代码目录](https://www.sherrywang.xin/static/img/mos_helper_files.png)

关于chrome插件开发，请参考[官方文档](https://developer.chrome.com/extensions/manifest)，本文无意做入门教程。

#### manifest.json
这个是chrome插件必须要有的，关于插件的一些声明。

```javascript
{
    "manifest_version": 2,
    "name": "mos-helper",
    "description": "update mos easily",
    "version": "0.1",
    "icons": {
    "19": "images/favicon.png"
},
    "browser_action": {
    "default_icon": {
        "19": "images/favicon.png"
    },
    "default_title": "mos helper",
    "default_popup": "popup.html"
},
    "content_scripts": [
        {
            "matches": ["http://*/*","https://*/*"],  //这里是插件要监听的页面，可以只监听你需要监听的页面
            "js": ["myscript.js"], //嵌入到页面中的脚本
            "run_at": "document_end",
            "all_frames": false
        }
    ],
    "permissions": ["contextMenus", "tabs"], //插件需要的接口权限，需要什么权限就加什么
    "background": {
        "scripts": ["background.js"]   //这个是常驻后台的脚本
    }

}
```

#### myscript.js
嵌入页面的脚本要做的工作就是：监听用户的鼠标点击事件，将点击元素上的属性值通过postMessage发送给background.js。
元素上的属性和属性值，就是最开始提到的页面和运营系统的某种关联，是需要我们手动埋点或者运营系统自动生成的。这里我给每个都添加了data-midea_mos_id属性。

```javascript
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
```

#### background.js
background.js常驻后台。这里主要做的事情就是：监听页面脚本传过来的消息，生成或更新此插件的右键菜单。

```javascript

var mosId='',mosIdArr=[];
var pageId= 0,pageSliceId=0;
function genericOnClick(info, tab) {
    var url='http://xxxx?id='+pageId+'&sid='+pageSliceId; //url必须带协议名
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

```
这样就完成了一个简单的chrome插件开发。


### 优化方向
这个插件目前做的很简单，如果再想优化，想到的有以下几点：
1. 开关控制，插件直接把页面上所有运营位及链接标识出来，这样哪里有运营位一目了然。
2. 运营直接在页面上通过插件编辑运营位信息，即改即生效。
3. 插件通用化：监听页面元素，然后做些什么事

### 参考文章
chrome插件扩展开发：[http://blog.haoji.me/chrome-plugin-develop.html?from=xa](http://blog.haoji.me/chrome-plugin-develop.html?from=xa)

Chrome插件开发官方文档：[https://developer.chrome.com/extensions](https://developer.chrome.com/extensions)

个人网站：[https://www.sherrywang.xin/](https://www.sherrywang.xin/)
