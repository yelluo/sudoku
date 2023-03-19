var BigTable=document.getElementById("alltab");
var TotalNum=0,Error=0,ReadData=1,SolveAll=0,AutoFlag=0,t,clicktype="no",method="no",solve="normal";
var TryRow=0,TryCol=0,TryIndex=0,TryAgain=0,TryTimes=0,CountTry=0,findone=0,tnum;
//通过推理发现(findrow+1)行(findcol+1)列只能填数字findnumber
//findcell为只有一个候选数的单元格编号(1-81)
var findrow=0,findcol=0,findnumber=0,findcell=0;

var TableArray=new Array();
var TableArray2=new Array();
var CountNum=new Array();
var CountVoid=new Array();
var VoidNum=new Array();
var CountInput=new Array();
var tableWidth,cellWidth,	sWidth=0,sHeight=0;
var xmldoc;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
      //app.receivedEvent('deviceready');
      //navigator.splashscreen.show();
      setInterval("IntCheck()",10);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

for(var i=0;i<9;i++)
{
	TableArray[i]=new Array();
	TableArray2[i]=new Array();
	CountNum[i]=new Array();
	CountVoid[i]=new Array();
}

//全局变量  当前操作的表格
mobj = null;
//点击时替换表格内容
var fn = function(){
	//记录触发事件的对象
	var o = event.srcElement, row, col;
	//判断是否为文本框
	if (o.type == "text") {
		o.focus();
	}
	else
	//判断是否为可操作表格
		if (o.type == "mytd" && document.getElementById("SelectNum").value != "0") {
			o.innerText=document.getElementById("SelectNum").value;
			row=Number(o.getAttribute('rowid'));
			col=Number(o.getAttribute('colid'));
			TableArray[row][col]=o.innerText;
			CheckNumAvailable();
		}
}

init();

function init(){            
	var tables = document.getElementsByTagName("table");
	
	//alert("新增功能：\n1.实时显示计算进程。\n2.自定义数独，一次输入整个数独信息。\n3.一键自动解谜，通过推理和自动尝试解出所有参与测试的数独题目。");
	sWidth=window.screen.width;
	sHeight=window.screen.height;
	
	//sWidth=480;		//for test
	//sHeight=800;	//for test
	//alert("init: "+document.documentElement.clientWidth);
	if(sHeight > sWidth)
		cellWidth=parseInt(sWidth*0.97/9);		
	else
		cellWidth=parseInt(sHeight*0.65/9);
	tableWidth=cellWidth*9+10;
		
	for (i = 0; i < tables.length; i++) {
//标记type为mtable的表格，处理为可操作表格
		//alert(tables[i].id);
		if (tables[i].id == "alltab" || tables[i].type == "mtable") {
			document.getElementById("alltab").setAttribute('width',tableWidth);
			var tds = tables[i].getElementsByTagName("td");
			for (j = 0; j < tds.length; j++) {
					tds[j].onclick = fn;
					tds[j].type = "mytd";
					tds[j].setAttribute('width',cellWidth);
					tds[j].setAttribute('height',cellWidth);
					tds[j].setAttribute('rowid',parseInt(j/9));
					tds[j].setAttribute('colid',j%9);
			}
		}
	}	
	FirstSudoku();
	TestXML();
	IntCheck();
	//alert("a"+TrimStr(" 1 ")+"b");
}

function IntCheck()
{
	if(method == "AutoAll")
	{
		var tnum=TotalNum;
		AutoFindOne();
		if(tnum == TotalNum || TotalNum >= 81)
		{
			method="no";
			CheckEnd();
		}
	}
}

// 直接设定打开网页显示的第一个数独，避免从xml文件读取有延迟
function FirstSudoku()
{
	TableArray[0]=["7","4"," ",  "6","3"," ", " "," "," "];
	TableArray[1]=[" "," "," ",  " "," "," ", " "," "," "];
	TableArray[2]=[" "," ","5",  "2"," "," ", " ","3"," "];

	TableArray[3]=["6"," ","3",  " "," ","5", " ","4"," "];
	TableArray[4]=[" ","1"," ",  " ","6"," ", " ","8"," "];
	TableArray[5]=[" ","8"," ",  "7"," "," ", "2"," ","3"];

	TableArray[6]=[" ","7"," ",  " "," ","2", "9"," "," "];
	TableArray[7]=[" "," "," ",  " "," "," ", " "," "," "];
	TableArray[8]=[" "," "," ",  " ","4","3", " ","1","6"];

	// TableArray[0]=["4"," "," ",  " "," "," ",  " ","8"," "];
	// TableArray[1]=[" "," ","8",  "4"," ","5",  " "," "," "];
	// TableArray[2]=[" "," ","9",  "8"," ","7",  " "," "," "];

	// TableArray[3]=["8"," "," ",  " ","6"," ",  " "," "," "];
	// TableArray[4]=[" "," "," ",  " ","5","8",  "7"," ","9"];
	// TableArray[5]=[" ","3"," ",  " ","4"," ",  "8"," ","5"];

	// TableArray[6]=[" "," "," ",  " ","8"," ",  " "," "," "];
	// TableArray[7]=[" ","8","5",  " ","7","4",  " "," ","1"];
	// TableArray[8]=[" "," "," ",  " ","3"," ",  " ","4","8"];
	
	SetTableValues();	
	SetBgColor();
}

function OnSelectNum(num)				//按下数字按钮
{
	var lastnum=document.getElementById("SelectNum").value;
	if(lastnum == " ")
		lastnum="C";
	if(lastnum != "0")
		eval("document.getElementById('buttonN"+lastnum+"').disabled=false;");
	document.getElementById("SelectNum").value=num;
	if(num == " ")
		num="C";
	eval("document.getElementById('buttonN"+num+"').disabled=true;");
}

function DelAllNums()					//清除表格中所有数字
{
	var row,col;
	
	for(row=0;row<9;row++)
	{
		for(col=0;col<9;col++)
			BigTable.rows[row].cells[col].innerText=" ";
	}
}

function SelectSudoku()	//无法从xml文件中读取数独题目时，从以下五个题目中选择
{
	switch(Number(document.getElementById("SudokuID").value))
	{
		case 0:
			TableArray[0]=["7","4"," ", "6","3"," ", " "," "," "];
			TableArray[1]=[" "," "," ", " "," "," ", " "," "," "];
			TableArray[2]=[" "," ","5", "2"," "," ", " ","3"," "];
			TableArray[3]=["6"," ","3", " "," ","5", " ","4"," "];
			TableArray[4]=[" ","1"," ", " ","6"," ", " ","8"," "];
			TableArray[5]=[" ","8"," ", "7"," "," ", "2"," ","3"];
			TableArray[6]=[" ","7"," ", " "," ","2", "9"," "," "];
			TableArray[7]=[" "," "," ", " "," "," ", " "," "," "];
			TableArray[8]=[" "," "," ", " ","4","3", " ","1","6"];
			break;
		case 1:
			TableArray[0]=[" "," ","9", " "," "," ", " "," "," "];
			TableArray[1]=["1"," "," ", " ","8"," ", " "," ","4"];
			TableArray[2]=["6"," "," ", " ","2"," ", " ","7"," "];
			TableArray[3]=[" ","4"," ", "1"," "," ", " "," ","8"];
			TableArray[4]=[" "," ","2", " ","7"," ", "6"," "," "];
			TableArray[5]=["3"," "," ", " "," "," ", " ","5"," "];
			TableArray[6]=[" ","8"," ", " ","3"," ", " "," ","1"];
			TableArray[7]=["5"," "," ", " ","4"," ", " "," ","9"];
			TableArray[8]=[" "," "," ", " "," "," ", "2"," "," "];
			break;
		case 2:
			TableArray[0]=[" "," "," ", " "," ","4", "3"," ","6"];
			TableArray[1]=[" "," ","2", " "," "," ", "1","7"," "];
			TableArray[2]=[" "," "," ", "8"," "," ", " "," "," "];
			TableArray[3]=[" ","5"," ", "4","3"," ", " "," "," "];
			TableArray[4]=["4"," "," ", "6"," ","5", " "," ","9"];
			TableArray[5]=[" "," "," ", " ","2","7", " ","4"," "];
			TableArray[6]=[" "," "," ", " "," ","8", " "," "," "];
			TableArray[7]=[" ","4","9", " "," "," ", "2"," "," "];
			TableArray[8]=["3"," ","6", "1"," "," ", " "," "," "];
			break;
		case 3:
			TableArray[0]=[" ","4"," ", " "," ","8", " "," "," "];
			TableArray[1]=[" ","6"," ", " ","4"," ", " ","3","8"];
			TableArray[2]=[" "," ","1", "2"," "," ", "4"," "," "];
			TableArray[3]=["2"," "," ", "6"," ","7", "5"," "," "];
			TableArray[4]=[" ","5"," ", " ","2"," ", " ","9"," "];
			TableArray[5]=[" "," ","3", "8","5","9", " "," ","2"];
			TableArray[6]=[" "," ","6", " "," ","2", "9"," "," "];
			TableArray[7]=["9","3"," ", " ","8","6", " ","2"," "];
			TableArray[8]=[" ","2"," ", "7","9"," ", " ","6"," "];
			break;
		case 4:
			TableArray[0]=[" "," "," ", "7","5"," ", " "," "," "];
			TableArray[1]=[" ","3"," ", " ","4","8", " ","2"," "];
			TableArray[2]=["1"," "," ", " "," "," ", " "," ","6"];
			TableArray[3]=[" ","4"," ", " "," "," ", " "," ","8"];
			TableArray[4]=["7","9"," ", " "," "," ", " ","3","1"];
			TableArray[5]=["2"," "," ", " "," "," ", " ","7"," "];
			TableArray[6]=["5"," "," ", " "," "," ", " "," ","7"];
			TableArray[7]=[" ","8"," ", "3","2"," ", " ","4"," "];
			TableArray[8]=[" "," "," ", " ","6","9", " "," "," "];
			break;
		default:			
	}	
}

function NextSudoku()
{
	clicktype="no";
	if(ReadData == 0)
	{
		document.getElementById("SudokuID").value=(Number(document.getElementById("SudokuID").value)+1)%5;
		SelectSudoku();
	}
	else
	{
		document.getElementById("SudokuID").value=(Number(document.getElementById("SudokuID").value)+1)%501;
		ReadXML();
	}
	SudokuNum();
	SetTableValues();
	SolveAll=0;
	//TotalNum=0;				'已经在SetTableValues中初始化
	TryRow=0;
	TryCol=0;
	TryIndex=0;
	AutoFlag=0;
	CountTry=0;
	findone=0;
	VoidNum=[];
	SetBgColor();
	if(document.getElementById('VoidNums').checked == true)
		ShowVoidNums();
}

//数独编号变化时，更新游戏难度
function SudokuNum()
{
	var id=Number(document.getElementById("SudokuID").value);
	if(id < 100)
		document.getElementById("Difficulty").options[0].selected=true;
	else if(id >= 100 && id < 200)
		document.getElementById("Difficulty").options[1].selected=true;
	else if(id >= 200 && id < 300)
		document.getElementById("Difficulty").options[2].selected=true;
	else if(id >= 300 && id < 400)
		document.getElementById("Difficulty").options[3].selected=true;
	else if(id >= 400 && id < 500)
		document.getElementById("Difficulty").options[4].selected=true;	
}

function ChangeSudoku()
{
	SudokuNum();
	document.getElementById("SudokuID").value=Number(document.getElementById("SudokuID").value)-1;
	NextSudoku();
}

function ChangeDifficutly()
{
	var number=Number(document.getElementById("SudokuID").value);
	var diff=Number(document.getElementById("Difficulty").value);
	
	number=number%100;
	document.getElementById("SudokuID").value=number+100*diff-1;
	NextSudoku();
}

