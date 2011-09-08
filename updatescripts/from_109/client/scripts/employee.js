debugger;

//find the tab list and create a new widget to insert into it.
var tablist = mywindow.findChild("_tabWidget"); 
// load a predefined screen by name from the database
var billingPage = toolbox.loadUi("tebillingemp", mywindow);

//insert the new tab
toolbox.tabInsertTab(tablist,4,billingPage, "Billing Information");

var _save = mywindow.findChild("_save");
_save.clicked.connect(billingSave);
             

var _number 	= mywindow.findChild("_number");
var _rateemp	= mywindow.findChild("_rateemp"); 
var _cust		= mywindow.findChild("_cust");
var _name 		= mywindow.findChild("_name");
var _code		= mywindow.findChild("_code");
mywindow.findChild("_item").visible = false;
mywindow.findChild("_itemLit").visible = false;
mywindow.findChild("_cust").visible = false;

//_code.textChanged.connect(getEmployeeRate);
//_number.textChanged.connect(getCustomerRate);
//_number['numberChanged(QString)'].connect(getCustomerRate);

_code['textChanged(QString)'].connect(getEmployeeRate);


function set(params)
{
//toolbox.messageBox("critical", mywindow, mywindow.windowTitle,_code.text);
//getEmployeeRate();

}


function billingSave()
{

   var params = new Object();
   params.rate = mywindow.findChild("_rateemp").text;
   params.code = _code.text;
   if (params.rate == '')
   {
     params.rate = 0;
   }
   var q = toolbox.executeQuery("SELECT emp_id "
        + "FROM emp "
        + ' WHERE emp_code = <? value("code") ?>;',params);

   if (q.first())
   {
     params.empid = q.value("emp_id");
   }

   var q = toolbox.executeDbQuery("te","addteemprate",params);

}



function getEmployeeRate()
{
    var params = new Object();
    params.code = mywindow.findChild("_code").text;    

   var q = toolbox.executeQuery("SELECT emp_id "
        + "FROM emp "
        + ' WHERE emp_code = <? value("code") ?>;',params);

    if (q.first())
    {

      params.empid = q.value("emp_id");
       var q = toolbox.executeQuery("SELECT teemprate_rate as rate "
        + "FROM te.teemprate "
        + ' WHERE teemprate_emp_id = <? value("empid") ?>;',params);

      if (q.first())
      {
        mywindow.findChild("_rateemp").setText(q.value("rate"));
      }
    }

}
