参数
通过下面表格了解插件参数配置的具体的用法。

参数名	类型	默认值	描述
id	string	null	外围容器选择器
infinite	boolean	false	是否无限轮播或循环
number	number	3	整屏放置的内容数量(只能选择3或5)
equalHeight	boolean	true	参数number为5时,最外侧内容与内侧内容是否等高
prevOrNot	boolean	false	是否添加点击实现上一张(或下一组)
nextOrNot	boolean	false	是否添加点击实现下一张(或下一组)
dragOrNot	boolean	true	是否添加拖拽功能
clickOrNot	boolean	false	点击任意图片运动到中心,或者点击部分用a包裹有链接
dots	boolean	false	是否显示圆点按钮
initCount	Object	{ set : false, initCountNumber : 0 }	set: 是否初始化第一个默认图片; initCountNumber : 初始化图片的index值
breakpoints	Object	{ set : false, width : 1024, number : 3 }	set: 是否改变显示图片数量; width: 改变数量临界值; number: 临界值时图片数量
selfCalc	Object	{ set : false, secondScale : 0.75 }	set:最外侧图片是否出现叠加(有opacity 透明效果,建议此值为false); secondScale: 中心两侧图片缩放的scale值
addPcScroll	boolean	false	pc端是否增加滚轮事件
autoPlay	boolean	false	是否自动轮播
autoPlayTime	number	1000	自动轮播间隔时间(单位:ms)
set3D	boolean	false	是否出现3d层叠效果(见例9,例10)
time	number	700	单位：ms,点击开始到运动结束时间
tabClass	string	is-active	当前居于中心'li'的类名
leftClass	string	left	中心左边的li类名(添加为left1,left2..)
rightClass	string	right	中心右边的li类名(添加为right1,right2..)
addClickClass	string	movecenter-click	clickOrNot为true时,需要添加点击的类名 或 点击部分用a包裹有链接时
scrollNumber	number	1	点击prev和next时一次性轮播的内容个数(默认为1,可选择实现多图轮播)
secondScale	number	0.5	中心两侧设置的scale大小(set3D为true时,此值不可调)
minScale	number	0.5	限制最外侧内容的比例(最外侧内容比例永远>=此值)
moveDis	number	100	微小拖动时,多长距离实现下一张或上一张(单位:px)
notSetSize	boolean	false	两侧不希望等比缩放,此值为true,同时setSize函数为空函数
setSize	function	function(objParent,scale,oUl,self){
  if( $.browser.msie && $.browser.version<=8.0 ){
    var $obj = objParent.find('a');
    $obj.css( 'width' , scale*100+'%' );
    $obj.css( 'marginTop' , oUl.height()*(1-scale)/2 );
    $obj.css('opacity' , scale );
  }else{
    var $obj = objParent.find('a');
    $obj.css( 'transform' , 'scale('+scale+')' );
    $obj.css('opacity' , scale );
  } }	利用scale设置li标签或子内容样式;setSize函数为空时可实现等高轮播效果
这个插件提供了一些方法：
prev(): 切换到上一张(上一组)
next(): 切换到下一张(下一组)
scroll( number , time ): 指定时间内切换到指定的内容(指定内容序号从1开始)
destroy(): 删除插件


这个插件提供了一些事件：
moveCenter-before: 运动开始
moveCenter-after: 运动结束
moveCenter-next: 点击 下一张/下一组
moveCenter-prev点击 上一张/上一组
可以通过elem.on('事件名',function( e , o){ } ) 编写事件触发函数。
***不能对li进行缩放,否则插件中的position().left有问题