function TestXML()  //测试能否从xml文件中读取不同数独题目的数据
{
	try //Internet Explorer
  {
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async=false;
		xmlDoc.load("Sudokus.xml");
	}
	catch(e)
	{
		try //Firefox, Mozilla, Opera, etc.
		{
			xmlDoc=document.implementation.createDocument("","",null);
			xmlDoc.async=false;
			xmlDoc.load("Sudokus.xml");
		}
		catch(e) 
		{
			try //Google Chrome  
			{  
				var xmlhttp = new window.XMLHttpRequest();  
				xmlhttp.open("GET","Sudokus.xml",false);  
				xmlhttp.send(null);  
				xmlDoc = xmlhttp.responseXML.documentElement;  
			}  
			catch(e)  
			{  
				error=e.message;  
			}  
		}
	}  

	var tags=xmlDoc.getElementsByTagName("Data");
	var length=tags.length;

	if(length == 0)
	{
		ReadData=0;
		document.getElementById("SudokuNum").value=5;
	}
	else
	{
		ReadData=1;
		document.getElementById("SudokuNum").value=500;
	}
}

function ReadXML()
{
	var tags=xmlDoc.getElementsByTagName("Data");
	var length=tags.length;
	var SudokuID=Number(document.getElementById("SudokuID").value)*81;
	var row,col,index,node;
	for(row=0;row<9;row++)
	{
		for(col=0;col<9;col++)
		{
			index=SudokuID+row*9+col;
			node=tags[index].childNodes[0];
			if (node != null)
				TableArray[row][col]=node.nodeValue;
			else
				TableArray[row][col]=" ";
		}
	}	
}

function GetTableValues()	//读取网页中表格里的数据
{
	var row,col;
	
	TotalNum=0;					//数独中已填数字总数（包括初始数字）
	for(row=0;row<9;row++)
	{
		for(col=0;col<9;col++)
		{
			//TableArray[row][col]=BigTable.rows[row].cells[col].innerText;
			if(TrimStr(TableArray[row][col]) != "")
				TotalNum++;
		}
	}
	if(CheckSudoku() == false)
		Error=1;
	else if(TotalNum >= 81)
	{
		Error=0;
		CheckEnd();
	}
}

function SetTableValues()	//设置网页中表格里的数据
{
	var row,col;
	
	TotalNum=0;
	for(row=0;row<9;row++)
	{
		for(col=0;col<9;col++)
		{
			BigTable.rows[row].cells[col].innerText=TableArray[row][col];
			if(TrimStr(TableArray[row][col]) != "")
				TotalNum++;
		}
	}
}

function CheckSudoku()	//检查是否违反数独定义（行、列或九宫格内有重复数字）
{
	var row,col,num,index,trow,tcol,count;
	
	for(num=1;num<=9;num++)
	{
		for(row=0;row<9;row++)
		{
			count=0;
			for(col=0;col<9;col++)
			{
				if(TableArray[row][col] == num)
					count++;
			}
			if(count > 1)
			{
				alert("第"+(row+1)+"行有重复数字："+num);
				return false;
			}
		}
		for(col=0;col<9;col++)
		{
			count=0;
			for(row=0;row<9;row++)
			{
				if(TableArray[row][col] == num)
					count++;
			}
			if(count > 1)
			{
				alert("第"+(col+1)+"列有重复数字："+num);
				return false;
			}
		}
		for(index=0;index<9;index++)
		{
			count=0;
			trow=parseInt(index/3)*3;
			tcol=(index%3)*3;
			for(row=trow;row<trow+3;row++)
			{
				for(col=tcol;col<tcol+3;col++)
				{
					if(TableArray[row][col] == num)
						count++;
				}				
			}
			if(count > 1)
			{
				alert("第"+(parseInt(index/3)+1)+"行第"+(index%3+1)+"个九宫格有重复数字："+num);
				return false;
			}
		}
	}
	return true;
}


/*CheckNumAvailable()		//获得每个数字所能填入的空格信息（空格总数和每个空格的行标、列标）CountNum
CheckVoidsNum()				//分析每个空格能够填入的数字（候选数总数和每个候选数）VoidNum
CheckVoids()					//获得每个九宫格的空格分布（空格数和每个空格的行标、列标）CountVoid

CheckCellUnique()			//检查每个空格的填入可能性，更新findrow、findcol、findnumber，下同
CheckMUnique()				//检查九宫内数字填入的可能性
CheckCUnique()				//检查列内的数字可填充性
CheckRUnique()				//检查行内的数字可填充性

UpdateVoidsNum(row,col,num)	//在某个空格填入数字后，更新空格的候选数列表（该行、列和九宫格内其它空格将不能填这个数字）
														//返回只有一个候选数的空格编号（1-81），返回0表示每个空格都有2个以上的候选数
FindVoidsNum()							//一个或多个空格的候选数更新后，需检查是否存在只有一个候选数的空格
														//返回可填入数字的空格编号（1-81）,返回0表示找不到有唯一候选数的空格，表示-1表示数独错误
InputNum()									//根据推理结果，在某个空格填入数字，返回新填入数字的空格编号（1-81）,表示-1表示数独错误

TwoVoidsRow()					//同一行的两个空格可填入的数字完全相同，将减小该行其它空格的数字可填性，有更新返回true，否则返回false，下同
TwoVoidsCol()					//同一列的两个空格可填入的数字完全相同，将减小该列其它空格的数字可填性
TwoNumVoidsRow()			//两个数子只能填在同一行的两个空格，则这两个空格不能填其它数字
TwoNumVoidsCol()			//两个数子只能填在同一列的两个空格，则这两个空格不能填其它数字
ColVoidsM()						//某一列有多个空格属于同一九宫格，且有一个数在这一列只能填在这几个空格里，
											//则所在九宫格内的其它空格不能填这个数字
RowVoidsM()						//某一行有多个空格属于同一九宫格，且有一个数在这一行只能填在这几个空格里，
											//则所在九宫格内的其它空格不能填这个数字
MatrixVoidsRow()			//九宫格内几个空格属于同一行，某个数字在该九宫格内只能填在这几个空格里，
											//则该行其它空格不能填该数字
MatrixVoidsCol()			//九宫格内几个空格属于同一列，某个数字在该九宫格内只能填在这几个空格里，
											//则该列其它空格不能填该数字
RectVoids()						//找到四个可组成长方形的空格，某个数字必须填在长方形两个相对的角上			*/

function AutoFindOne()	//自动找到一个可以填入的空格和数字，130425增加
{
	//GetTableValues();
	var tn=TotalNum;
	if(TotalNum < 81)
	{
		CheckNumAvailable();
		if(VoidNum.length == 0)
			CheckVoidsNum();
		if(CheckCellUnique() || CheckRUnique() || CheckCUnique() || CheckMUnique())
		{
			InputNum(0);	//通过常规检查直接找到可填数字
			//if(solve=="Advanced")
			if(clicktype == "HintNum")
				findcell=UpdateVoidsNum(findrow,findcol,findnumber);
		}
		//GetTableValues();		//SetTableValues中初始化TotalNum，InputNum中更新TotalNum
		//常规检查不能填入数字：
		// if(clicktype == "HintNum" && tn == TotalNum)
		else
		{
			solve="Advanced";			
			findcell=FindVoidsNum();
			if(findcell > 0)
			{
				findrow=parseInt((findcell-1)/9);
				findcol=(findcell-1)%9;
				//alert(findrow+","+findcol);
				findnumber=VoidNum[findrow][findcol][1];
				InputNum(1);								//通过更新候选数找到可填数字
				findcell=UpdateVoidsNum(findrow,findcol,findnumber);
			}
			else
			{
				while(1)
				{
					if(TwoVoidsRow() || TwoVoidsCol() || TwoNumVoidsRow() || TwoNumVoidsCol() || RowVoidsM() || ColVoidsM() || MatrixVoidsRow() || MatrixVoidsCol() || RectVoidsRow() || RectVoidsCol() || ThreeVoidsRow() || ThreeVoidsCol() || ThreeVoidsM() || FourVoidsRow() || FourVoidsCol() || FourVoidsM())
					{
						findcell=FindVoidsNum();
						if(findcell > 0)
						{
							findrow=parseInt((findcell-1)/9);
							findcol=(findcell-1)%9;
							//alert(findcell+":"+findrow+","+findcol);
							findnumber=VoidNum[findrow][findcol][1];
							//alert(findrow+","+findcol);
							InputNum(1);
							findcell=UpdateVoidsNum(findrow,findcol,findnumber);
							break;
						}
						else
							continue;
					}
					else
					{
						break;
					}
				}				
			}
		}
	}
	else if(method == "no")
		CheckEnd();
}

function AutoAll()
{
	var tnum;
	
	method="AutoAll";
	findone=0;
	clicktype="HintNum";
	//CheckAdvUnique2();
}

function CheckEnd()	//检查结束状态
{
	//alert(findone+','+Error);
	if(findone)
		findone=0;
	if(Error == 0)
	{
			if(TotalNum >= 81)
			{
				if(SolveAll == 0)
				{
					if(AutoFlag == 0)
					{
						if(solve == "normal")
							setTimeout("alert('通过常规检查搞定这个数独。')",1);
						else
							setTimeout("alert('通过高级检查搞定这个数独。')",1);
					}
				}
			}
			else if(TotalNum == 0)
			{
				if(AutoFlag == 0)
				{
					alert("这个超难，通过推理我一个都不会填！看来只能尝试填入了。");
				}
			}
			else
			{
				alert("这个超难，通过推理我只会填这么多，看来只能尝试填入了。");
			}
	}
	else
	{
		Error=0;
	}
}

function SetBgColor()
{
	var row,col;
	for(row=0;row<9;row++)
	{
		for(col=0;col<9;col++)
		{
			if((row<3 && (col<3 || col>5)) || (row>=3 && row<=5 && col>=3 && col<=5) || (row >5 && (col<3 || col>5)))
				BigTable.rows[row].cells[col].bgColor="#DDDDDD";
			else
				BigTable.rows[row].cells[col].bgColor="#FFFFFF";
		}
	}
}

function TestRow(num,row)
{
	var col;
	for(col=0;col<9;col++)
	{
		if(TableArray[row][col] == num)
		  return false;
	}
	if(col>=9)
		return true;
}

function TestCol(num,col)
{
	var row;
	for(row=0;row<9;row++)
	{
		if(TableArray[row][col] == num)
		  return false;
	}
	if(row>=9)
		return true;
}

function TestSmallTable(num,row,col)
{
	var i,j,row1,col1;
	//alert(row);
	row1=parseInt(row/3);
	col1=parseInt(col/3);
	//alert(row1);
	for(i=0;i<3;i++)
	{
		for(j=0;j<3;j++)
		{
			//alert(TableArray[i+row1*3][j+col1*3]);
			if(TableArray[i+row1*3][j+col1*3] == num)
				return false;
		}
	}
	return true;
}

//获得每个数字所能填入的空格信息（空格总数和每个空格的行标、列标）
function CheckNumAvailable()
{
	var row,col,number,num;
	
	for(num=1;num<=9;num++)
	{
		CountNum[num-1][0]=0;		//CountNum[0][0]表示数字1的可填入空格数，
									//CountNum[0][1]表示1可填入的第一个空格的行标，CountNum[0][2]表示1可填入的第一个空格的列标
	}
	GetTableValues();
	for(row=0;row<9;row++)
	{
		//alert(row);
		for(col=0;col<9;col++)
		{
			number=TableArray[row][col];
			if(TrimStr(number) != "")
				continue;
			for(num=1;num<=9;num++)
			{
				if(TestRow(num,row) == true && TestCol(num,col) == true && TestSmallTable(num,row,col) == true)
				{
					CountNum[num-1][CountNum[num-1][0]*2+1]=row;
					CountNum[num-1][CountNum[num-1][0]*2+2]=col;
					CountNum[num-1][0]++;
				}
			}
		}
	}
}

