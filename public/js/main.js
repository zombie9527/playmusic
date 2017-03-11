(function(window,document){
    var SongPlus = function(){}
    SongPlus.prototype={
        /**
         * 绑定dom事件
         */
        bindDomEvent:function(){
            var _this = this;
            
            _this.param.prevBtn.on("click",function(){
                if($(".select").prev())
                    $(".select").prev().click();
            });
            _this.param.stopBtn.on("click",function(){
                if(this.className == "btn_play"){
                    $(this).removeClass("btn_play").addClass("btn_pause");
                    if($(".select").length>0){
                        $("#"+_this.param.videoId)[0].play();
                    }else{
                        _this.param.playList.children()[0].click();
                    }
                    _this.stopFlag = 1;
                }else if(this.className == "btn_pause"){
                    $(this).removeClass("btn_pause").addClass("btn_play");
                    $("#"+_this.param.videoId)[0].pause();
                    _this.stopFlag = 1;
                }
            });
            _this.param.nextBtn.on("click",function(){
                if($(".select").next())
                    $(".select").next().click();
            });
            _this.param.playList.on("click","li",function(){
                if(_this.playControl)
                    clearTimeout(_this.playControl);
                var currObj = $(this);
                _this.param.stopBtn.removeClass("btn_play").addClass("btn_pause");
                if($(this).className != null && $(this).className != ""){
                    return;
                }
                var currSongIngo = JSON.parse($(this).attr("data-info"));
                _this.loadLyric(currSongIngo.lyricUrl,function(){
                    currObj.addClass("select").siblings(".select").removeClass("select");
                    _this.param.scheduleInfo.find(".song-name").text(currSongIngo.name);
                    if($("#"+_this.param.videoId).length < 1){
                        $("body").append("<video id='"+_this.param.videoId+"' autoplay='autoplay' src='"+currSongIngo.songUrl+"'></video>")
                    }else{
                        $("#"+_this.param.videoId).attr("src",currSongIngo.songUrl);
                    }
                    _this.stopFlag = 1;
                    _this.createPanel(_this.param.lyricBox);
                    _this.playSongControl();
                });
                
            });
            _this.param.scheduleItem.on("mousedown",function(e){
                if(!_this.stopFlag) return;
                var leftposition = e.offsetX;
                _this.tempPause();
                _this.leftPos = leftposition/_this.param.scheduleItem.width();
                _this.param.scheduleDetail.css({"width":_this.leftPos*100+"%"});
                _this.controlFlag = 1;
            });
            $("body").on("mousemove",function(e){
                if(_this.controlFlag){
                    var leftposition = e.clientX - _this.param.scheduleItem.offset().left;
                    _this.leftPos = leftposition/_this.param.scheduleItem.width();
                    if(_this.leftPos>0.99){
                        _this.leftPos = 0.99;
                    }
                    _this.param.scheduleDetail.css({"width":_this.leftPos*100+"%"});
                }else if(_this.touchFlag){
                    var temp = _this.oldTop + (e.clientY - _this.topPos);
                    _this.param.lyricBox.css({"top":temp+"px"});
                }
            });
            $("body").on("mouseup",function(){
                var videoEle = $("#"+_this.param.videoId)[0];
                if(_this.controlFlag){
                    videoEle.currentTime = videoEle.duration * _this.leftPos;
                    _this.controlFlag = 0;
                    _this.tempPlay();
                }else if(_this.touchFlag){
                    var ind = Math.floor((_this.param.lyricBox.parent().height()/2 - 100 - parseInt(_this.param.lyricBox.css("top")))/44);
                    videoEle.currentTime = _this.time[ind];
                    _this.touchFlag = 0;
                    _this.tempPlay();
                }
            });
            _this.param.lyricBox.on("mousedown",function(e){
                if(!_this.stopFlag) return;
                _this.tempPause();
                _this.topPos = e.clientY;
                _this.oldTop = parseInt(_this.param.lyricBox.css("top"));
                _this.touchFlag = 1;
            });
        },
        /**
         * 播放进度控制
         */
        playSongControl:function(){
            var _this = this;
            clearTimeout(_this.playControl);
            _this.playControl = setTimeout(function(){
                var videoEle = $("#"+_this.param.videoId)[0];
                _this.param.scheduleDetail.css({"width":(videoEle.currentTime/videoEle.duration)*100+"%"});
                var songLength = Math.floor(videoEle.duration),
                    currLength = Math.floor(videoEle.currentTime),
                    songTime = _this.analysisTime(songLength),
                    currTime = _this.analysisTime(currLength);
                if(songLength == currLength){
                    if($(".select").next().length)
                        $(".select").next().click();
                    else
                        _this.param.playList.children()[0].click();
                }
                _this.param.scheduleInfo.find(".song-time").text(currTime+"/"+songTime);
                _this.lyricWalk(currLength,"active");

                _this.playSongControl();
            },200)
        },
        /**
         * 歌词移动
         */
        lyricWalk:function(position,css){
            var time = 0,
                obj = this;
            function set(index){
                var height = 44,
                    box = obj.param.lyricBox[0];
                $(box).animate({
                    top:box.parentElement.clientHeight/2-index*height-100+"px"
                },8);
                obj.param.lyricBox.find("div").eq(index).addClass(css).siblings("."+css).removeClass(css);
            }
            for(var i = 0;i < obj.index;i++){
                if(position == obj.time[i]){
                    set(i);
                }else if(position > obj.time[i]){
                    time = i;
                }
            }
            set(time);
        },
        /**
         * 快进暂停、开始
         */
        tempPause:function(){
            $("#"+this.param.videoId)[0].pause();
            clearTimeout(this.playControl);
        },
        tempPlay:function(){
            $("#"+this.param.videoId)[0].play();
            this.param.stopBtn.removeClass("btn_play").addClass("btn_pause");
            this.playSongControl();
        },
        /**
         * 计算播放时间
         */
        analysisTime:function(turnTime){
            var newTime = "";
            if(Math.floor(turnTime/60)>9){
                newTime = Math.floor(turnTime/60)+":";
            }else if(Math.floor(turnTime/60)>0){
                newTime = "0"+Math.floor(turnTime/60)+":";
            }else{
                newTime = "00:";
            }
            if(Math.floor(turnTime%60)<10){
                newTime += "0"; 
            }
            newTime += Math.floor(turnTime%60);
            return newTime;
        },
        /**
         * 歌词面板
         */
        createPanel:function(obj){
            $(obj).html("");
            var dataHtml = "";
            for(var i=0;i<this.index;i++){
                dataHtml+="<div>"+this.lyric[i]+"</div>";
            }
            $(obj).append(dataHtml);
        },
        /**
         * 加载歌词
         */
        loadLyric:function(lyricUrl,fn){
            var _this = this
            $.ajax({
                url:lyricUrl,
                method:"get",
                success:function(data){
                    _this.time = [];
                    _this.lyric=[];
                    _this.index= 0;
                    var lyrics = data.split("\n");
                    for(let i = 0;i<lyrics.length;i++){
                        var lyric = decodeURIComponent(lyrics[i]);
                        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
                        var timeRegExpArr = lyric.match(timeReg);
                        if(!timeRegExpArr)continue;
                        var clause = lyric.replace(timeReg,'');
                        
                        for(let k = 0,h = timeRegExpArr.length;k<h;k++){
                            var t = timeRegExpArr[k],
                                min = Number(String(t.match(/\[\d*/i)).slice(1)),
                                sec = Number(String(t.match(/\:\d*/i)).slice(1)),
                                mill = Number(String(t.match(/\.\d*/i)).slice(1,3)),
                                time = Number(min*60+sec+"."+mill);
                                _this.time[_this.index] = time;
                                _this.lyric[_this.index] = clause;
                                _this.index += 1;
                        }
                    }
                    fn.call();
                }
            })
        },
        /**
         * 加载列表
         */
        loadSong:function(){
            var _this = this;
            $.ajax({
                url:"json/songInfo.json",
                method:"post",
                success:function(data){
                    var dataHtml = "",
                        songInfos = data.data;
                    for(var i=0;i<songInfos.length;i++){
                        var currObj = {
                            "id":songInfos[i].songId,
                            "name":songInfos[i].songName,
                            "songUrl":songInfos[i].songUrl,
                            "lyricUrl":songInfos[i].lyricUrl,
                            "artist":songInfos[i].artist,
                            "duration":songInfos[i].duration
                        }
                        currObj = JSON.stringify(currObj);
                        dataHtml += '<li data-info='+currObj+'><div class="songlist_songname">'+songInfos[i].songName.replace(/&/g," ")+'</div><div class="songlist_artist">'+(songInfos[i].artist.replace(/&/g," ")||'未知')+'</div><div class="songlist_time">'+songInfos[i].duration+'</div></li>';
                    }
                    _this.param.playList.append(dataHtml);
                    _this.bindDomEvent();
                }
            })
        }
    }
    /**
     * 初始化对象
     */
    SongPlus.init = function(initParam){
        var _this = new this;
        _this.param = {};
        _this.stopFlag=0;           //播放判断
        _this.controlFlag=0;        //进度条判断
        _this.leftPos=0;            //进度条位置
        _this.topPos=0;             //点击位置
        _this.oldTop=0;             //起始高度
        _this.touchFlag =0;         //点击判断
        $.extend(_this.param,initParam);
        _this.loadSong();
    }
    window.SongPlus = SongPlus;
})(window,document)