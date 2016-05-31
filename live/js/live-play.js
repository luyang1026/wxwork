var emojis = {
    "[礼物]": "http://static.gensee.com/webcast/static/emotion/chat.gift.png",
    "[愤怒]": "http://static.gensee.com/webcast/static/emotion/emotion.angerly.gif",
    "[鄙视]": "http://static.gensee.com/webcast/static/emotion/emotion.bs.gif",
    "[伤心]": "http://static.gensee.com/webcast/static/emotion/emotion.cry.gif",
    "[再见]": "http://static.gensee.com/webcast/static/emotion/emotion.goodbye.gif",
    "[高兴]": "http://static.gensee.com/webcast/static/emotion/emotion.laugh.gif",
    "[流汗]": "http://static.gensee.com/webcast/static/emotion/emotion.lh.gif",
    "[无聊]": "http://static.gensee.com/webcast/static/emotion/emotion.nod.gif",
    "[疑问]": "http://static.gensee.com/webcast/static/emotion/emotion.question.gif",
    "[你好]": "http://static.gensee.com/webcast/static/emotion/emotion.smile.gif",
    "[反对]": "http://static.gensee.com/webcast/static/emotion/feedback.against.gif",
    "[赞同]": "http://static.gensee.com/webcast/static/emotion/feedback.agreed.png",
    "[鼓掌]": "http://static.gensee.com/webcast/static/emotion/feedback.applaud.png",
    "[太快了]": "http://static.gensee.com/webcast/static/emotion/feedback.quickly.png",
    "[太慢了]": "http://static.gensee.com/webcast/static/emotion/feedback.slowly.png",
    "[值得思考]": "http://static.gensee.com/webcast/static/emotion/feedback.think.png",
    "[凋谢]": "http://static.gensee.com/webcast/static/emotion/rose.down.png",
    "[鲜花]": "http://static.gensee.com/webcast/static/emotion/rose.up.png"
};
function emojiTrans(src){
    for(var key in emojis){
        if(emojis[key]==src)return key;
    }
}
$(function(){
    //添加表情
    var input = $('.say-words .text');
    var cursorPos = 0;
    $('.exp').on('click',function(){//添加表情按钮
        if(this.clicked){
            $('.emoji').hide();
            this.clicked = false;;
        }else{
            $('.emoji').show();
            this.clicked = true;
        }
        return false;
    });
    $('.emoji li img').click(function(){//点击表情
        var oldVal = input.val();
        input.val( oldVal.substring(0,cursorPos) + emojiTrans($(this).attr('src')) + oldVal.substring(cursorPos));
        $('.emoji').hide();
        $('.exp').get(0).clicked = false;
        input.focus();
        return false;
    });
    $(document).click(function(){
        if($('.emoji').css('display')=='block'){
            input.focus();
        }
        $('.emoji').hide();
        $('.exp').get(0).clicked = false;
    });
    //改变光标位置后插入表情符号
    input.on('click keyup',function(){
        cursorPos = this.selectionEnd;
    });
    //发送消息
    $('#send').click(function() {
        if(!input.val())return;
        Rong.send(input.val());
        input.val('');
    });
    //发言和老师切换
    var tabBtns = $('.live-tab .list-tab-title');
    var tabConts = $('.live-tab-contents-item');
    tabBtns.click(function(){
      tabBtns.removeClass('active');
      $(this).addClass('active');
      tabConts.removeClass('active');
      tabConts.eq($(this).index()).addClass('active');
    }); 
    function onGetMessage(name,msg){
        msg = msg.replace(/\[.{2,5}\]/g,function(input){
            if(emojis[input]){
                return '<img src="'+emojis[input]+'">';
            }else{
                return input;
            }
        })
        var li = $('<li><p class="user"><img src="img/tourist.png" alt=""><span class="name">'+name+'</span></p><p class="comments">'+msg+'</p></li>');
        $('.posts').append(li);
    }

    // 乐视直播
    // var player = new CloudLivePlayer();
    // var activityId = 'A2016010500713'
    // player.init({
    //     activityId:activityId,
    //        type:'video'
    // },'player');

    //融云
    //判断是否登陆 --> 获取token --> 连接融云服务器
    var appkey = '82hegw5uhfwox';
    var urlGetToken = 'http://coreapi.wangxiao.cn/api/rongcloud/gettoken';
    var Username = 'ly';
    var token = '';
    var targetId = 'cf57a787-2194-40d8-bdc0-3bd6fe594b6a';
    var login = false;
    RongIMClient.init(appkey);
    //连接状态监听器
    RongIMClient.setConnectionStatusListener({
        onChanged: function (status) {
            switch (status) {
                //链接成功                                                                                                 
                case RongIMLib.ConnectionStatus.CONNECTED:
                    console.log('链接成功');
                    break;
                //正在链接                                                                                                 
                case RongIMLib.ConnectionStatus.CONNECTING:
                    console.log('正在链接');
                    break;
                //重新链接                                                                                                 
                case RongIMLib.ConnectionStatus.DISCONNECTED:
                    console.log('断开连接');
                    break;
                //其他设备登陆                                                                                                 
                case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
                    console.log('其他设备登陆');
                    break;
                //网络不可用                                                                                                 
                case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
                    console.log('网络不可用');
                    break;
            }
        }
    });
    //消息监听器
    RongIMClient.setOnReceiveMessageListener({
        // 接收到的消息
        onReceived: function (message) {
            // 判断消息类型
            switch(message.messageType){
                case RongIMClient.MessageType.TextMessage:
                    // 发送的消息内容将会被打印
                    console.log(message);
                    if(message.content.extra == 'tourist'){
                      message.senderUserId = '游客['+ message.senderUserId +']';
                    }
                    onGetMessage(message.senderUserId,message.content.content)
                    break;
            }
        }
    });
    //判断登陆状态
    $.ajax({
        url:'http://users.wangxiao.cn/Passport/GetLoginInfo.ashx',
        dataType:'jsonp',
        success:function(data){
            if(data&&data.Username){//已登录
                login = true;
                Username = data.Username;
                getTokenFromAppServer(data.Username);
            }else if(!localStorage.name){//未登录
                login = false;
                getTokenFromAppServer(null);
            }
        }

    });
    function getTokenFromAppServer(username){//获取token
        if(login){//已登录
            $.ajax({
                url:'http://coreapi.wangxiao.cn/api/rongcloud/gettoken',
                data:{
                    username:username
                },
                dataType:'jsonp',
                success:function(data){
                    if(data.Message == 'success'){
                        token = data.Data;
                    }
                    Rong.connect(token);
                }
            });
        }else{//未登录
            $.ajax({
                url:'http://coreapi.wangxiao.cn/api/RongCloud/GetGuestToken',
                dataType:'jsonp',
                success:function(data){
                    if(data.Message == 'success'){
                        token = data.Data.Token;
                        Username = data.Data.GuestName;
                    }
                    Rong.connect(token);
                }
            })
        }
        
    }
    var Rong = {
        connect:function(token){ // 连接融云服务器
            RongIMClient.connect(token, {
                onSuccess: function(userId) {
                  console.log("Login successfully." + userId);
                  Rong.joinChatRoom();
                },
                onTokenIncorrect: function() {
                  console.log('token无效');
                },
                onError:function(errorCode){
                      var info = '';
                      switch (errorCode) {
                        case RongIMLib.ErrorCode.TIMEOUT:
                          info = '超时';
                          break;
                        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                          info = '未知错误';
                          break;
                        case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
                          info = '不可接受的协议版本';
                          break;
                        case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
                          info = 'appkey不正确';
                          break;
                        case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
                          info = '服务器不可用';
                          break;
                      }
                      console.log(errorCode);
                    }
            });
        },
        joinChatRoom:function(){//加入聊天室
            RongIMClient.getInstance().joinChatRoom(targetId, -1, {
                onSuccess: function () {
                   console.log('joined')
                },
                onError: function () {
                    console.log("join failed");
                }
            });
        },
        send:function(msg){//发送消息
           msg = msg.replace(/>/g,'&gt;').replace(/</g,'&lt;');
           var extra;
           if(!login){
              extra = 'tourist';
           }
           msg = new RongIMLib.TextMessage({content:msg,extra:extra});
           var conversationtype = RongIMLib.ConversationType.CHATROOM;
           RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
                  // 发送消息成功
                  onSuccess: function (message) {
                      //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                      console.log("Send successfully");
                      if(!login){
                        var temp = '游客'+Username;
                      }
                      onGetMessage(temp,message.content.content);
                  },
                  onError: function (errorCode,message) {
                      var info = '';
                      switch (errorCode) {
                          case RongIMLib.ErrorCode.TIMEOUT:
                              info = '超时';
                              break;
                          case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                              info = '未知错误';
                              break;
                          case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                              info = '在黑名单中，无法向对方发送消息';
                              break;
                          case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                              info = '不在讨论组中';
                              break;
                          case RongIMLib.ErrorCode.NOT_IN_GROUP:
                              info = '不在群组中';
                              break;
                          case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                              info = '不在聊天室中';
                              break;
                          default :
                              info = x;
                              break;
                      }
                      console.log('发送失败:' + info);
                  }
              }
          );
        },
        
    }
});