//获得每个九宫格的空格分布（空格数和每个空格的行标、列标）
function CheckVoids()
{
	var row,col,number,num;
	
	if(Error || (findone && clicktype != "AutoAll" && clicktype != "AutoTry"))
		return;
	for(row=0;row<9;row++)					//9个九宫格的空格数
	{
		CountVoid[row][0]=0;
	}
	//CheckNumAvailable();						//？？
	for(row=0;row<9;row++)
	{
		for(col=0;col<9;col++)
		{
			number=TableArray[row][col];
			num=parseInt(row/3)*3+parseInt(col/3);			//9个九宫格的编号：从左到右，从上到下
			if(TrimStr(number) == "")
			{
				CountVoid[num][CountVoid[num][0]*2+1]=row;
				CountVoid[num][CountVoid[num][0]*2+2]=col;
				CountVoid[num][0]++;
			}			
		}
	}	
}

//分析每个空格能够填入的数字（候选数总数和每个候选数）
function CheckVoidsNum()
{
	var row,col,number,num,i;

	//if(Error || (findone && clicktype != "AutoAll" && clicktype != "AutoTry"))
	//	return;
	if(VoidNum.length > 0)				//每个数独只系统分析一次，后续分析在此基础上修改各空格的候选数信息
		return;
	GetTableValues();
	for(row=0;row<9;row++)
	{
		VoidNum[row]=new Array();
		for(col=0;col<9;col++)
		{
			VoidNum[row][col]=new Array();
			VoidNum[row][col][0]=0;										//每个空格的候选数个数
			if(TrimStr(TableArray[row][col]) != "")
				continue;
			for(num=1;num<=9;num++)
			{
				if(TestRow(num,row) == true && TestCol(num,col) == true && TestSmallTable(num,row,col) == true)
				{
					VoidNum[row][col][0]++;
					VoidNum[row][col][VoidNum[row][col][0]]=num;
				}
			}
		}
	}
}

//在某个空格填入数字后，更新空格的候选数列表（该行、列和九宫格内其它空格将不能填这个数字）
function UpdateVoidsNum(row,col,num)
{
	var i,j,k,p,m,t,cellid=0;
	
	for(j=0;j<9;j++)						//扫描该行空格
	{
		if(TrimStr(TableArray[row][j]) != "")
			continue;
		t=VoidNum[row][j][0];
		for(i=0;i<t;i++)						//分析该空格的每个候选数
		{
			if(VoidNum[row][j][i+1] == num)			//从该空格的候选数列表中删除num
			{
				VoidNum[row][j][0]--;
				for(;i<VoidNum[row][j][0];i++)
				{
					VoidNum[row][j][i+1]=VoidNum[row][j][i+2];
				}
				if(VoidNum[row][j][0] == 1)
					cellid=row*9+j+1;				//返回只有一个候选数的空格编号（1-81），返回0表示每个空格都有2个以上的候选数
				break;
			}
		}
	}
	for(j=0;j<9;j++)						//扫描该列空格
	{
		if(TrimStr(TableArray[j][col]) != "")
				continue;
		t=VoidNum[j][col][0];
		for(i=0;i<t;i++)
		{
			if(VoidNum[j][col][i+1] == num)			//从该空格的候选数列表中删除num
			{
				VoidNum[j][col][0]--;
				for(;i<VoidNum[j][col][0];i++)
				{
					VoidNum[j][col][i+1]=VoidNum[j][col][i+2];
				}
				if(VoidNum[j][col][0] == 1)
					cellid=j*9+col+1;
				break;
			}
		}
	}
	p=parseInt(row/3)*3;
	m=parseInt(col/3)*3;
	for(j=p;j<p+3;j++)				//扫描该九宫格的行
	{
		for(k=m;k<m+3;k++)				//扫描该九宫格的列
		{
			if(TrimStr(TableArray[j][k]) != "")
				continue;
			t=VoidNum[j][k][0];
			for(i=0;i<t;i++)
			{
				if(VoidNum[j][k][i+1] == num)			//从该空格的候选数列表中删除num
				{
					VoidNum[j][k][0]--;
					for(;i<VoidNum[j][k][0];i++)
					{
						VoidNum[j][k][i+1]=VoidNum[j][k][i+2];
					}
					if(VoidNum[j][k][0] == 1)
						cellid=j*9+k+1;
					break;
				}
			}
		}
	}
	if(document.getElementById('VoidNums').checked == true)
		ShowVoidNums();
	return cellid;
}

//一个或多个空格的候选数更新后，需检查是否存在只有一个候选数的空格
function FindVoidsNum()
{
	var row,col,num;

	for(row=0;row<9;row++)
	{
		for(col=0;col<9;col++)
		{
			if(TrimStr(TableArray[row][col]) != "")
				continue;
			if(VoidNum[row][col][0] == 1)						//分析后，该行某空格只有一个可填数，更新相关列表	
			{
				num=VoidNum[row][col][1];
				if(TestRow(num,row) == false || TestCol(num,col) == false || TestSmallTable(num,row,col) == false)
				{
					BigTable.rows[row].cells[col].bgColor="#99CCFF";
					if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
						alert("错误："+(row+1)+"行"+(col+1)+"列空格不能填入任何数字！");
					SetBgColor();
					Error=1;
					return -1;
				}
				return (row*9+col+1);			//返回新填入数字的空格编号（1-81）
			}
		}
	}
	return 0;						//找不到有唯一候选数的空格
}

