var sWidth,sHeight,sShort;

sWidth=window.screen.width;
sHeight=window.screen.height;

//alert(sWidth);

//sWidth=320;		//for test
//sHeight=800;	//for test

sShort=sWidth;
if(sHeight < sWidth)
	sShort=sHeight;

document.write("<style type='text/css'>.STYLE1 {color: #CC0033;font-size: large;}");
document.write("input {vertical-align:middle;");
if (sShort < 760)
{
	document.write("height:30px;font-size:16px;}");
	document.write("td.bttext {font-size:medium;vertical-align:middle;}");
	document.write("input.num {height:28px;width:28px;font-size:18px;}");
	document.write("input.snum {width:27px;height:20px;}");
	document.write("select {font-size:medium;}");
	document.write("table.stable {margin-top:1px;font-size:30px;}");
}
else if (sShort < 1024)
{
	document.write("height:35px;font-size:25px;margin-right:3px;margin-top:5px;}");
	document.write("td.bttext {font-size:25px;vertical-align:middle;}");
	document.write("input.num {height:40px;width:40px;font-size:30px;}");
	document.write("input.snum {width:46px;height:30px;}");
	document.write("input.hint {height:30px;width:30px;}");
	document.write("select {font-size:25px;}");
	document.write("table.stable {margin-top:5px;font-size:50px;}");
}
else
{
	document.write("height:50px;font-size:35px;margin-right:3px;margin-top:10px;}");
	document.write("td.bttext {font-size:35px;vertical-align:middle;}");
	document.write("input.num {height:60px;width:60px;font-size:45px;margin-right:7px;}");
	document.write("input.snum {width:66px;height:40px;}");
	document.write("input.hint {height:45px;width:45px;}");
	document.write("select {font-size:35px;height:45px;}");
	document.write("table.stable {margin-top:40px;font-size:75px;}");
}
document.write("</style>");
