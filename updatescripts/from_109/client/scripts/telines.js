
// Define Variables
var _all		= mywindow.findChild("_all");
var _close 		= mywindow.findChild("_close");
var _edit 		= mywindow.findChild("_edit");
var _new		= mywindow.findChild("_new");
var _delete		= mywindow.findChild("_delete");
var _print 		= mywindow.findChild("_print");
var _lines		= mywindow.findChild("_lines");
var _selected	= mywindow.findChild("_selected");
var _view  		= mywindow.findChild("_view");
var _query		= mywindow.findChild("_query");
var _weekending	= mywindow.findChild("_weekending");
var _employees	= mywindow.findChild("_employees");
var _showAll	= mywindow.findChild("_showAll");
var _sheet;
var _id;
var _type;
var _admin;

var _newMode 	= 0;
var _editMode 	= 1;
var _viewMode	= 2;

var _filter;


//if the user is part of the ADMIN group, then show the "show all employees" checkbox
_showAll.visible = false;

_weekending.setStartNull(qsTr("Earliest"), startOfTime, true);
_weekending.setEndNull(qsTr("Latest"),     endOfTime,   true);

//add logic to determine the next Sunday date and populate both start and end with it

debugger;

//_lines.addColumn(qsTr("head id"), -1, Qt.AlignLeft,    true, "tehead_id");
_lines.addColumn(qsTr("Sheet Number"), -1, Qt.AlignLeft,    true, "sheet_number");
_lines.addColumn(qsTr("Line Number"), -1, Qt.AlignLeft,    true, "line_number");
_lines.addColumn(qsTr("Week Ending"), -1, Qt.AlignLeft,    true, "weekending");
_lines.addColumn(qsTr("Work Date"),   -1, Qt.AlignLeft,    true, "workdate");
_lines.addColumn(qsTr("Employee"), -1, Qt.AlignLeft,    true, "emp_code");
_lines.addColumn(qsTr("Client"), -1, Qt.AlignLeft,    true, "cust_number");
_lines.addColumn(qsTr("PO"), -1, Qt.AlignLeft,    true, "po");
_lines.addColumn(qsTr("Item"), -1, Qt.AlignLeft,    true, "item");
_lines.addColumn(qsTr("Description"), -1, Qt.AlignLeft,    true, "description");
_lines.addColumn(qsTr("Hours"),   -1, Qt.AlignLeft,    true, "hours");
_lines.addColumn(qsTr("Rate"), -1, Qt.AlignLeft,    true, "rate");


//_lines.sortItems(3,0);

_lines.itemSelected.connect(_edit, "animateClick");


// Populate the list
//_lines.sortByColumn(2);
//_lines.sortingEnabled = true;
//_lines.setFilter("sheet_number = '1141'");
//_lines.select();


// Make connections
_close.clicked.connect(mywindow, "close");
_print.clicked.connect(printReport);

_new.clicked.connect(lineNew);
_edit.clicked.connect(lineEdit);
_view.clicked.connect(lineView);
_delete.clicked.connect(lineDelete);
_query.clicked.connect(sFillList);
_showAll.toggled.connect(showAllswitch);


function set(input)
{
  //_lines.setFilter(input.filter);
  _filter = input.filter;
  _sheet = input.sheet;
  _id = input.headid;
  _type = input.type;  

  if("mode" in input)
  {
    if (input.mode == "new")
    {
      _mode = "new";
    }
    else if (input.mode == "edit")
    {
      _mode = "edit";
      _save.setFocus();
    }
    else if (input.mode == "view")
    {
      _mode = "view";
      _close.setFocus();
    }
  }

sFillList();
  return mainwindow.NoError;
}