function InputNum(param)	//根据推理结果，在某个空格填入数字
{
	var row,col,num;
	
	row=findrow;
	col=findcol;
	num=findnumber;

	if(TestRow(num,row) == false || TestCol(num,col) == false || TestSmallTable(num,row,col) == false)
	{
		BigTable.rows[row].cells[col].bgColor="#99CCFF";
		if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
			alert("错误："+(row+1)+"行"+(col+1)+"列空格不能填入任何数字！");
		SetBgColor();
		Error=1;
		return -1;
	}
	if(clicktype == "HintPst")
	{
		BigTable.rows[row].cells[col].bgColor="#99CCFF";
		findone=1;
	}
	else if(clicktype == "HintN")
	{
		alert("当前可以填入数字" + num);
		findone=1;
	}
	else if(clicktype == "HintNum" || clicktype == "AutoTry" || clicktype == "AutoAll")
	{
		BigTable.rows[row].cells[col].innerHTML="<font color='red'><strong>"+num+"</strong></font>";
		if(param == 1 && AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
			alert("该空格只剩一个候选数");
		SetBgColor();
		//一键解谜模式下，不延迟设置当前填入数字颜色
		if(method == "AutoAll")
			BigTable.rows[row].cells[col].innerHTML="<font color='blue'>"+num+"</font>";
		else {
			setTimeout(function(){
				BigTable.rows[row].cells[col].innerHTML="<font color='blue'>"+num+"</font>";
			}, 2000);
		}
		TableArray[row][col]=num;
		if(clicktype == "HintNum")
			findone=1;
		TotalNum++;
	}
	return (row*9+col+1);			//返回新填入数字的空格编号（1-81）
}

//同一行的两个空格可填入的数字完全相同，将减小该行其它空格的数字可填性
function TwoVoidsRow()
{
	var row,col,num,num1,num2,i,j,k,p,flag=0,row1,col1,row2,col2,row3,col3,count;
	
	for(row=0;row<9;row++)					
	{
		for(col=1;col<9;col++)
		{
			if(VoidNum[row][col-1][0] != 2)			//该行第一个有两个候选数的空格（从第1到8个寻找）
				continue;
			for(i=col;i<9;i++)
			{
				if(VoidNum[row][i][0] != 2)				//该行第二个有两个候选数的空格（从第2到9个寻找）
					continue;
				if(VoidNum[row][col-1][1] == VoidNum[row][i][1] && VoidNum[row][col-1][2] == VoidNum[row][i][2])
				{
					num1=VoidNum[row][col-1][1];
					num2=VoidNum[row][col-1][2];
					break;
				}
			}
			if(i<9)
				break;
		}
		if(col<9)							//找到有两个空格的两个候选数都相同的行
		{
			for(j=0;j<9;j++)												//更新该行其它空格的候选数
			{
				if(j==col-1 || j==i || TrimStr(TableArray[row][j]) != "")
					continue;
				for(k=1;k<=VoidNum[row][j][0];k++)
				{
					if(VoidNum[row][j][k] == num1 || VoidNum[row][j][k] == num2)
					{
						flag=1;									//更新了候选数信息
						BigTable.rows[row].cells[j].bgColor="#99CCFF";
						BigTable.rows[row].cells[col-1].bgColor="#FFCC99";
						BigTable.rows[row].cells[i].bgColor="#FFCC99";
						if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
							alert("同一行的两个空格都只能填入"+num1+"和"+num2+",则该行的其它空格不能填"+VoidNum[row][j][k]);
						SetBgColor();
						VoidNum[row][j][0]--;															//从同行空格的可填入数列表中删除num1,num2
						for(p=k;p<=VoidNum[row][j][0];p++)
							VoidNum[row][j][p]=VoidNum[row][j][p+1];
						k--;					//继续检查该空格的下一个候选数
						if(document.getElementById('VoidNums').checked == true)
							ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
					}
				}
			}
			if(flag == 1)
				return true;
		}
	}
	return false;
}

//同一列的两个空格可填入的数字完全相同，将减小该列其它空格的数字可填性
function TwoVoidsCol()
{
	var row,col,num,num1,num2,i,j,k,p,flag=0,row1,col1,row2,col2,row3,col3,count;
	
	for(col=0;col<9;col++)					
	{
		for(row=1;row<9;row++)
		{
			if(VoidNum[row-1][col][0] != 2)			//该列第一个有两个候选数的空格（从第1到8个寻找）
				continue;
			for(i=row;i<9;i++)
			{
				if(VoidNum[i][col][0] != 2)				//该列第二个有两个候选数的空格（从第2到9个寻找）
					continue;
				if(VoidNum[row-1][col][1] == VoidNum[i][col][1] && VoidNum[row-1][col][2] == VoidNum[i][col][2])
				{
					num1=VoidNum[row-1][col][1];
					num2=VoidNum[row-1][col][2];
					break;
				}
			}
			if(i<9)
				break;
		}
		if(row<9)							//找到有两个空格的两个候选数都相同的行
		{
			for(j=0;j<9;j++)												//更新该行其它空格的候选数
			{
				if(j==row-1 || j==i || TrimStr(TableArray[j][col]) != "")
					continue;
				for(k=1;k<=VoidNum[j][col][0];k++)
				{
					if(VoidNum[j][col][k] == num1 || VoidNum[j][col][k] == num2)
					{
						flag=1;									//更新了候选数信息
						BigTable.rows[j].cells[col].bgColor="#99CCFF";
						BigTable.rows[row-1].cells[col].bgColor="#FFCC99";
						BigTable.rows[i].cells[col].bgColor="#FFCC99";
						if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
							alert("同一列的两个空格都只能填入"+num1+"和"+num2+",则该列的其它空格不能填"+VoidNum[j][col][k]);
						SetBgColor();
						VoidNum[j][col][0]--;															//从同列空格的可填入数列表中删除num1,num2
						for(p=k;p<=VoidNum[j][col][0];p++)
							VoidNum[j][col][p]=VoidNum[j][col][p+1];
						k--;					//继续检查该空格的下一个候选数
						if(document.getElementById('VoidNums').checked == true)
							ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
					}
				}
			}
			if(flag == 1)
				return true;
		}
	}
	return false;
}

//同一行的三个空格可填入数字的总数为4个，将减小该行其它空格的数字可填性
function ThreeVoidsRow()
{
	var row,col,col1,col2,col3,count,count0,maxcount=3,flag=0,i,j,p,vnum=new Array(0,0,0,0);
	
	for(row=0;row<9 && flag==0;row++){
		for(col1=0;col1<7 && flag==0;col1++)	{
			if(TrimStr(TableArray[row][col1]) != "")
				continue;
			count=VoidNum[row][col1][0];
			if(count <= maxcount){
				for(i=0;i<count;i++)
					vnum[i]=VoidNum[row][col1][i+1];
				for(col2=col1+1;col2<8 && flag==0;col2++){
					if(TrimStr(TableArray[row][col2]) != "")
						continue;
					if(VoidNum[row][col2][0] <= maxcount)	{
						count0=count;
						for(i=0;i<VoidNum[row][col2][0];i++)	{
							for(j=0;j<count;j++){
								if(vnum[j]==VoidNum[row][col2][i+1])
									break;	}
							if(j>=count)
								vnum[count++]=VoidNum[row][col2][i+1];	}
						if(count > maxcount) {
							count=count0;
							continue;		}					//重试row2
						for(col3=col2+1;col3<9 && flag==0;col3++){
							if(TrimStr(TableArray[row][col3]) != "")
								continue;
							if(VoidNum[row][col3][0] <= maxcount)	{
								count0=count;
								for(i=0;i<VoidNum[row][col3][0];i++)	{
									for(j=0;j<count;j++){
										if(vnum[j]==VoidNum[row][col3][i+1])
											break;	}
									if(j>=count)
										vnum[count++]=VoidNum[row][col3][i+1];}
								if(count > maxcount) {
									count=count0;
									continue;		}	//重试row4
								for(col=0;col<9;col++) {				//更新该行其它空格候选数
									if(TrimStr(TableArray[row][col]) != "" || col==col1 || col==col2 || col==col3)
										continue;
									for(i=0;i<VoidNum[row][col][0];i++) {
										for(j=0;j<count;j++) {
											if(vnum[j]==VoidNum[row][col][i+1]) {
												flag=1;									//更新了候选数信息
												BigTable.rows[row].cells[col].bgColor="#99CCFF";
												BigTable.rows[row].cells[col1].bgColor="#FFCC99";
												BigTable.rows[row].cells[col2].bgColor="#FFCC99";
												BigTable.rows[row].cells[col3].bgColor="#FFCC99";
												if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
													alert("同行3个空格的总候选数为"+count+"，该行其它空格将不能填这几个候选数（"+vnum[j]+"）");
												SetBgColor();
												VoidNum[row][col][0]--;									//从同列空格的可填入数列表中删除vnum[j]
												for(p=i+1;p<=VoidNum[row][col][0];p++)
													VoidNum[row][col][p]=VoidNum[row][col][p+1];
												i--;					//继续检查该空格的下一个候选数
												if(document.getElementById('VoidNums').checked == true)
													ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
												break;	} } }	}
								if(flag == 1)
									return true;}	}	}	}}}}				//不再检查vnum[j]
	return false;
}

//同一列的三个空格可填入数字的总数为4个，将减小该列其它空格的数字可填性
function ThreeVoidsCol()
{
	var row,col,row1,row2,row3,count,count0,maxcount=3,flag=0,i,j,p,vnum=new Array(0,0,0,0);
	
	for(col=0;col<9 && flag==0;col++){
		for(row1=0;row1<7 && flag==0;row1++)	{
			if(TrimStr(TableArray[row1][col]) != "")
				continue;
			count=VoidNum[row1][col][0];
			if(count <= maxcount){
				for(i=0;i<count;i++)
					vnum[i]=VoidNum[row1][col][i+1];
				for(row2=row1+1;row2<8 && flag==0;row2++){
					if(TrimStr(TableArray[row2][col]) != "")
						continue;
					if(VoidNum[row2][col][0] <= maxcount)	{
						count0=count;
						for(i=0;i<VoidNum[row2][col][0];i++)	{
							for(j=0;j<count;j++){
								if(vnum[j]==VoidNum[row2][col][i+1])
									break;	}
							if(j>=count)
								vnum[count++]=VoidNum[row2][col][i+1];	}
						if(count > maxcount) {
							count=count0;
							continue;		}					//重试row2
						for(row3=row2+1;row3<9 && flag==0;row3++){
							if(TrimStr(TableArray[row3][col]) != "")
								continue;
							if(VoidNum[row3][col][0] <= maxcount)	{
								count0=count;
								for(i=0;i<VoidNum[row3][col][0];i++)	{
									for(j=0;j<count;j++){
										if(vnum[j]==VoidNum[row3][col][i+1])
											break;	}
									if(j>=count)
										vnum[count++]=VoidNum[row3][col][i+1];}
								if(count > maxcount) {
									count=count0;
									continue;		}	//重试row4
								for(row=0;row<9;row++) {				//更新该列其它空格候选数
									if(TrimStr(TableArray[row][col]) != "" || row==row1 || row==row2 || row==row3)
										continue;
									for(i=0;i<VoidNum[row][col][0];i++) {
										for(j=0;j<count;j++) {
											if(vnum[j]==VoidNum[row][col][i+1]) {
												flag=1;									//更新了候选数信息
												BigTable.rows[row].cells[col].bgColor="#99CCFF";
												BigTable.rows[row1].cells[col].bgColor="#FFCC99";
												BigTable.rows[row2].cells[col].bgColor="#FFCC99";
												BigTable.rows[row3].cells[col].bgColor="#FFCC99";
												if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
													alert("同列3个空格的总候选数为"+count+"，该列其它空格将不能填这几个候选数（"+vnum[j]+"）");
												SetBgColor();
												VoidNum[row][col][0]--;									//从同列空格的可填入数列表中删除vnum[j]
												for(p=i+1;p<=VoidNum[row][col][0];p++)
													VoidNum[row][col][p]=VoidNum[row][col][p+1];
												i--;					//继续检查该空格的下一个候选数
												if(document.getElementById('VoidNums').checked == true)
													ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
												break;	} } }	}
								if(flag == 1)
									return true;}	}	}	}	}	}}				//不再检查vnum[j]
	return false;
}

//同一九宫格的三个空格可填入数字的总数为3个，将减小该九宫格其它空格的数字可填性
function ThreeVoidsM()
{
	var row,col,matrix,cell,cell1,cell2,cell3,count,count0,maxcount=3,flag=0,i,j,p,vnum=new Array(0,0,0,0);
	
	for(matrix=0;matrix<9 && flag==0;matrix++){				//检查9个九宫格
		for(cell1=0;cell1<7 && flag==0;cell1++)	{						//检查九宫格内9个单元格
			row=parseInt(matrix/3)*3+parseInt(cell1/3);
			col=parseInt(matrix%3)*3+cell1%3;
			if(TrimStr(TableArray[row][col]) != "")
				continue;
			count=VoidNum[row][col][0];
			if(count <= maxcount){
				for(i=0;i<count;i++)
					vnum[i]=VoidNum[row][col][i+1];
				for(cell2=cell1+1;cell2<8 && flag==0;cell2++){
					row=parseInt(matrix/3)*3+parseInt(cell2/3);
					col=parseInt(matrix%3)*3+cell2%3;
					if(TrimStr(TableArray[row][col]) != "")
						continue;
					if(VoidNum[row][col][0] <= maxcount)	{
						count0=count;
						for(i=0;i<VoidNum[row][col][0];i++)	{
							for(j=0;j<count;j++){
								if(vnum[j]==VoidNum[row][col][i+1])
									break;	}
							if(j>=count)
								vnum[count++]=VoidNum[row][col][i+1];	}
						if(count > maxcount) {
							count=count0;
							continue;		}					//重试row2
						for(cell3=cell2+1;cell3<9 && flag==0;cell3++){
							row=parseInt(matrix/3)*3+parseInt(cell3/3);
							col=parseInt(matrix%3)*3+cell3%3;
							if(TrimStr(TableArray[row][col]) != "")
								continue;
							if(VoidNum[row][col][0] <= maxcount)	{
								count0=count;
								for(i=0;i<VoidNum[row][col][0];i++)	{
									for(j=0;j<count;j++){
										if(vnum[j]==VoidNum[row][col][i+1])
											break;	}
									if(j>=count)
										vnum[count++]=VoidNum[row][col][i+1];}
								if(count > maxcount) {
									count=count0;
									continue;		}	//重试row4
								for(cell=0;cell<9;cell++) {				//更新该九宫格其它空格候选数
									row=parseInt(matrix/3)*3+parseInt(cell/3);
									col=parseInt(matrix%3)*3+cell%3;
									if(TrimStr(TableArray[row][col]) != "" || cell==cell1 || cell==cell2 || cell==cell3)
										continue;
									for(i=0;i<VoidNum[row][col][0];i++) {
										for(j=0;j<count;j++) {
											if(vnum[j]==VoidNum[row][col][i+1]) {
												flag=1;									//更新了候选数信息
												BigTable.rows[row].cells[col].bgColor="#99CCFF";
												BigTable.rows[parseInt(matrix/3)*3+parseInt(cell1/3)].cells[parseInt(matrix%3)*3+cell1%3].bgColor="#FFCC99";
												BigTable.rows[parseInt(matrix/3)*3+parseInt(cell2/3)].cells[parseInt(matrix%3)*3+cell2%3].bgColor="#FFCC99";
												BigTable.rows[parseInt(matrix/3)*3+parseInt(cell3/3)].cells[parseInt(matrix%3)*3+cell3%3].bgColor="#FFCC99";
												if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
													alert("九宫格3个空格的总候选数为"+count+"，该九宫格其它空格将不能填这几个候选数（"+vnum[j]+"）");
												SetBgColor();
												VoidNum[row][col][0]--;									//从九宫格其他空格的可填入数列表中删除vnum[j]
												for(p=i+1;p<=VoidNum[row][col][0];p++)
													VoidNum[row][col][p]=VoidNum[row][col][p+1];
												i--;					//继续检查该空格的下一个候选数
												if(document.getElementById('VoidNums').checked == true)
													ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
												break;	} } }	}
								if(flag == 1)
									return true;}	}	}	}	}	}}				//不再检查vnum[j]
	return false;
}

//同一行的四个空格可填入数字的总数为4个，将减小该行其它空格的数字可填性
function FourVoidsRow()
{
	var row,col,col1,col2,col3,col4,count,count0,maxcount=4,flag=0,i,j,p,vnum=new Array(0,0,0,0);
	
	for(row=0;row<9 && flag==0;row++){
		for(col1=0;col1<6 && flag==0;col1++)	{
			if(TrimStr(TableArray[row][col1]) != "")
				continue;
			count=VoidNum[row][col1][0];
			if(count <= maxcount){
				for(i=0;i<count;i++)
					vnum[i]=VoidNum[row][col1][i+1];
				for(col2=col1+1;col2<7 && flag==0;col2++){
					if(TrimStr(TableArray[row][col2]) != "")
						continue;
					if(VoidNum[row][col2][0] <= maxcount)	{
						count0=count;
						for(i=0;i<VoidNum[row][col2][0];i++)	{
							for(j=0;j<count;j++){
								if(vnum[j]==VoidNum[row][col2][i+1])
									break;	}
							if(j>=count)
								vnum[count++]=VoidNum[row][col2][i+1];	}
						if(count > maxcount) {
							count=count0;
							continue;		}					//重试row2
						for(col3=col2+1;col3<8 && flag==0;col3++)	{
							if(TrimStr(TableArray[row][col3]) != "")
								continue;
							if(VoidNum[row][col3][0] <= maxcount)	{
								count0=count;
								for(i=0;i<VoidNum[row][col3][0];i++)	{
									for(j=0;j<count;j++)	{
										if(vnum[j]==VoidNum[row][col3][i+1])
											break;	}
									if(j>=count)
										vnum[count++]=VoidNum[row][col3][i+1];	}
								if(count > maxcount) {
									count=count0;
									continue;	}		//重试row3
								for(col4=col3+1;col4<9 && flag==0;col4++){
									if(TrimStr(TableArray[row][col4]) != "")
										continue;
									if(VoidNum[row][col4][0] <= maxcount)	{
										count0=count;
										for(i=0;i<VoidNum[row][col4][0];i++)	{
											for(j=0;j<count;j++){
												if(vnum[j]==VoidNum[row][col4][i+1])
													break;	}
											if(j>=count)
												vnum[count++]=VoidNum[row][col4][i+1];}
										if(count > maxcount) {
											count=count0;
											continue;		}	//重试row4
										for(col=0;col<9;col++) {				//更新该行其它空格候选数
											if(TrimStr(TableArray[row][col]) != "" || col==col1 || col==col2 || col==col3 || col==col4)
												continue;
											for(i=0;i<VoidNum[row][col][0];i++) {
												for(j=0;j<count;j++) {
													if(vnum[j]==VoidNum[row][col][i+1]) {
														flag=1;									//更新了候选数信息
														BigTable.rows[row].cells[col].bgColor="#99CCFF";
														BigTable.rows[row].cells[col1].bgColor="#FFCC99";
														BigTable.rows[row].cells[col2].bgColor="#FFCC99";
														BigTable.rows[row].cells[col3].bgColor="#FFCC99";
														BigTable.rows[row].cells[col4].bgColor="#FFCC99";
														if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
															alert("同行4个空格的总候选数为"+count+"，该行其它空格将不能填这几个候选数（"+vnum[j]+"）");
														SetBgColor();
														VoidNum[row][col][0]--;									//从同列空格的可填入数列表中删除vnum[j]
														for(p=i+1;p<=VoidNum[row][col][0];p++)
															VoidNum[row][col][p]=VoidNum[row][col][p+1];
														i--;					//继续检查该空格的下一个候选数
														if(document.getElementById('VoidNums').checked == true)
															ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
														break;	} } }	}
										if(flag == 1)
											return true;}	}	}	}	}	}}}}				//不再检查vnum[j]
	return false;
}

//同一列的四个空格可填入数字的总数为4个，将减小该列其它空格的数字可填性
function FourVoidsCol()
{
	var row,col,row1,row2,row3,row4,count,count0,maxcount=4,flag=0,i,j,p,vnum=new Array(0,0,0,0);
	
	for(col=0;col<9 && flag==0;col++){
		for(row1=0;row1<6 && flag==0;row1++)	{
			if(TrimStr(TableArray[row1][col]) != "")
				continue;
			count=VoidNum[row1][col][0];
			if(count <= maxcount){
				for(i=0;i<count;i++)
					vnum[i]=VoidNum[row1][col][i+1];
				for(row2=row1+1;row2<7 && flag==0;row2++){
					if(TrimStr(TableArray[row2][col]) != "")
						continue;
					if(VoidNum[row2][col][0] <= maxcount)	{
						count0=count;
						for(i=0;i<VoidNum[row2][col][0];i++)	{
							for(j=0;j<count;j++){
								if(vnum[j]==VoidNum[row2][col][i+1])
									break;	}
							if(j>=count)
								vnum[count++]=VoidNum[row2][col][i+1];	}
						if(count > maxcount) {
							count=count0;
							continue;		}					//重试row2
						for(row3=row2+1;row3<8 && flag==0;row3++)	{
							if(TrimStr(TableArray[row3][col]) != "")
								continue;
							if(VoidNum[row3][col][0] <= maxcount)	{
								count0=count;
								for(i=0;i<VoidNum[row3][col][0];i++)	{
									for(j=0;j<count;j++)	{
										if(vnum[j]==VoidNum[row3][col][i+1])
											break;	}
									if(j>=count)
										vnum[count++]=VoidNum[row3][col][i+1];	}
								if(count > maxcount) {
									count=count0;
									continue;	}		//重试row3
								for(row4=row3+1;row4<9 && flag==0;row4++){
									if(TrimStr(TableArray[row4][col]) != "")
										continue;
									if(VoidNum[row4][col][0] <= maxcount)	{
										count0=count;
										for(i=0;i<VoidNum[row4][col][0];i++)	{
											for(j=0;j<count;j++){
												if(vnum[j]==VoidNum[row4][col][i+1])
													break;	}
											if(j>=count)
												vnum[count++]=VoidNum[row4][col][i+1];}
										if(count > maxcount) {
											count=count0;
											continue;		}	//重试row4
										for(row=0;row<9;row++) {				//更新该列其它空格候选数
											if(TrimStr(TableArray[row][col]) != "" || row==row1 || row==row2 || row==row3 || row==row4)
												continue;
											for(i=0;i<VoidNum[row][col][0];i++) {
												for(j=0;j<count;j++) {
													if(vnum[j]==VoidNum[row][col][i+1]) {
														flag=1;									//更新了候选数信息
														BigTable.rows[row].cells[col].bgColor="#99CCFF";
														BigTable.rows[row1].cells[col].bgColor="#FFCC99";
														BigTable.rows[row2].cells[col].bgColor="#FFCC99";
														BigTable.rows[row3].cells[col].bgColor="#FFCC99";
														BigTable.rows[row4].cells[col].bgColor="#FFCC99";
														if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
															alert("同列4个空格的总候选数为"+count+"，该列其它空格将不能填这几个候选数（"+vnum[j]+"）");
														SetBgColor();
														VoidNum[row][col][0]--;									//从同列空格的可填入数列表中删除vnum[j]
														for(p=i+1;p<=VoidNum[row][col][0];p++)
															VoidNum[row][col][p]=VoidNum[row][col][p+1];
														i--;					//继续检查该空格的下一个候选数
														if(document.getElementById('VoidNums').checked == true)
															ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
														break;	} } }	}
										if(flag == 1)
											return true;}	}	}	}	}	}}}}				//不再检查vnum[j]
	return false;
}

//同一九宫格的四个空格可填入数字的总数为4个，将减小该九宫格其它空格的数字可填性
function FourVoidsM()
{
	var row,col,matrix,cell,cell1,cell2,cell3,cell4,count,count0,maxcount=4,flag=0,i,j,p,vnum=new Array(0,0,0,0);
	
	for(matrix=0;matrix<9 && flag==0;matrix++){				//检查9个九宫格
		for(cell1=0;cell1<6 && flag==0;cell1++)	{						//检查九宫格内9个单元格
			row=parseInt(matrix/3)*3+parseInt(cell1/3);
			col=parseInt(matrix%3)*3+cell1%3;
			if(TrimStr(TableArray[row][col]) != "")
				continue;
			count=VoidNum[row][col][0];
			if(count <= maxcount){
				for(i=0;i<count;i++)
					vnum[i]=VoidNum[row][col][i+1];
				for(cell2=cell1+1;cell2<7 && flag==0;cell2++){
					row=parseInt(matrix/3)*3+parseInt(cell2/3);
					col=parseInt(matrix%3)*3+cell2%3;
					if(TrimStr(TableArray[row][col]) != "")
						continue;
					if(VoidNum[row][col][0] <= maxcount)	{
						count0=count;
						for(i=0;i<VoidNum[row][col][0];i++)	{
							for(j=0;j<count;j++){
								if(vnum[j]==VoidNum[row][col][i+1])
									break;	}
							if(j>=count)
								vnum[count++]=VoidNum[row][col][i+1];	}
						if(count > maxcount) {
							count=count0;
							continue;		}					//重试row2
						for(cell3=cell2+1;cell3<8 && flag==0;cell3++){
							row=parseInt(matrix/3)*3+parseInt(cell3/3);
							col=parseInt(matrix%3)*3+cell3%3;
							if(TrimStr(TableArray[row][col]) != "")
								continue;
							if(VoidNum[row][col][0] <= maxcount)	{
								count0=count;
								for(i=0;i<VoidNum[row][col][0];i++)	{
									for(j=0;j<count;j++){
										if(vnum[j]==VoidNum[row][col][i+1])
											break;	}
									if(j>=count)
										vnum[count++]=VoidNum[row][col][i+1];	}
								if(count > maxcount) {
									count=count0;
									continue;		}					//重试row3
								for(cell4=cell3+1;cell4<9 && flag==0;cell4++){
									row=parseInt(matrix/3)*3+parseInt(cell4/3);
									col=parseInt(matrix%3)*3+cell4%3;
									if(TrimStr(TableArray[row][col]) != "")
										continue;
									if(VoidNum[row][col][0] <= maxcount)	{
										count0=count;
										for(i=0;i<VoidNum[row][col][0];i++)	{
											for(j=0;j<count;j++){
												if(vnum[j]==VoidNum[row][col][i+1])
													break;	}
											if(j>=count)
												vnum[count++]=VoidNum[row][col][i+1];}
										if(count > maxcount) {
											count=count0;
											continue;		}	//重试row4
										for(cell=0;cell<9;cell++) {				//更新该九宫格其它空格候选数
											row=parseInt(matrix/3)*3+parseInt(cell/3);
											col=parseInt(matrix%3)*3+cell%3;
											if(TrimStr(TableArray[row][col]) != "" || cell==cell1 || cell==cell2 || cell==cell3 || cell==cell4)
												continue;
											for(i=0;i<VoidNum[row][col][0];i++) {
												for(j=0;j<count;j++) {
													if(vnum[j]==VoidNum[row][col][i+1]) {
														flag=1;									//更新了候选数信息
														BigTable.rows[row].cells[col].bgColor="#99CCFF";
														BigTable.rows[parseInt(matrix/3)*3+parseInt(cell1/3)].cells[parseInt(matrix%3)*3+cell1%3].bgColor="#FFCC99";
														BigTable.rows[parseInt(matrix/3)*3+parseInt(cell2/3)].cells[parseInt(matrix%3)*3+cell2%3].bgColor="#FFCC99";
														BigTable.rows[parseInt(matrix/3)*3+parseInt(cell3/3)].cells[parseInt(matrix%3)*3+cell3%3].bgColor="#FFCC99";
														BigTable.rows[parseInt(matrix/3)*3+parseInt(cell4/3)].cells[parseInt(matrix%3)*3+cell4%3].bgColor="#FFCC99";
														if(AutoFlag == 0 && document.getElementById("OneByOne").checked == true)
															alert("九宫格4个空格的总候选数为"+count+"，该九宫格其它空格将不能填这几个候选数（"+vnum[j]+"）");
														SetBgColor();
														VoidNum[row][col][0]--;									//从九宫格其他空格的可填入数列表中删除vnum[j]
														for(p=i+1;p<=VoidNum[row][col][0];p++)
															VoidNum[row][col][p]=VoidNum[row][col][p+1];
														i--;					//继续检查该空格的下一个候选数
														if(document.getElementById('VoidNums').checked == true)
															ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
														break;	} } }	}
										if(flag == 1)
											return true;}	}	}	}	} } }	} }				//不再检查vnum[j]
	return false;
}

//两个数子只能填在同一行的两个空格，则这两个空格不能填其它数字
function TwoNumVoidsRow()
{
	var row,col,num,num1,num2,i,j,k,p,flag,row1,col1,row2,col2,row3,col3,count;
	
	for(row=0;row<9;row++)					
	{
		for(col=0;col<9;col++)
		{
			flag=0;
			if(VoidNum[row][col][0] < 2)
				continue;
			row1=row;
			col1=col;
			for(i=0;i<VoidNum[row][col][0];i++)
			{
				num1=VoidNum[row][col][i+1];
				count=0;								//同一行有该候选数的空格数
				for(j=0;j<9;j++)				//扫描该行其它空格的候选数
				{
					if(j == col)
						continue;
					for(k=0;k<VoidNum[row][j][0];k++)
					{
						if(num1 == VoidNum[row][j][k+1])
						{
							col2=j;
							count++;
							break;
						}
					}							//for
					if(count > 1)
						break;
				}								//for
				if(count == 1)				//num1是该行两个空格的候选数
				{
					for(p=0;p<VoidNum[row][col][0];p++)	//扫描有候选数num1的第一个空格
					{
						num2=VoidNum[row][col][p+1];
						if(num2 <= num1)
							continue;
						count=0;								//同一行与有该候选数的空格数
						for(j=0;j<9;j++)				//扫描该行其它空格的候选数
						{
							if(j == col)
								continue;
							for(k=0;k<VoidNum[row][j][0];k++)
							{
								if(num2 == VoidNum[row][j][k+1])
								{
									col3=j;
									count++;
									break;
								}
							}
							if(count > 1)
								break;
						}								//for
						if(count == 1 && col3 == col2)
						{
							flag=2;							
							break;
						}
					}									//for
					if(flag == 2)
						break;
				}				
			}					//扫描当前空格的候选数 for
		}					//扫描当前行的每一个空格 for col
		if(flag == 2)
		{
			for(j=0;j<9;j++)
			{
				if(j==col1 || j==col2)									//这两个空格只能有这两个候选数，删除其它候选数
				{
					for(k=1;k<=VoidNum[row][j][0];k++)
					{
						if((VoidNum[row][j][k] != num1 && VoidNum[row][j][k] != num2))
						{
							flag=1;											//当前算法修改了候选数信息，返回该值
							BigTable.rows[row].cells[col1].bgColor="#FFCC99";
							BigTable.rows[row].cells[col2].bgColor="#FFCC99";
							BigTable.rows[row].cells[j].bgColor="#99CCFF";
							if(document.getElementById("OneByOne").checked)
								alert(num1+","+num2+"只能填在同一行的这两个空格，则这两个空格不能填其它数字");
							SetBgColor();
							VoidNum[row][j][0]--;	
							for(p=k;p<=VoidNum[row][j][0];p++)
								VoidNum[row][j][p]=VoidNum[row][j][p+1];
							k--;
							if(document.getElementById('VoidNums').checked == true)
								ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
						}
					}
				}
			}			
		}
		if(flag == 1)
			return true;
	}					//扫描每一行
	return false;
}

//两个数子只能填在同一列的两个空格，则这两个空格不能填其它数字
function TwoNumVoidsCol()
{
	var row,col,num,num1,num2,i,j,k,p,flag,row1,col1,row2,col2,row3,col3,count;
	
	for(col=0;col<9;col++)					
	{
		for(row=0;row<9;row++)
		{
			flag=0;
			if(VoidNum[row][col][0] < 2)
				continue;
			row1=row;
			col1=col;
			for(i=0;i<VoidNum[row][col][0];i++)
			{
				num1=VoidNum[row][col][i+1];
				count=0;								//同一列有该候选数的空格数
				for(j=0;j<9;j++)				//扫描该列其它空格的候选数
				{
					if(j == row)
						continue;
					for(k=0;k<VoidNum[j][col][0];k++)
					{
						if(num1 == VoidNum[j][col][k+1])
						{
							row2=j;
							count++;
							break;
						}
					}
					if(count > 1)
						break;
				}
				if(count == 1)				//num1是该列两个空格的候选数
				{
					for(p=0;p<VoidNum[row][col][0];p++)	//扫描有候选数num1的第一个空格
					{
						num2=VoidNum[row][col][p+1];
						if(num2 <= num1)
							continue;
						count=0;								//同一列与有该候选数的空格数
						for(j=0;j<9;j++)				//扫描该列其它空格的候选数
						{
							if(j == row)
								continue;
							for(k=0;k<VoidNum[j][col][0];k++)
							{
								if(num2 == VoidNum[j][col][k+1])
								{
									row3=j;
									count++;
									break;
								}
							}
							if(count > 1)
								break;
						}
						if(count == 1 && row3 == row2)
						{
							flag=2;
							break;
						}
					}					
				}
				if(flag == 2)
					break;
			}					//扫描当前空格的候选数
		}					//扫描当前列的每一个空格
		if(flag == 2)
		{
			for(j=0;j<9;j++)
			{
				if(j==row1 || j==row2)									//这两个空格只能有这两个候选数，删除其它候选数
				{
					for(k=1;k<=VoidNum[j][col][0];k++)
					{
						if((VoidNum[j][col][k] != num1 && VoidNum[j][col][k] != num2))
						{
							flag=1;											//当前算法修改了候选数信息，返回该值
							BigTable.rows[row1].cells[col].bgColor="#FFCC99";
							BigTable.rows[row2].cells[col].bgColor="#FFCC99";
							BigTable.rows[j].cells[col].bgColor="#99CCFF";
							if(document.getElementById("OneByOne").checked)
								alert(num1+","+num2+"只能填在"+(col+1)+"列的这两个空格，则这两个空格不能填其它数字");
							SetBgColor();
							VoidNum[j][col][0]--;	
							for(p=k;p<=VoidNum[j][col][0];p++)
								VoidNum[j][col][p]=VoidNum[j][col][p+1];
							k--;
							if(document.getElementById('VoidNums').checked == true)
								ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
						}
					}
				}
			}			
		}
		if(flag == 1)
			return true;
	}					//扫描每一列
	return false;
}

//某一列有多个空格属于同一九宫格，且有一个数在这一列只能填在这几个空格里，
//则所在九宫格内的其它空格不能填这个数字
function ColVoidsM()
{
	var row,col,i,j,k,p,t,m,num,count,flag;
	var number=new Array();
	
	for(col=0;col<9;col++)				//扫描列
	{
		for(num=1;num<=9;num++)				//检查可填数在该列的分布
		{
			count=0;
			flag=0;
			for(row=0;row<9;row++)			//扫描该列的9个单元格
			{
				if(TrimStr(TableArray[row][col]) != "")
					continue;
				for(i=0;i<VoidNum[row][col][0];i++)
				{
					if(VoidNum[row][col][i+1] == num)
					{
						number[count++]=row;
						break;
					}
				}
			}
			for(i=1;i<count;i++)
			{
				if(parseInt(number[i]/3) != parseInt(number[0]/3))
				{
					flag=1;
					break;
				}
				flag=2;
			}
			if(flag == 2)				//该列中，数字num的可填空格属于同一个九宫格
			{
				k=parseInt(number[0]/3)*3;
				p=parseInt(col/3)*3;
				for(i=k;i<k+3;i++)				//扫描该九宫格的行
				{
					for(j=p;j<p+3;j++)				//扫描该九宫格的列
					{
						if(TrimStr(TableArray[i][j]) != "" || j == col)
							continue;
						for(t=0;t<VoidNum[i][j][0];t++)
						{
							if(VoidNum[i][j][t+1] == num)			//从该空格的候选数列表中删除num
							{
								flag=3;
								BigTable.rows[number[0]].cells[col].innerHTML="<font color='red'>"+num+"</font>";
								BigTable.rows[number[1]].cells[col].innerHTML="<font color='red'>"+num+"</font>";
								BigTable.rows[number[0]].cells[col].bgColor="#99CCFF";
								BigTable.rows[number[1]].cells[col].bgColor="#99CCFF";
								BigTable.rows[i].cells[j].bgColor="#FFCC99";
								if(document.getElementById("OneByOne").checked)				
									alert("由于第"+(col+1)+"列数字"+num+"的可填分布，九宫格的其它空格不能填"+num);
								BigTable.rows[number[0]].cells[col].innerHTML="&nbsp;";
								BigTable.rows[number[1]].cells[col].innerHTML="&nbsp;";
								SetBgColor();
								VoidNum[i][j][0]--;
								for(;t<VoidNum[i][j][0];t++)
								{
									VoidNum[i][j][t+1]=VoidNum[i][j][t+2];
								}
								if(document.getElementById('VoidNums').checked == true)
									ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
								break;					//不必在检查该空格的其它候选数
							}
						}							//检查当前空格的候选数是否为num
					}						//扫描九宫格的列
				}					//扫描九宫格的行
				if(flag == 3)
					return true;
			}
		}				//扫描1-9在该列的可填情况
	}			//扫描列
	return false;
}

//某一行有多个空格属于同一九宫格，且有一个数在这一行只能填在这几个空格里，
//则所在九宫格内的其它空格不能填这个数字
function RowVoidsM()
{
	var row,col,i,j,k,p,t,m,num,count,flag;
	var number=new Array();
	
	for(row=0;row<9;row++)				//扫描行
	{
		for(num=1;num<=9;num++)				//检查可填数在该行的分布
		{
			count=0;
			flag=0;
			for(col=0;col<9;col++)			//扫描该行的9个单元格
			{
				if(TrimStr(TableArray[row][col]) != "")
					continue;
				for(i=0;i<VoidNum[row][col][0];i++)
				{
					if(VoidNum[row][col][i+1] == num)
					{
						number[count++]=col;
						break;
					}
				}
			}
			for(i=1;i<count;i++)
			{
				if(parseInt(number[i]/3) != parseInt(number[0]/3))
				{
					flag=1;
					break;
				}
				flag=2;
			}
			if(flag == 2)				//该行中，数字num的可填空格属于同一个九宫格
			{
				k=parseInt(row/3)*3;
				p=parseInt(number[0]/3)*3;
				for(i=k;i<k+3;i++)				//扫描该九宫格的行
				{
					for(j=p;j<p+3;j++)				//扫描该九宫格的列
					{
						if(TrimStr(TableArray[i][j]) != "" || i == row)
							continue;
						for(t=0;t<VoidNum[i][j][0];t++)
						{
							if(VoidNum[i][j][t+1] == num)			//从该空格的候选数列表中删除num
							{
								flag=3;
								BigTable.rows[row].cells[number[0]].innerHTML="<font color='red'>"+num+"</font>";
								BigTable.rows[row].cells[number[1]].innerHTML="<font color='red'>"+num+"</font>";
								BigTable.rows[row].cells[number[0]].bgColor="#99CCFF";
								BigTable.rows[row].cells[number[1]].bgColor="#99CCFF";
								BigTable.rows[i].cells[j].bgColor="#FFCC99";
								if(document.getElementById("OneByOne").checked)				
									alert("由于第"+(row+1)+"行数字"+num+"的可填分布，九宫格的其它空格不能填"+num);
								BigTable.rows[row].cells[number[0]].innerHTML="&nbsp;";
								BigTable.rows[row].cells[number[1]].innerHTML="&nbsp;";
								SetBgColor();
								VoidNum[i][j][0]--;
								for(;t<VoidNum[i][j][0];t++)
								{
									VoidNum[i][j][t+1]=VoidNum[i][j][t+2];
								}
								if(document.getElementById('VoidNums').checked == true)
									ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
								break;					//不必在检查该空格的其它候选数
							}
						}							//检查当前空格的候选数是否为num
					}						//扫描九宫格的列
				}					//扫描九宫格的行
				if(flag == 3)
					return true;
			}
		}				//扫描1-9在该行的可填情况
	}			//扫描行
	return false;
}

//九宫格内几个空格属于同一行，某个数字在该九宫格内只能填在这几个空格里，
//则该行其它空格不能填该数字
function MatrixVoidsRow()
{
	var row,col,i,j,k,p,t,m,num,count,flag;
	var number=new Array();
	
	flag=0;
	for(num=1;num<=9;num++)			
	{
		for(m=0;m<9;m++)						//扫描9个九宫格
		{
			j=parseInt(m/3)*3;					//九宫格起始行
			k=(m%3)*3;									//九宫格起始列
			count=0;										//该九宫格所有空格填该数字的空格数
			for(row=j;row<j+3;row++)
			{
				for(col=k;col<k+3;col++)
				{
					if(TrimStr(TableArray[row][col]) != "")
						continue;							
					t=VoidNum[row][col][0];
					for(i=0;i<t;i++)
					{
						if(VoidNum[row][col][i+1] == num)
						{
							number[count*2]=row;
							number[count*2+1]=col;
							count++;
							break;
						}
					}
				}
			}
			if(count == 2 || count == 3)
			{
				for(i=1;i<count;i++)
				{
					if(number[i*2] != number[i*2-2])		//判断空格是否在同一行
						break;
				}
				if(i>=count)
				{
					row=number[0];
					for(col=0;col<9;col++)				//检查该行其它空格的候选数列表
					{
						if((col >= k && col < k+3) || TrimStr(TableArray[row][col]) != "")
							continue;
						t=VoidNum[row][col][0];
						for(i=0;i<t;i++)
						{
							if(VoidNum[row][col][i+1] == num)			//从该空格的候选数列表中删除num
							{
								flag=1;
								BigTable.rows[row].cells[number[1]].innerHTML="<font color='red'>"+num+"</font>";
								BigTable.rows[row].cells[number[3]].innerHTML="<font color='red'>"+num+"</font>";
								BigTable.rows[row].cells[number[1]].bgColor="#99CCFF";
								BigTable.rows[row].cells[number[3]].bgColor="#99CCFF";
								BigTable.rows[row].cells[col].bgColor="#FFCC99";
								if(document.getElementById("OneByOne").checked)						
									alert("由于第"+(row+1)+"行数字"+num+"的可填分布，同一行其它空格不能填"+num);
								BigTable.rows[row].cells[number[1]].innerHTML="&nbsp;";
								BigTable.rows[row].cells[number[3]].innerHTML="&nbsp;";
								SetBgColor();								
								VoidNum[row][col][0]--;
								for(;i<VoidNum[row][col][0];i++)
								{
									VoidNum[row][col][i+1]=VoidNum[row][col][i+2];
								}
								if(document.getElementById('VoidNums').checked == true)
									ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
								break;					//不再检查该空格的其它候选数
							}
						}								
					}
					if(flag == 1)
						return true;
				}				
			}
		}
	}
	return false;
}

//九宫格内几个空格属于同一列，某个数字在该九宫格内只能填在这几个空格里，
//则该列其它空格不能填该数字
function MatrixVoidsCol()
{
	var row,col,i,j,k,p,t,m,num,count,flag;
	var number=new Array();
	
	flag=0;
	for(num=1;num<=9;num++)			
	{
		for(m=0;m<9;m++)						//扫描9个九宫格
		{
			j=parseInt(m/3)*3;					//九宫格起始行
			k=(m%3)*3;									//九宫格起始列
			count=0;										//该九宫格所有空格填该数字的空格数
			for(row=j;row<j+3;row++)
			{
				for(col=k;col<k+3;col++)
				{
					if(TrimStr(TableArray[row][col]) != "")
						continue;							
					t=VoidNum[row][col][0];
					for(i=0;i<t;i++)
					{
						if(VoidNum[row][col][i+1] == num)
						{
							number[count*2]=row;
							number[count*2+1]=col;
							count++;
							break;
						}
					}
				}
			}
			if(count == 2 || count == 3)
			{
				for(i=1;i<count;i++)
				{
					if(number[i*2+1] != number[i*2-1])		//检查空格是否在同一列
						break;
				}
				if(i>=count)
				{
					col=number[1];
					for(row=0;row<9;row++)				//检查该列其它空格的候选数列表
					{
						if((row >= j && row < j+3) || TrimStr(TableArray[row][col]) != "")
							continue;
						t=VoidNum[row][col][0];
						for(i=0;i<t;i++)
						{
							if(VoidNum[row][col][i+1] == num)			//从该空格的候选数列表中删除num
							{
								flag=1;
								BigTable.rows[number[0]].cells[col].innerHTML="<font color='red'>"+num+"</font>";
								BigTable.rows[number[2]].cells[col].innerHTML="<font color='red'>"+num+"</font>";
								BigTable.rows[number[0]].cells[col].bgColor="#99CCFF";
								BigTable.rows[number[2]].cells[col].bgColor="#99CCFF";
								BigTable.rows[row].cells[col].bgColor="#FFCC99";
								if(document.getElementById("OneByOne").checked)						
									alert("由于第"+(col+1)+"列数字"+num+"的可填分布，同一列其它空格不能填"+num);
								BigTable.rows[number[0]].cells[col].innerHTML="&nbsp;";
								BigTable.rows[number[2]].cells[col].innerHTML="&nbsp;";
								SetBgColor();								
								VoidNum[row][col][0]--;
								for(;i<VoidNum[row][col][0];i++)
								{
									VoidNum[row][col][i+1]=VoidNum[row][col][i+2];
								}
								if(document.getElementById('VoidNums').checked == true)
									ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
								break;
							}
						}
					}
					if(flag == 1)
						return true;
				}				
			}
		}
	}
	return false;
}

//找到四个可组成长方形的空格，某个数字必须填在长方形两个相对的角上
function RectVoidsRow()
{
	var row,col,i,j,k,p,t,m,num,count,flag;
	var number=new Array();
	
	flag=0;
	for(num=1;num<=9;num++)	
	{
		for(row=0;row<9;row++)
		{
			count=0;
			for(col=0;col<9;col++)			//一个数字在该行的可填空格数：两个
			{
				if(TrimStr(TableArray[row][col]) != "")
					continue;
				t=VoidNum[row][col][0];
				for(i=0;i<t;i++)
				{
					if(VoidNum[row][col][i+1] == num)
						break;
				}
				if(i < t)
					number[count++]=col;
			}
			if(count == 2)
			{
				for(j=row+1;j<9;j++)
				{
					for(col=0;col<9;col++)			//同一个数字在另一行的可填空格数和位置
					{
						if(TrimStr(TableArray[j][col]) != "")
							continue;
						t=VoidNum[j][col][0];
						for(i=0;i<t;i++)
						{
							if(VoidNum[j][col][i+1] == num)
								break;
						}
						if(i < t)
							number[count++]=col;
					}
					//找到四个可组成长方形的空格，数字num必须填在长方形两个相对的角上
					if(count == 4 && number[0] == number[2] && number[1] == number[3])
					{
						for(k=0;k<9;k++)  //该长方形的左列其它空格不能填这个数字
						{
							t=number[0];
							if(TrimStr(TableArray[k][t]) != "" || k == row || k == j)
								continue;
							p=VoidNum[k][t][0];
							for(i=0;i<p;i++)
							{
								if(VoidNum[k][t][i+1] == num)
								{
									BigTable.rows[row].cells[number[0]].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[row].cells[number[1]].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[j].cells[number[0]].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[j].cells[number[1]].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[row].cells[number[0]].bgColor="#99CCFF";
									BigTable.rows[row].cells[number[1]].bgColor="#99CCFF";
									BigTable.rows[j].cells[number[0]].bgColor="#99CCFF";
									BigTable.rows[j].cells[number[1]].bgColor="#99CCFF";
									BigTable.rows[k].cells[t].bgColor="#FFCC99";											
									VoidNum[k][t][0]--;	//从该空格的可填数列表里删除num
									for(;i<p-1;i++)
										VoidNum[k][t][i+1]=VoidNum[k][t][i+2];
									if(document.getElementById("OneByOne").checked)	
									{
										if(flag == 0)	//可能会影响多个空格，只提示一次
											alert("由于数字"+num+"只能填在长方形四个顶点上，所以"+(k+1)+"行"+(t+1)+"列不能填"+num);
										else
											alert((k+1)+"行"+(t+1)+"列不能填"+num);										
									}
									flag=1;
									BigTable.rows[row].cells[number[0]].innerHTML="&nbsp;";
									BigTable.rows[row].cells[number[1]].innerHTML="&nbsp;";
									BigTable.rows[j].cells[number[0]].innerHTML="&nbsp;";
									BigTable.rows[j].cells[number[1]].innerHTML="&nbsp;";
									if(document.getElementById('VoidNums').checked == true)
										ShowVoidNums();	//更新候选数信息，可优化为只更新一个单元格的候选数信息
									break;		//不必检查该空格的其它候选数
								}
							}
						}
						for(k=0;k<9;k++)  //该长方形的右列其它空格不能填这个数字
						{
							t=number[1];
							if(TrimStr(TableArray[k][t]) != "" || k == row || k == j)
								continue;
							p=VoidNum[k][t][0];
							for(i=0;i<p;i++)
							{
								if(VoidNum[k][t][i+1] == num)
								{
									BigTable.rows[row].cells[number[0]].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[row].cells[number[1]].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[j].cells[number[0]].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[row].cells[number[1]].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[row].cells[number[0]].bgColor="#99CCFF";
									BigTable.rows[row].cells[number[1]].bgColor="#99CCFF";
									BigTable.rows[j].cells[number[0]].bgColor="#99CCFF";
									BigTable.rows[j].cells[number[1]].bgColor="#99CCFF";
									BigTable.rows[k].cells[t].bgColor="#FFCC99";
									VoidNum[k][t][0]--;								//从该空格的可填数列表里删除num
									for(;i<p-1;i++)
										VoidNum[k][t][i+1]=VoidNum[k][t][i+2];
									if(document.getElementById("OneByOne").checked)	
									{
										if(flag == 0)					//可能会影响多个空格，只提示一次
											alert("由于数字"+num+"只能填在长方形四个顶点上，所以"+(k+1)+"行"+(t+1)+"列不能填"+num);
										else
											alert((k+1)+"行"+(t+1)+"列不能填"+num);
									}
									flag=1;
									BigTable.rows[row].cells[number[0]].innerHTML="&nbsp;";
									BigTable.rows[row].cells[number[1]].innerHTML="&nbsp;";
									BigTable.rows[j].cells[number[0]].innerHTML="&nbsp;";
									BigTable.rows[j].cells[number[1]].innerHTML="&nbsp;";
									if(document.getElementById('VoidNums').checked == true)
										ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
									break;  //不必检查该空格的其它候选数
								}
							}
						}
						if(flag == 1)
							return true;
					}
					count=2;
				}	//寻找下一个有两个空格的行
			}	//找到第一个有两个空格的行
		}	//寻找第一个有两个空格的行
	}	//扫描数字1-9
	return false;
}

//找到四个可组成长方形的空格，某个数字必须填在长方形两个相对的角上
function RectVoidsCol()
{
	var row,col,i,j,k,p,t,m,num,count,flag;
	var number=new Array();
	
	flag=0;
	for(num=1;num<=9;num++)	
	{
		for(col=0;col<9;col++)
		{
			count=0;
			for(row=0;row<9;row++)	//一个数字在该列的可填空格数：两个
			{
				if(TrimStr(TableArray[row][col]) != "")
					continue;
				t=VoidNum[row][col][0];
				for(i=0;i<t;i++)
				{
					if(VoidNum[row][col][i+1] == num)
						break;
				}
				if(i < t)
					number[count++]=row;
			}
			if(count == 2)
			{
				for(j=col+1;j<9;j++)
				{
					for(row=0;row<9;row++)	//同一个数字在另一列的可填空格数和位置
					{
						if(TrimStr(TableArray[row][j]) != "")
							continue;
						t=VoidNum[row][j][0];
						for(i=0;i<t;i++)
						{
							if(VoidNum[row][j][i+1] == num)
								break;
						}
						if(i < t)
							number[count++]=row;
					}
					if(count == 4 && number[0] == number[2] && number[1] == number[3])
																													//找到四个可组成长方形的空格，数字num必须填在长方形两个相对的角上
					{
						for(k=0;k<9;k++)	//该长方形的上行其它空格不能填这个数字
						{
							t=number[0];
							if(TrimStr(TableArray[t][k]) != "" || k == col || k == j)
								continue;
							p=VoidNum[t][k][0];
							for(i=0;i<p;i++)
							{
								if(VoidNum[t][k][i+1] == num)
								{
									BigTable.rows[number[0]].cells[col].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[number[1]].cells[col].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[number[0]].cells[j].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[number[1]].cells[j].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[number[0]].cells[col].bgColor="#99CCFF";
									BigTable.rows[number[1]].cells[col].bgColor="#99CCFF";
									BigTable.rows[number[0]].cells[j].bgColor="#99CCFF";
									BigTable.rows[number[1]].cells[j].bgColor="#99CCFF";
									BigTable.rows[t].cells[k].bgColor="#FFCC99";											
									VoidNum[t][k][0]--;								//从该空格的可填数列表里删除num
									for(;i<p-1;i++)
										VoidNum[t][k][i+1]=VoidNum[t][k][i+2];
									if(document.getElementById("OneByOne").checked)	
									{
										if(flag == 0)					//可能会影响多个空格，只提示一次
											alert("由于数字"+num+"只能填在长方形四个顶点上，所以"+(t+1)+"行"+(k+1)+"列不能填"+num);
										else
											alert((t+1)+"行"+(k+1)+"列不能填"+num);										
									}
									flag=1;
									BigTable.rows[number[0]].cells[col].innerHTML="&nbsp;";
									BigTable.rows[number[1]].cells[col].innerHTML="&nbsp;";
									BigTable.rows[number[0]].cells[j].innerHTML="&nbsp;";
									BigTable.rows[number[1]].cells[j].innerHTML="&nbsp;";
									if(document.getElementById('VoidNums').checked == true)
										ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
									break;				//不必检查该空格的其它候选数
								}
							}
						}
						for(k=0;k<9;k++)	//该长方形的下行其它空格不能填这个数字
						{
							t=number[1];
							if(TrimStr(TableArray[t][k]) != "" || k == col || k == j)
								continue;
							p=VoidNum[t][k][0];
							for(i=0;i<p;i++)
							{
								if(VoidNum[t][k][i+1] == num)
								{
									BigTable.rows[number[0]].cells[col].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[number[1]].cells[col].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[number[0]].cells[j].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[number[1]].cells[j].innerHTML="<font color='red'>"+num+"</font>";
									BigTable.rows[number[0]].cells[col].bgColor="#99CCFF";
									BigTable.rows[number[1]].cells[col].bgColor="#99CCFF";
									BigTable.rows[number[0]].cells[j].bgColor="#99CCFF";
									BigTable.rows[number[1]].cells[j].bgColor="#99CCFF";
									BigTable.rows[t].cells[k].bgColor="#FFCC99";
									VoidNum[t][k][0]--;								//从该空格的可填数列表里删除num
									for(;i<p-1;i++)
										VoidNum[t][k][i+1]=VoidNum[t][k][i+2];
									if(document.getElementById("OneByOne").checked)	
									{
										if(flag == 0)					//可能会影响多个空格，只提示一次
											alert("由于数字"+num+"只能填在长方形四个顶点上，所以"+(t+1)+"行"+(k+1)+"列不能填"+num);
										else
											alert((t+1)+"行"+(k+1)+"列不能填"+num);
									}
									flag=1;
									BigTable.rows[number[0]].cells[col].innerHTML="&nbsp;";
									BigTable.rows[number[1]].cells[col].innerHTML="&nbsp;";
									BigTable.rows[number[0]].cells[j].innerHTML="&nbsp;";
									BigTable.rows[number[1]].cells[j].innerHTML="&nbsp;";
									if(document.getElementById('VoidNums').checked == true)
										ShowVoidNums();							//更新候选数信息，可优化为只更新一个单元格的候选数信息
									break;	//不必检查该空格的其它候选数
								}
							}
						}
						if(flag == 1)
							return true;
					}
					count=2;
				}	//寻找下一个有两个空格的列
			}	//找到第一个有两个空格的列
		}	//寻找第一个有两个空格的列
	}	//扫描数字1-9
	return false;
}

function CheckCellUnique()	//检查每个空格的填入可能性
{
	var row,col,i,j,num,number,count;

	for(row=0;row<9;row++)
	{
		for(col=0;col<9;col++)
		{
			if(TrimStr(TableArray[row][col]) != "")
				continue;
			count=0;
			number=0;
			for(num=1;num<=9;num++)
			{
				for(i=0;i<CountNum[num-1][0];i++)
				{
					if(CountNum[num-1][i*2+1] == row && CountNum[num-1][i*2+2] == col)
					{
						count++;
						number=num;
						break;
					}
					else if(CountNum[num-1][i*2+1] > row)
						break;
				}				
			}
			if(count == 1)
			{
				findrow=row;
				findcol=col;
				findnumber=number;
				if(clicktype != "HintN")
					BigTable.rows[row].cells[col].bgColor="#99CCFF";
				if(document.getElementById("OneByOne").checked)	
					alert("该空格只能填"+number);
				return true;
			}
		}
	}
	return false;
}

function CheckMUnique()	//检查九宫内数字填入的可能性
{
	var num,count,i,j,k,trow,tcol,flag,findnum,stopnum;
	
	flag=0;
	findnum=0;
	stopnum=81;
	for(num=1;num<=9;num++)
	{
		for(i=0;i<3;i++)
		{
			for(j=0;j<3;j++)
			{
				count=0;
				trow=0;
				tcol=0;
				for(k=0;k<CountNum[num-1][0];k++)
				{
					if(CountNum[num-1][k*2+1] < i*3 || CountNum[num-1][k*2+1] > i*3+2 || CountNum[num-1][k*2+2] < j*3 || CountNum[num-1][k*2+2] > j*3+2)
						continue;
					count++;
					trow=CountNum[num-1][k*2+1];
					tcol=CountNum[num-1][k*2+2];
				}
				if(count == 1)
				{
					findrow=trow;
					findcol=tcol;
					findnumber=num;
					if(clicktype != "HintN")
						BigTable.rows[trow].cells[tcol].bgColor="#99CCFF";
					if(document.getElementById("OneByOne").checked)	
						alert(num+"只能填在九宫格内的这个空格");
					return true;					
				}
			}
		}			
	}
	return false;
}

function CheckCUnique()	//检查列内的数字可填充性
{
	var num,number,count,i,j,k,p,trow,tcol,flag,flag2,findnum,stopnum;
	
	flag=0;
	findnum=0;
	stopnum=81;
	for(num=1;num<=9;num++)
	{
		for(i=0;i<9;i++)	//扫描列
		{
			count=0;
			trow=0;
			tcol=0;
			for(j=0;j<9;j++)	//扫描列内的每个单元格
			{
				for(k=0;k<CountNum[num-1][0];k++)
				{
					if(TrimStr(TableArray[j][i]) != "" || CountNum[num-1][k*2+1] != j || CountNum[num-1][k*2+2] != i)
						continue;
					count++;
					trow=j;
					tcol=i;
				}
			}
			if(count == 1)
			{
				findrow=trow;
				findcol=tcol;
				findnumber=num;
				if(clicktype != "HintN")
					BigTable.rows[trow].cells[tcol].bgColor="#99CCFF";
				if(document.getElementById("OneByOne").checked)	
					alert(num+"只能填在这一列的这个空格");
				return true;				
			}			
		}			
	}
	return false;
}

function CheckRUnique()	//检查行内的数字可填充性	待修改××××
{
	var num,number,count,i,j,k,p,trow,tcol,flag,flag2,findnum,stopnum;
	
	flag=0;
	findnum=0;
	stopnum=81;
	for(num=1;num<=9;num++)
	{
		for(i=0;i<9;i++)	//扫描行
		{
			count=0;
			trow=0;
			tcol=0;
			for(j=0;j<9;j++)	//扫描行内的每个单元格
			{
				for(k=0;k<CountNum[num-1][0];k++)
				{
					if(TrimStr(TableArray[i][j]) != "" || CountNum[num-1][k*2+1] != i || CountNum[num-1][k*2+2] != j)
						continue;
					count++;
					trow=i;
					tcol=j;
				}
			}
			if(count == 1)
			{
				findrow=trow;
				findcol=tcol;
				findnumber=num;
				if(clicktype != "HintN")
					BigTable.rows[trow].cells[tcol].bgColor="#99CCFF";
				if(document.getElementById("OneByOne").checked)	
					alert(num+"只能填在这一行的这个空格");
				return true;					
			}			
		}			
	}
	return false;	
}

function HintN()
{
	clicktype="HintN";
	AutoFindOne();
}

function HintPst()
{
	clicktype="HintPst";
	AutoFindOne();
}

function HintNum()
{
	clicktype="HintNum";
	AutoFindOne();
}

function ChangeHint()
{
	//如果要给出填写原因，只能是“位置+数字”模式，禁用其他按钮
	if(document.getElementById('OneByOne').checked)
	{
		document.getElementById('hintn').disabled=true;
		document.getElementById('hintpst').disabled=true;
		document.getElementById('autotry').disabled=true;
	}
	else
	{
		document.getElementById('hintn').disabled=false;
		document.getElementById('hintpst').disabled=false;
		document.getElementById('autotry').disabled=false;
	}
}

function ChangeVoidNums()
{
	var row,col,flag=0,i,num,str,number;
	
	//GetTableValues();
	SetBgColor();
	if(Error == 1)
	{
		CheckEnd();
		return false;
	}
	
	if(document.getElementById('VoidNums').checked == false)
	{
		document.getElementById('hintpst').disabled=false;
		document.getElementById('hintnum').disabled=false;
		document.getElementById('autotry').disabled=false;
		document.getElementById('OneByOne').disabled=false;
		for(row=0;row<9;row++)
		{
			for(col=0;col<9;col++)
			{
				if(TrimStr(TableArray[row][col]) == "")
					BigTable.rows[row].cells[col].innerHTML="&nbsp;";
			}
		}
	}
	else
	{
		document.getElementById('hintpst').disabled=true;
		//document.getElementById('hintnum').disabled=true;
		document.getElementById('autotry').disabled=true;
		//document.getElementById('OneByOne').disabled=true;
		ShowVoidNums();
	}	
}

function ShowVoidNums()
{
	var row,col,flag=0,i,num,str,number;
	
	//GetTableValues();
	SetBgColor();
	if(Error == 1)
	{
		CheckEnd();
		return false;
	}
	
	if(VoidNum.length == 0)
	{
		for(row=0;row<9;row++)
		{
			for(col=0;col<9;col++)
			{
				if(TrimStr(TableArray[row][col]) == "")								//显示空格的候选数子（不使用高级技巧）
				{
					i=0;
					str="";
					for(num=1;num<=9;num++)
					{
						if(num == 4 || num == 7)
							str+="<br>";
						if(TestRow(num,row) == true && TestCol(num,col) == true && TestSmallTable(num,row,col) == true)
						{
							str+=num;
							i++;
							number=num;
						}
						else
							str+="&nbsp;";	
					}
					if(i > 1)
						BigTable.rows[row].cells[col].innerHTML="<font class='STYLE1'>"+str+"</font>";
					else
						BigTable.rows[row].cells[col].innerHTML="<font color='RED'><strong>"+number+"</strong></font>";
				}			
			}
		}
	}
	else		
	{
		for(row=0;row<9;row++)
		{
			for(col=0;col<9;col++)
			{
				if(TrimStr(TableArray[row][col]) == "")						//显示空格的候选数子（读取使用高级技巧后的结果）
				{
					num=VoidNum[row][col][0];
					if(num >= 2)
					{
						str="";
						for(num=1;num<=9;num++)
						{
							if(num == 4 || num == 7)
								str+="<br>";
							for(i=1;i<=VoidNum[row][col][0];i++)
							{
								if(VoidNum[row][col][i] == num)
								{
									str+=num;
									break;
								}
							}
							if(i > VoidNum[row][col][0])
								str+="&nbsp;";	
						}
						BigTable.rows[row].cells[col].innerHTML="<font  class='STYLE1'>"+str+"</font>";
					}
					else	//尝试后，有的空格候选数减少到1个
					{
						BigTable.rows[row].cells[col].innerHTML="<font color='red'><strong>"+VoidNum[row][col][1]+"</strong></font>";
					}
				}				
			}
		}
	}	
}

function TrimStr(str)
{
	var reg=/[1-9]+/;
	var result=reg.exec(str);
	if(result == null)
		return "";
	else
		return result;
}
