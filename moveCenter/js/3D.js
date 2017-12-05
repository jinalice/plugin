/**
 *
 * 插件模版
 * 详细用法请参考：http://xxxx/
 *
 * @ author
 * @ version
 *
 */

(function($){

    "use strict";
     //存储默认参数
    var defaultOptions = {
        infinite : false,
        number : 3,
        equalHeight : true,
        prevOrNot : false,
        nextOrNot : false,
        dragOrNot : true,
        clickOrNot : false,
        dots : false,
        initCount : {
            set : false,
            initCountNumber : 0
        },
        breakpoints: {
            set : false,
            width : 1024,
            number : 3
        },
        selfCalc:{
            set : false,
            secondScale : 0.75
        },
        addPcScroll : false,
        autoPlay : false,
        autoPlayTime : 1000,
        set3D : false ,
        time : 700,
        tabClass : 'is-active',
        leftClass : 'left',
        rightClass : 'right',
        addClickClass : 'movecenter-click',
        scrollNumber : 1,
        secondScale : 0.5,
        minScale : 0.5,
        moveDis : 100 ,   //单位像素px
        notSetSize : false ,//两侧不希望等比缩放,此值为true  同时setSize函数为空函数(目的为兼容ie8),其他浏览器可忽略此参数
        setSize : function( objParent , scale , oUl , self){
            if( $.browser.msie && $.browser.version<=8.0 ){

                /*var x = parseInt(objParent.css('width'))*(1-scale)/2;
                var $obj = objParent.find('a');
                objParent.css( 'paddingLeft' , x );
                objParent.css( 'paddingRight' , x );
                objParent.css( 'paddingTop' , (oUl.height()-$obj.height())/2 );
                $obj.css('opacity' , scale );*/

                var $obj = objParent.find('a');
                $obj.css( 'width' , scale*100+'%' );
                $obj.css( 'marginTop' , (oUl.height()-$obj.height())/2 );
                $obj.css('opacity' , scale );

            }else{
                //objParent.css( 'transform' , 'scale('+scale+')' );
                var $obj = objParent.find('a');
                $obj.css( 'transform' , 'scale('+scale+')' );
                $obj.css('opacity' , scale );
            }
        }
    };

    var moveCenter = function( elem, option ){
        var self = this;
        this.elem = elem;
        var newOptions = $.extend({}, defaultOptions, option);
        $.each( newOptions , function( index ,value ){
            self[index] = value;
        } );
        this.init();
    }

    moveCenter.prototype = {
        init : function(){
            var self = this;
            this.oWrapper = this.elem;
            this.str = this.oWrapper.html();
            if( this.prevOrNot ){
                this.oWrapper.append( '<div class="scroll-btn scroll-btn-prev"><a><i>&lt;</i></a></div>' );
            }
            if( this.nextOrNot ){
                this.oWrapper.append( '<div class="scroll-btn scroll-btn-next"><a><i>&gt;</i></a></div>' );
            }
            
            this.oWrapperInner = $( '.scroller-wrap' , this.oWrapper );
            this.oLeft = $( '.scroll-btn-prev' , this.oWrapper );
            this.oRight = $( '.scroll-btn-next' , this.oWrapper );
            this.oUl = $( this.oWrapperInner ).children('ul');
            this.maxSize = this.minScale;
            this.speed = 0;
            this.scale = 1;
            this.originScaleWidth = this.minScale;
            if( this.number >= 5 && !this.equalHeight ){
                this.originScaleWidthFarther = this.minScale;
            }
            this.initData = true;
            this.timer = null;
            this.bOk = true;
            this.oldMoveClientX = 0;
            this.dis = 0;
            this.downDis = 0;
            this.imgLoadCount = 0;
            if( this.breakpoints.set ){
                this.oldNumber = this.number;
                self._resizeNumber();
            }
            if( this.dots ){
                this.oWrapper.append( '<div class="scroll-dots"></div>' );
                this.oDots = $('.scroll-dots',this.oWrapper);
                for( var i=0;i<$('li',this.oUl).length; i++ ){
                    this.oDots.append('<a>'+i+1+'<i></i></a>')
                }
                this.oDotsBtn = $('a',this.oDots);
            }
            /* if(this.infinite){
                this.oUl.html( this.oUl.html() + this.oUl.html() + this.oUl.html() );
                this.aLi = this.oUl.children();
                this.count = this.aLi.length/3 + (this.number-1)/2;
            }else{
                this.aLi = this.oUl.children();
                this.count = (this.number-1)/2;
            } */
            if(this.infinite){
                this.oUl.html( this.oUl.html() + this.oUl.html() + this.oUl.html() );
            }
            this.aLi = this.oUl.children();
            if( this.initCount.set ){
                this.count = !this.infinite?this.initCount.initCountNumber:this.aLi.length/3+this.initCount.initCountNumber
            }else{
                this.count = !this.infinite?(this.number-1)/2:this.aLi.length/3 + (this.number-1)/2;
            }
            if(this.dragOrNot) this.originCount=this.count;
            if( this.scrollNumber > this.number){
                this.scrollNumber = this.number;
            }
            if( this.infinite && this.number > this.aLi.length /3 ){
                console.log( '轮播内容个数必须大于整屏放置的number数量,多图轮播可能出问题' );
            }
            this._browserRedirect();
            if( !this.set3D ){
                this.disScale = this._getScale(this.number,(this.number-1)/2+1,this.secondScale);
            }else{
                if( this.selfCalc.set ){
                    this.disScale = this._getScale(this.number,(this.number-1)/2+1,this.selfCalc.secondScale);
                }else{
                    this.disScale = this._getScale(this.number,this.number-1,0.5);
                }
            }
            /* this.disScale = !this.set3D?this._getScale(this.number,(this.number-1)/2+1,this.secondScale):this._getScale(this.number,this.number-1,0.5); */
            this.aLi.find('img').each(function( index , element ){
                if( element.complete ){
                    self.imgLoadCount ++;
                    if( self.imgLoadCount == self.aLi.find('img').length ){
                      self._init();
                    }
                }else{
                    $( element ).load( function(){
                        self.imgLoadCount ++;
                        if( self.imgLoadCount== self.aLi.find('img').length ){
                          self._init();
                        }
                    } );
                }
            });
        },
        prev : function(){
            this._leftClick(this.scrollNumber);
        },
        next : function(){
            this._rightClick(this.scrollNumber);
        },
        scroll : function(n,time){
        	if(!this.bOk) return;
            var self = this;
            this.scale = 1;
            if(!this.infinite){
                if(n<1 || n>this.aLi.length ){
                    console.log('不在滚动的区间');
                    return;
                }
            }else{
                if(n<1 || n>this.aLi.length/3){
                    console.log('不在滚动的区间');
                    return;
                }
            };
            if(time == 0){
                this.count = !this.infinite?(n-1):(this.aLi.length/3 + n-1);
                this._setBok();
                this.elem.trigger('moveCenter-after', self);
                return;
            }else{
                this.scrollTime = time?time:this.time;
                if( !this.infinite ){
                    if( n-1 == this.count ){
                        return;
                    }else{
                        if( $.browser.msie && $.browser.version<=8.0 ){
                            var l = (this.count-n+1) * this._getStyle( this.aLi ) * this._getStyle( this.oUl )/100;
                        }else{
                            var l = (this.count-n+1) * this.oWrapperInner.width() /this.number;
                        }
                    }
                }else{
                    if( n-1 == this.count - this.aLi.length/3 ){
                        return;
                    }
                    this._confirmCount();
                    if( $.browser.msie && $.browser.version<=8.0 ){
                        var l = (this.count - n + 1 - this.aLi.length/3) * this._getStyle( this.aLi ) * this._getStyle( this.oUl )/100;
                    }else{
                        var l = (this.count - n + 1 - this.aLi.length/3) * this.oWrapperInner.width() /this.number;
                    }
                };
            };
            this._move( this.oldLeft , l , this.scrollTime , 'linear' );
        },
        destroy : function(){
            this.oWrapper.html( this.str );
            this.autoPlay && this._autoPause();
            this.elem.removeData('moveCenter');
        },
        _autoPlay : function(){
        	var self = this;
        	this.autoPlayTimer = setInterval(function(){
        		self._rightClick(self.scrollNumber);
        	},this.autoPlayTime);
        },
        _autoPause : function(){
        	this.autoPlayTimer && clearInterval(this.autoPlayTimer);
        },
        _addDrag : function(){
            var self = this;
            if(!this.mobile){
                this.oUl.on('mousedown.moveCenter',function(e){
                    self._drag(e);
                });
            }else{
                this.oUl.on('touchstart.moveCenter',function(e){
                    self._drag(e);
                });
            }
        },
        _removeDrag : function (){
            !this.mobile?this.oUl.off('mousedown.moveCenter'):this.oUl.off('touchstart.moveCenter');
        },
        _addNext : function(){
            var self = this;
            if(!this.mobile){
                this.oRight.on('click.moveCenter' , function(){
                    self._rightClick(self.scrollNumber);
                });
            }else{
                this.oRight.on('touchstart.moveCenter' , function(){
                    self._rightClick(self.scrollNumber);
                });
            }
        },
        _removeNext : function(){
            !this.mobile?this.oRight.off('click.moveCenter'):this.oRight.off('touchstart.moveCenter');
        },
        _addPrev : function(){
            var self = this;
            if(!this.mobile){
                this.oLeft.on('click.moveCenter' , function(){
                    self._leftClick(self.scrollNumber);
                });
            }else{
                this.oLeft.on('touchstart.moveCenter' , function(){
                    self._leftClick(self.scrollNumber);
                });
            }
        },
        _removePrev : function(){
            !this.mobile?this.oLeft.off('click.moveCenter'):this.oLeft.off('touchstart.moveCenter');
        },
        _addClick : function(){
        	var self = this;
        	this.aLink = this.oUl.find('.'+self.addClickClass);
            if(!this.mobile){
                this.aLink.off('click.moveCenterRemove').off('click.moveCenterMove').on('click.moveCenterMove' , function(e){
                	var _this = this;
                    self._addLiClickMove(e,$(_this),$(_this).parents('li',self.oUl).index(),self);
                });
            }else{
                if( self.dragOrNot ){
                    this.aLink.off('touchend.moveCenterRemove').off('touchend.moveCenterMove').on('touchend.moveCenterMove' , function(e){
                        var _this = this;
                        self.endX = e.originalEvent.changedTouches[0].pageX;
                        self.endY = e.originalEvent.changedTouches[0].pageY;
                        self._addLiClickMove(e,$(_this),$(_this).parents('li',self.oUl).index(),self);
                    });
                }else{
                    this.aLink.off('touchstart.moveCenterRemove').off('touchstart.moveCenterMove').on('touchstart.moveCenterMove' , function(e){
                        var _this = this;
                        self._addLiClickMove(e,$(_this),$(_this).parents('li',self.oUl).index(),self);
                    });
                }

            }
        },
        _removeClick : function(){
            var self = this;
            this.aLink = this.oUl.find('.'+self.addClickClass);
            !this.mobile?this.aLink.off('click.moveCenterMove'):this.aLink.off('touchend.moveCenterMove').off('touchstart.moveCenterMove');
            if(!this.mobile){
                this.aLink.off('click.moveCenterRemove').on('click.moveCenterRemove' , function(e){
                	var _this = this;
                    self._removeClickMove(e,$(_this),$(_this).parents('li',self.oUl).index(),self);
                });
            }else{
                if( self.dragOrNot ){
                    this.aLink.off('touchend.moveCenterRemove').on('touchend.moveCenterRemove' , function(e){
                        var _this = this;
                        self.endX = e.originalEvent.changedTouches[0].pageX;
                        self.endY = e.originalEvent.changedTouches[0].pageY;
                        self._removeClickMove(e,$(_this),$(_this).parents('li',self.oUl).index(),self);
                    });
                }else{
                    this.aLink.off('touchstart.moveCenterRemove').on('touchstart.moveCenterRemove' , function(e){
                        var _this = this;
                        self._removeClickMove(e,$(_this),$(_this).parents('li',self.oUl).index(),self);
                    });
                }
            }
        },
        _init : function(){
            var self = this;
            if( !( $.browser.msie && $.browser.version <= 8.0 ) ){
                this._setWidth();
            }else{
                this.oUl.css( 'width' , 100*this.aLi.length/this.number +'%');
                this.aLi.css('width' , 100/this.aLi.length +'%');
            }
            if($.browser.msie && $.browser.version<=8.0){
                this.oUl.css('height' , this.aLi.eq(this.count).height() );
                this._setCenter(this.count);
                this._setSize();
            }else{
               this._setResize();
            }

            if( self.equalHeight && self.number >= 5 && !this.notSetSize ){
                self._setSize();
            };

            


            if($.browser.msie && $.browser.version<=8.0){
                this.resizeTimer = null;
                $(window).off('resize.movecenter').on('resize.movecenter' , function(){
                    self.resizeTimer && clearTimeout(self.resizeTimer);
                    self.resizeTimer = setTimeout(function(){
                        self._resizeNumber();
                        self.notSetSize?self.oUl.css('height' , self.aLi.eq(self.count).height() ):self._setResize();
                    }, 150);
                });
            } else{
                $(window).on('resize.movecenter' , function(){
                    self._resizeNumber();
                    self._setResize();
                });
            }
            this.prevOrNot && this._addPrev();
            this.nextOrNot && this._addNext();
            this.dragOrNot && this._addDrag();
            this.clickOrNot?this._addClick():this._removeClick();
            if(this.addPcScroll && !this.mobile){
                this._addWheel( self , self.oWrapperInner[0] , function( down ){
                    if( down ){
                        self._rightClick(1);
                    }else{
                        self. _leftClick(1);
                    }
                });
            }
            if( this.autoPlay ){
            	this._autoPlay();
            	/* this.oWrapperInner
            		.on('mouseenter.moveCenter',function(){
		            		self._autoPause();
						})
            		.on('mouseleave.moveCenter',function(){
		            		self._autoPlay();
						}); */
                this.oWrapper
                    .on('mouseenter.moveCenter',function(){
                            self._autoPause();
                        })
                    .on('mouseleave.moveCenter',function(){
                            self._autoPlay();
                        });
            }
        },
        _setResize : function(){
            if( ( $.browser.msie && $.browser.version <= 8.0 ) ){
               if(this.notSetSize){
                    this.oUl.css('height' , this.aLi.eq(this.count).height() );
                }else{
                    this.oUl.css('height' , this.aLi.eq(this.count).height() );
                    this._setCenter(this.count);
                    this._setSize();
                }


            }else{
                this._setWidth();
                this._setCenter(this.count);
                this._setSize();
                if( ( $.browser.msie && $.browser.version > 8.0 ) || ( navigator.userAgent.indexOf( 'Trident' )!=-1 && navigator.userAgent.indexOf( 'rv' )!=-1 ) ){
                    this._setWidth();
                    this._setCenter(this.count);
                }

            }

           // this._setIEWidth();
            //this.oUl.css('height' , this.aLi.eq(this.count).height() );
            //this._setCenter(this.count);
            //this._setSize();
            //this._setIEWidth();
        },
        _resizeNumber : function(){
            if( this.breakpoints.set ){
                if( $(window).width() <= this.breakpoints.width ){
                    this.number = this.breakpoints.number;
                }else{
                    this.number = this.oldNumber;
                }
            }
        },
        _setWidth : function(){
            if( !( $.browser.msie && $.browser.version <= 8.0 ) ){
                this.aLi.css( 'width' , this.oWrapperInner.width() / this.number );
                this.oUl.css( 'width' , (this.aLi.width() + 1) * this.aLi.length );
                //this.set3D && $('a',this.aLi).css('width',this.oWrapperInner.width() / this.number*2);
            }
            /*if( ( $.browser.msie && $.browser.version > 8.0 ) || ( navigator.userAgent.indexOf( 'Trident' )!=-1 && navigator.userAgent.indexOf( 'rv' )!=-1 ) ){
                this.aLi.css( 'width' , this.oWrapperInner.width() / this.number );
                this.oUl.css( 'width' , (this.aLi.width() + 1) * this.aLi.length );
            }*/
        },
        _setCenter : function (n){
            if( $.browser.msie && $.browser.version<=8.0 ){
                this.oldLeft = 50 - (n+0.5) * this._getStyle( this.aLi ) * this._getStyle( this.oUl )/100;
                this.oUl.css('left' , this.oldLeft + '%' );
                return;
            }

            this.oldLeft = ( 0.5 - ( n + 0.5 )/this.number ) * this.oWrapperInner.width() ;
            this.oUl.css('left' , this.oldLeft);

        },
        _setSize : function (){
            var self = this;
            this._setMaxSize();
            this.aLi.each(function(index , element){
                var dis = Math.abs( self.oUl.position().left + $(element).position().left + $(element).width()/2 - self.oWrapperInner.width() / 2 );
                var scale = 1 - dis/( self.oWrapperInner.width() * self.disScale );
                if( !self.equalHeight && self.number >= 5 ){
                    if( scale < self.originScaleWidthFarther ){
                        scale = self.originScaleWidthFarther;
                    }
                }else{
                    if( scale < self.originScaleWidth ){
                        scale = self.originScaleWidth;
                    }
                }
                if(!self.initData && scale > self.maxSize){
                        self.maxSize = scale;
                        self.count = index;
                }
                if( self.initData ){
                    if( self.count + 1 == index && scale > self.originScaleWidth){
                        self.originScaleWidth = scale;
                    }
                    if(self.number>=5  && !self.equalHeight && self.count + (self.number-1)/2 == index && scale > self.originScaleWidthFarther){
                        self.originScaleWidthFarther = scale;
                    }
                }
                if(index==self.aLi.length-1)  self.initData = false;

                if( self.set3D && ($(element).index() > self.count + (self.number-1)/2 || $(element) < self.count - (self.number-1)/2) ){
                	self.setSize( $(self.aLi[index]) , scale-0.01-(self.number-5)/2*0.01 , self.oUl ,self );
                }else{
                	self.setSize( $(self.aLi[index]) , scale , self.oUl ,self );
                }
            });

            this.aLi.eq( this.count ).addClass( this.tabClass ).siblings().removeClass( this.tabClass );
            for( var i =1; i <= (this.number-1)/2 ; i++){
                this.aLi.eq( this.count + i ).addClass( this.rightClass + i ).siblings().removeClass( this.rightClass + i );
                this.aLi.eq( this.count - i ).addClass( this.leftClass + i ).siblings().removeClass( this.leftClass + i );
            }

            if( this.dots ){
                var _index;
                if( this.infinite ){
                    _index = this.count < this.aLi.length/3 ? this.count : this.count < this.aLi.length/3*2 ? ( this.count - this.aLi.length/3 ) : ( this.count - this.aLi.length/3*2 ) 
                }else{
                    _index = this.count;
                }
                this.oDotsBtn.eq( _index ).addClass('active').siblings().removeClass('active');
                
                !this.mobile?this.oDotsBtn.on('click',function(){
                    var $index = $(this).index();
                    self.scroll( $index+1 , self.time );
                }):this.oDotsBtn.on('touchstart',function(){
                    var $index = $(this).index();
                    self.scroll( $index+1 , self.time );
                });
            }
        },
        _centerUl : function ( type ){
            if( $.browser.msie && $.browser.version<=8.0 ){
                var l =  50 - (this.count + 0.5) * this._getStyle( this.aLi ) * this._getStyle( this.oUl )/100 ;
            }else{
                var l = ( 0.5 - ( this.count + 0.5 )/this.number ) * this.oWrapperInner.width();
            }

            var distance = l - this.oldLeft;
            this._move( this.oldLeft , distance , this.time , type );
        },
        _setBok : function (){
            this._setCenter(this.count);
            this._setSize();
            this.bOk = true;
        },
        _rightClick : function (number){
            if(!this.bOk) return;
            this.bOk = false;
            this.scale = 1 ;
            this.infinite && this._confirmCount();
            this.count += number;
            if( this.infinite ){
                this._centerUl( 'linear' );
            }else{
                if(this.count > (this.aLi.length-1)) {
                    this.count = this.aLi.length-1;
                }
                this._centerUl( 'linear' );
            }
            this.elem.trigger('moveCenter-before', this);
            this.elem.trigger('moveCenter-next', this);
        },
        _leftClick : function(number){
            if(!this.bOk) return;
            this.bOk = false;
            this.scale = 1;
            this.infinite && this._confirmCount();
            this.count -= number;
            if(this.infinite){
                this._centerUl( 'linear' );
            }else{
                if( this.count < 0 ){
                    this.count = 0;
                }
                this._centerUl( 'linear' );
            }
            this.elem.trigger('moveCenter-before', this);
            this.elem.trigger('moveCenter-prev', this);
        },
        _addLiClickMove : function(e,elem,index,self){
        	if(index > self.count){
                if( !self.mobile ){
                    self._rightClick ( index - self.count );
                }else if( self.mobile && ( (self.dragOrNot && self.startX == self.endX && self.startY == self.endY) || !self.dragOrNot ) && self.bOk ){
                    self._rightClick ( index - self.count );
                }
        	}else if( index < self.count ){
                 if( !self.mobile ){
                    self._leftClick ( self.count - index );
                }else if(self.mobile && ( (self.dragOrNot && self.startX == self.endX && self.startY == self.endY) || !self.dragOrNot ) && self.bOk ){
                    self._leftClick ( self.count - index );
                }
        	}else{
                if(self._addLink(e,elem,index,self))  return;
        	}

        	/* if( self.mobile && self.autoPlay ){
        		self._autoPause();
        		self.autoPlay = false;
        	} */
        	//!self.mobile && e.stopPropagation();
        	//e.stopPropagation();
        	e.preventDefault();

        },
        _removeClickMove : function(e,elem,index,self){
            if( self.notSetSize ){
                if(self._addLinkInner(e,elem,index,self)) return;
            }else{
                if(self._addLink(e,elem,index,self))  return;
                /* if( self.mobile && self.autoPlay ){
                    self._autoPause();
                    self.autoPlay = false;
                } */
            }
            //!self.mobile && e.stopPropagation();
            //e.stopPropagation();
            e.preventDefault();

        },
        _addLink : function(e,elem,index,self){
            if( index == self.count ){
                return self._addLinkInner(e,elem,index,self);
            }
        },
        _addLinkInner : function(e,elem,index,self ){
            /*if( !self.dragOrNot ){
                if( !self.mobile ){
                    return true;
                }else{
                    self.linkTimer && clearTimeout( self.linkTimer );
                    self.linkTimer = setTimeout(function(){
                        var href = elem.closest('a',elem.parents('li',self.oUl)).attr('href');
                        if(href){
                            window.location.href = elem.closest('a',elem.parents('li',self.oUl)).attr('href');
                        }
                    },100);
                    e.preventDefault();
                    return true;
                }

            }else{
                self.linkTimer && clearTimeout( self.linkTimer );

                self.linkTimer = setTimeout(function(){
                    var href = elem.closest('a',elem.parents('li',self.oUl)).attr('href');
                    var target = elem.closest('a',elem.parents('li',self.oUl)).attr('_target');
                    if(href){
                        window.location.href = elem.closest('a',elem.parents('li',self.oUl)).attr('href');
                    }
                },100);
                e.preventDefault();
                return true;
            }*/
            if( self.dragOrNot ){
                if( self.startX == self.endX && self.startY == self.endY && self.bOk && index == self.originCount ){
                    if( !self.mobile ){
                        return true;
                    }else{
                        var href = elem.closest('a',elem.parents('li',self.oUl)).attr('href');
                        var target = elem.closest('a',elem.parents('li',self.oUl)).attr('target');
                        if( href ){
                            if( !target || target =='_self' ){
                                window.location.href = href;
                            }else if( target == '_blank' ){
                                /*var oA = document.createElement('a');
                                oA.href = href;
                                oA.target = target;
                                oA.click();*/

                                window.location.href = href;
                            }
                        }
                        return true;
                    }
                }
            }else{
                if( self.bOk ){
                    return true;
                }
            }

        },
        _confirmUlLeft : function( l ){
            if( this.infinite ){
                if(l<=( this.oWrapperInner.width() /2- (this.aLi.length-(this.number-1)/2-0.5) * this.aLi.width() ) ){
                    l = this.oWrapperInner.width() /2-(this.aLi.length/3-(this.number-1)/2-0.5 + this.aLi.length/3) * this.aLi.width();
                };
                if(l>=0) l = - this.aLi.width() * this.aLi.length/3;

            }else{
                this.oLeft.removeClass('is-disabled');
                this.oRight.removeClass('is-disabled');
                if(l >= ( this.oWrapperInner.width() - this.aLi.width() ) /2){
                     l = ( this.oWrapperInner.width() - this.aLi.width() ) /2;

                     this.timer && clearInterval(this.timer);
                     this.bOk = true;
                     this.oLeft.addClass('is-disabled');
                };
                if(l <= -( this.aLi.width() * (this.aLi.length - 0.5) - this.oWrapperInner.width() /2)){
                    l = -( this.aLi.width() * (this.aLi.length-0.5) - this.oWrapperInner.width() / 2 );
                    this.timer && clearInterval(this.timer);
                    this.bOk = true;
                    this.oRight.addClass('is-disabled');
                }
            }
            return l;
        },
        _confirmCount : function(){
            if( this.count> 2 * this.aLi.length/3 - 1 ){
                this.count = this.count - this.aLi.length/3;
                this._setBok();
            }else if( this.count <= this.aLi.length/3 - 1 ){
                this.count = this.count + this.aLi.length/3;
                this._setBok();
            }
        },
        _drag : function(e){
            var self = this;
            if( !self.mobile ){
                self.startX = e.pageX;
                self.startY = e.pageX;
            }else{
                self.startX = e.originalEvent.changedTouches[0].pageX;
                self.startY = e.originalEvent.changedTouches[0].pageY;
            }
            this.timer && clearInterval(this.timer);
            this.originCount = this.count;
            this.speed = 0;
            //this.bOk = true;
            if(!self.mobile){
                var disX = e.pageX - this.oUl.position().left;
                this.oldMoveClientX = e.pageX;
                this.downDis = e.pageX;
            }else{
                var disX = e.originalEvent.changedTouches[0].pageX - this.oUl.position().left;
                this.oldMoveClientX = e.originalEvent.changedTouches[0].pageX;
                this.downDis = e.originalEvent.changedTouches[0].pageX;
            }
            if(!self.mobile){
                $(document).on( 'mousemove' , fnMove);
                $(document).on( 'mouseup' , fnEnd );
            }else{
                $(document).on( 'touchmove' , fnMove);
                $(document).on( 'touchend' , fnEnd);
            }
            e.preventDefault();
            self.oUl[0].setCapture && self.oUl[0].setCapture();
            return false;

            function fnMove(e){
                //self.linkTimer && clearTimeout(self.linkTimer);
                var l = !self.mobile?(e.pageX - disX):(e.originalEvent.changedTouches[0].pageX - disX);
                l = self._confirmUlLeft( l );
                self.oUl.css( 'left' , l );
                if( $.browser.msie && $.browser.version<=8.0 ){
                    self.oldLeft = l / self.oWrapperInner.width() * 100;
                }else{
                    self.oldLeft = l;
                }

                if(!self.mobile){
                    self.speed = e.pageX - self.oldMoveClientX;
                    self.oldMoveClientX = e.pageX;
                    self.dis = e.pageX - self.downDis;
                }else{
                    self.speed = e.originalEvent.changedTouches[0].pageX - self.oldMoveClientX;
                    self.oldMoveClientX = e.originalEvent.changedTouches[0].pageX;
                    self.dis = e.originalEvent.changedTouches[0].pageX - self.downDis;
                }
                self._setSize();
            }
            function fnEnd( e ){
                if( !self.mobile ){
                    self.endX = e.pageX;
                    self.endY = e.pageX;
                }
            	self.elem.trigger('moveCenter-before', self);
                self.scale = 1;
                self.bOk = false;
                if(Math.abs(self.speed) <= ( 1 - Math.pow( ( 1-  1/Math.round( self.time / 30 ) ) , 3) ) * self.oWrapperInner.width() / self.number /*15*/ ){
                    if( Math.abs(self.dis) > self.moveDis && self.speed >0 && self.count == self.originCount ){
                       self.count--;
                       if(!self.infinite && self.count<0){
                            self.count=0;
                       }
                    }
                    if( Math.abs(self.dis) > self.moveDis && self.speed <0 && self.count == self.originCount ){
                           self.count++;
                           if(!self.infinite && self.count > self.aLi.length-1){
                                self.count = self.aLi.length-1;
                           }
                    }
                    var dis = Math.abs( self.oUl.position().left + self.aLi.eq(self.count).position().left + self.aLi.width() /2 - self.oWrapperInner.width() /2 );

                    self.scale = dis / ( self.oWrapperInner.width() * self.disScale ) * 5;
                    self._centerUl( 'linear' );
                }else{
                    self.timer && clearInterval(self.timer);
                    self.timer = setInterval(function(){
                        //self.linkTimer && clearTimeout(self.linkTimer);
                        self.speed *= 0.9;
                        if( $.browser.msie && $.browser.version<=8.0 ){
                            var l = self._confirmUlLeft( self.oUl.position().left + self.speed );
                            self.oUl.css('left' , l );
                            self.oldLeft = l / self.oWrapperInner.width() * 100;
                        }else{
                            self.oldLeft += self.speed;
                            self.oldLeft = self._confirmUlLeft(self.oldLeft);
                            self.oUl.css('left' , self.oldLeft);
                        }

                        self._setSize();
                        if(Math.abs(self.speed) <= ( 1 - Math.pow( ( 1-  1/Math.round( self.time / 30 ) ) , 3) ) * self.oWrapperInner.width() / self.number /*15*/ && self.speed >= 0){
                            clearInterval(self.timer);
                            var dis = self.oUl.position().left + self.aLi.eq(self.count).position().left + self.aLi.width() /2 - self.oWrapperInner.width() /2;
                            if(dis <= 0){
                                self._centerUl( 'ease-out' );
                            }else{
                                self.scale = 1;
                                self.count --;
                                if(self.infinite){
                                    self._centerUl( 'ease-out' );
                                }else{
                                    if( self.count < 0 ){
                                        self.count = 0;
                                    }
                                    self._centerUl( 'ease-out' );
                                }
                            }
                        }else if(Math.abs(self.speed) <= ( 1 - Math.pow( ( 1-  1/Math.round( self.time / 30 ) ) , 3) ) * self.oWrapperInner.width() / self.number/*15*/ && self.speed <= 0){
                            clearInterval(self.timer);
                            var dis = self.oUl.position().left + self.aLi.eq(self.count).position().left + self.aLi.width() /2 - self.oWrapperInner.width() /2;
                            if(dis >= 0){
                                self._centerUl( 'ease-out' );
                            }else{
                                self.scale = 1 ;
                                self.count ++;
                                if( self.infinite ){
                                    self._centerUl( 'ease-out' );
                                }else{
                                    if(self.count > (self.aLi.length-1)) {
                                        self.count = self.aLi.length-1;
                                    }
                                    self._centerUl( 'ease-out' );
                                }
                            }
                        }
                    },30);
                }
                if(!self.mobile){
                    $(document).off('mousemove' , fnMove);
                    $(document).off('mouseup' , fnEnd);
                }else{
                    $(document).off('touchmove' , fnMove);
                    $(document).off('touchend' , fnEnd);
                }
                self.oUl[0].releaseCapture && self.oUl[0].releaseCapture();
            };
        },
        _setMaxSize : function(){
            if( !this.equalHeight && this.number >= 5 ){
                this.maxSize = this.originScaleWidthFarther;
            }else{
                this.maxSize = this.originScaleWidth;
            }
        },
        _move : function( start , distance , time , type ){
            var self = this;
            this.bOk = false;
            var count = Math.round( time * this.scale / 30 );
            if(count <= 0 ){
                this.bOk = true;
                self.elem.trigger('moveCenter-after', self);
                return;
            }
            var n = 0;
            this.timer && clearInterval(this.timer);
            this.timer = setInterval(function(){
                //self.linkTimer && clearTimeout(self.linkTimer);
                n++;
                if( type == 'linear' ){
                    self.oldLeft += distance / count;
                    if( $.browser.msie && $.browser.version<=8.0 ){
                        self.oUl.css( 'left' , self.oldLeft + '%');
                    }else{
                        self.oUl.css('left' , self.oldLeft);
                    }

                }else if( type == 'ease-out' ){
                    self.oldLeft = start + ( 1 - Math.pow( ( 1-  n/count ) , 3) ) * distance;
                    if( $.browser.msie && $.browser.version<=8.0 ){
                        self.oUl.css( 'left' , self.oldLeft + '%');
                    }else{
                        self.oUl.css('left' , self.oldLeft);
                    }
                }

                self.timer && self._setSize();
                if(n == count){
                    clearInterval( self.timer );
                    if( self.infinite ){
                        if( self.count >= self.aLi.length-1-(self.number-1)/2 ){
                            self.count = self.count - self.aLi.length/3;
                            self._setBok();
                        }
                        if( self.count<=(self.number-1)/2 ){
                            self.count = self.count + self.aLi.length/3;
                            self._setBok();
                        }
                        self.bOk = true;
                        self.elem.trigger('moveCenter-after', self);
                        return;
                    }else{
                        if( self.count <= 0 ){
                            self.oLeft.addClass( 'is-disabled' );
                        }else if( self.count >= self.aLi.length-1){
                            self.oRight.addClass( 'is-disabled' );
                            if( self.autoPlay && self.autoPlayTimer ){
                            	self.count=0;
                            	self._setBok();
                            }
                        }else{
                            self.oLeft.removeClass( 'is-disabled' );
                            self.oRight.removeClass( 'is-disabled' );
                        }
                    };
                    self.bOk = true;
                    self.elem.trigger('moveCenter-after', self);
                }
            }, 30 );
        },
        _addWheel : function( self , obj , fn ){
            if( navigator.userAgent.toLowerCase().indexOf('firefox') != -1 ){
                self._addEvent( obj , 'DOMMouseScroll' , wheel );
            }else{
                self._addEvent( obj , 'mousewheel' , wheel );

            }
            function wheel(e){
                var e = e || event;
                var down = e.wheelDelta?e.wheelDelta<0:e.detail>0;
                fn && fn( down );
                e.preventDefault && e.preventDefault();
                return false;
            }
        },
        removeWheel : function(){
            if( !this.mobile && this.addPcScroll ){
                this._removeWheel( this.oWrapperInner[0] );
            }
        },
        _removeWheel : function( obj ){
            if( navigator.userAgent.toLowerCase().indexOf('firefox') != -1 ){
                this._removeEvent( obj , 'DOMMouseScroll' , obj.moveCenterAddPcScroll );
            }else{
                this._removeEvent( obj , 'mousewheel' , obj.moveCenterAddPcScroll );
            }
        },
        _addEvent : function( obj , sEvent , fn ){
            obj.moveCenterAddPcScroll = fn;
            if( obj.addEventListener ){
                obj.addEventListener( sEvent , fn ,false );
            }else{
                obj.attachEvent('on'+sEvent , fn );
            }
        },
         _removeEvent : function( obj , sEvent , fn ){
            if( obj.addEventListener ){
                obj.removeEventListener( sEvent , fn ,false );
            }else{
                obj.detachEvent('on'+sEvent , fn );
            }
        },
        _getScale : function( x , y, scale ){
        	return ((100/x)*y+(50/x)-50)/100/(1- scale);
        },
        _getStyle : function( obj ){
            return parseFloat( ( obj[0].currentStyle || getComputedStyle( obj[0] , false ) ) ['width'] );
        },
        _browserRedirect : function(){
            var sUserAgent = navigator.userAgent.toLowerCase();
            var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
            var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
            var bIsMidp = sUserAgent.match(/midp/i) == "midp";
            var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
            var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
            var bIsAndroid = sUserAgent.match(/android/i) == "android";
            var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
            var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
            if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
                this.mobile = true;
            } else {
                this.mobile = false;
            }
        }
    }

    function plugin( selector, option ) {
        $(selector).each(function( index, self ){
            var $self = $(self)
                , data  = $self.data('moveCenter');
            if (data){
                data.destroy();
            }
            $self.data('moveCenter', (data = new moveCenter($self, option)));
            rtn.push(data);
        });
        return rtn;
    }
    $.fn.moveCenter = function(option){
        this.each(function(index, element){
            var data  = $(element).data('moveCenter');
            if (data){
                data.destroy();
            }else{
                data = new moveCenter($(element), option)
                $(element).data('moveCenter', data);
            }
            
        })
    }

})(jQuery);