function lineDelete()
{

  var msgBox     = new Object();
  msgBox.Yes     = 0x00004000;
  msgBox.No      = 0x00010000;
  msgBox.Default = 0x00000100;
  msgBox.Escape  = 0x00000200;

  try
  {
    var msg = "Are you sure you want to delete this line?"
    if (toolbox.messageBox("critical", mywindow, mywindow.windowTitle, msg, 
          msgBox.Yes | msgBox.Escape, msgBox.No | msgBox.Default) == msgBox.Yes)
    {
      var params   = new Object();
      params.id = _lines.id();  

      q = toolbox.executeQuery('DELETE FROM te.teitem '
                              + 'WHERE teitem_id=<? value("id") ?>;', params );
      sFillList();
    }
  }
  catch (e)
  {
    print(e);
    toolbox.messageBox("critical", mywindow, mywindow.windowTitle, e);
  }
}

function lineNew()
{
  lineOpen(0);  
//get the sheet from input...if the sheet is there...then pass it in
//...pass the _id if it's there...this is the headid and can be used to get the sheet
  sFillList();
}

function lineEdit()
{
  lineOpen(1);
  sFillList();
}

function lineView()
{
  lineOpen(2);
}

function lineOpen(mode)
{
  
  var params   = new Object;

//    toolbox.messageBox("critical", mywindow, mywindow.windowTitle, "timedtl_id='" + _lines.selectedValue(1) + "'");


  // new mode
  params.mode   = mode;
  if (mode == 0)
    {

    params.filter = "teitem_id=" + _lines.id();
    params.itemid = _lines.id();
    params.headid = _id;

    //params.filter = "timedtl_id='" + _lines.selectedValue(1) + "'";
    //params.line = _lines.selectedValue(2);
    //params.sheet = _sheet;
    }
  // edit mode
  if (mode == 1)
    {
    //params.filter = "timedtl_id='" + _lines.selectedValue(1) + "'";
    //params.line = _lines.selectedValue(2);
    //params.sheet = _lines.selectedValue(1);
    
    params.filter = "teitem_id=" + _lines.id();
    params.itemid = _lines.id();
    params.headid = _id;

    }

  var childwnd = toolbox.openWindow("time_expense", mywindow, 0, 1);
  var tmp = toolbox.lastWindow().set(params);

  var execval = childwnd.exec(); 

  sFillList();

}


function sFillList()
{

  try {
    var params = new Object;
    params.id = _id;
    params.type = _type;
    params.emp = _employees.id();
    if (params.type == null){
       params.type = 'A';
       _type = 'A';
    }


  params.startDate = _weekending.startDate;
  params.endDate   = _weekending.endDate;

/*
    var qry = toolbox.executeDbQuery("te", "getsheet", params);
    _sheets.populate(qry);
    if (qry.lastError().type != QSqlError.NoError)
    {
      toolbox.messageBox("critical", mywindow,
                       qsTr("Database Error"), qry.lastError().text);
      return;
    }

*/

  if (_id > 0)
  {
    if (_type == "A")
    {
       if (_showAll.checked){
          q = toolbox.executeQuery('select teitem_id,tehead_id,sheet_number,'
                             + 'weekending,workdate,item,description,hours,rate,'
                             + 'emp_code,cust_number,po,project,line_number '
                             + 'from te.tehead,te.api_timedetail,te.teitem '
                             + 'where tehead_number = sheet_number '
                             + 'and tehead_id = teitem_tehead_id '
                             + 'and teitem_linenumber = line_number '
                             + 'and weekending >= <? value("startDate") ?> '
                             + 'and weekending <= <? value("endDate") ?> '
                             + 'and tehead_id = <? value("id") ?> '
                             + ' order by tehead_id;', params );
       }else{
          q = toolbox.executeQuery('select teitem_id,tehead_id,sheet_number,'
                             + 'weekending,workdate,item,description,hours,rate,'
                             + 'emp_code,cust_number,po,project,line_number '
                             + 'from te.tehead,te.api_timedetail,te.teitem '
                             + 'where tehead_number = sheet_number '
                             + 'and tehead_id = teitem_tehead_id '
                             + 'and teitem_linenumber = line_number '
                             + 'and weekending >= <? value("startDate") ?> '
                             + 'and weekending <= <? value("endDate") ?> '
                             + 'and tehead_id = <? value("id") ?> '
                             + 'and teitem_emp_id = <? value("emp") ?> '
                             + ' order by tehead_id;', params );


       }




    }else{
        q = toolbox.executeQuery('select teitem_id,tehead_id,sheet_number,'
                             + 'weekending,workdate,item,description,hours,rate,'
                             + 'emp_code,cust_number,po,project,line_number '
                             + 'from te.tehead,te.api_timedetail,te.teitem '
                             + 'where tehead_number = sheet_number '
                             + 'and tehead_id = teitem_tehead_id '
                             + 'and teitem_linenumber = line_number '
                             + 'and weekending >= <? value("startDate") ?> '
                             + 'and weekending <= <? value("endDate") ?> '
                             + 'and teitem_type = <?value("type") ?>'
                             + 'and tehead_id = <? value("id") ?> '
                             + 'and teitem_emp_id = <? value("emp") ?> '
                             + ' order by sheet_number, workdate;', params );
    }
  }else{
    if (_showAll.checked){  
      q = toolbox.executeQuery('select teitem_id,tehead_id,sheet_number::integer,'
                             + 'weekending,workdate,item,description,hours,rate,'
                             + 'emp_code,cust_number,po,project,line_number '
                             + 'from te.tehead,te.api_timedetail,te.teitem '
                             + 'where tehead_number = sheet_number '
                             + 'and tehead_id = teitem_tehead_id '
                             + 'and teitem_linenumber = line_number '
                             + 'and weekending >= <? value("startDate") ?> '
                             + 'and weekending <= <? value("endDate") ?> '
                             + ' order by tehead_id,teitem_id;', params );
    }else{
      q = toolbox.executeQuery('select teitem_id,tehead_id,sheet_number::integer,'
                             + 'weekending,workdate,item,description,hours,rate,'
                             + 'emp_code,cust_number,po,project,line_number '
                             + 'from te.tehead,te.api_timedetail,te.teitem '
                             + 'where tehead_number = sheet_number '
                             + 'and tehead_id = teitem_tehead_id '
                             + 'and teitem_linenumber = line_number '
                             + 'and weekending >= <? value("startDate") ?> '
                             + 'and weekending <= <? value("endDate") ?> '
                             + 'and teitem_emp_id = <? value("emp") ?> '
                             + ' order by tehead_id,teitem_id;', params );
    }





  }


//    var qry = toolbox.executeDbQuery("booItemList", "detail", params);
    _lines.populate(q);
    if (q.lastError().type != QSqlError.NoError)
    {
      toolbox.messageBox("critical", mywindow,
                         qsTr("Database Error"), q.lastError().text);
      return;
    }

  } catch (e) {
    print(e.lineNumber + ": " + e);
  }

}



function getParams()
{
  params = new Object();
  if (_selected.checked)
    //params.salesrep_id = _salesrep.id();
  return params;
}

function printReport()
{
  toolbox.printReport("ListOpenSalesOrdersBySalesrep", getParams());
}


function showAllswitch()
{
    if (_showAll.checked){  
      _employees.enabled = false;
    }else{
      _employees.enabled = true;
    }

}



// check to see if the user is an admin...if yes...show the "_showAll" checkbox
var params = new Object;
q = toolbox.executeQuery('select grp_id,usrgrp_id from grp, '
                     + " usrgrp where grp_name = 'ADMIN' " 
                     + ' and grp_id = usrgrp_grp_id '
                     + ' and usrgrp_username = CURRENT_USER ;', params );                     

if (q.first())
{
  _showAll.visible = true;
  _admin = true;
}
else if (q.lastError().type != 0)
{
  toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                    q.lastError().databaseText);
} 



if (_admin)
{
  var params = new Object; 
  q = toolbox.executeQuery("select emp_id,emp_code from emp where emp_code = CURRENT_USER;",params);
  //_employees.addItem("test");

  if (q.first())
  {
    _x = (q.value("emp_id"));
    
  }
  else if (q.lastError().type != 0)
  {
    toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                    q.lastError().databaseText);
  } 


  _employees.populate("SELECT emp_id,emp_code FROM emp",_x);


}else{
  _employees.populate("SELECT emp_id,emp_code FROM emp where emp_code = CURRENT_USER");
}

