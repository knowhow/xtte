debugger;
// Define Variables
var _timeexpense	= mywindow.findChild("timeExpense");
var _all		= mywindow.findChild("_all");
var _close 		= mywindow.findChild("_close");
var _edit 		= mywindow.findChild("_edit");
var _new		= mywindow.findChild("_new");
var _delete		= mywindow.findChild("_delete");
var _view		= mywindow.findChild("_view");
var _print 		= mywindow.findChild("_print");
var _printSheet	= mywindow.findChild("_printSheet");
var _lines		= mywindow.findChild("_lines");
var _selected	= mywindow.findChild("_selected");
var _weekending	= mywindow.findChild("_weekending");
var _employees	= mywindow.findChild("_employees");
var _sheetNumberExtra  = mywindow.findChild("_sheetNumberExtra");
var _site		= mywindow.findChild("_site");
var _save		= mywindow.findChild("_save");
var _orderComments     = mywindow.findChild("_orderComments");
var _TimeExpenseInformation  = mywindow.findChild("_TimeExpenseInformation");
var _sheet;
var _id;
var _type;
var _admin;
var _empid;
var _first = true;

_printSheet.visible = false;

_view.enabled = true;
_edit.enabled = true;
_new.enabled = false;
_delete.enabled = true;

var _newMode 	= 0;
var _editMode 	= 1;
var _viewMode	= 2;

var _filter;


//add logic to determine the next Sunday date and populate both start and end with it

//_lines.addColumn(qsTr("head id"), -1, Qt.AlignLeft,    true, "tehead_id");
_lines.addColumn(qsTr("Sheet Number"),-1, Qt.AlignLeft,    true, "sheet_number");
_lines.addColumn(qsTr("Line Number"), 115, Qt.AlignLeft,    true, "line_number");
_lines.addColumn(qsTr("Sheet Date"), 50, Qt.AlignLeft,    true, "weekending");
_lines.addColumn(qsTr("Work Date"),   50, Qt.AlignLeft,    true, "workdate");
_lines.addColumn(qsTr("Customer"),	    115, Qt.AlignLeft,    true, "cust_number");
_lines.addColumn(qsTr("PO"), 	    100, Qt.AlignLeft,    true, "po");
_lines.addColumn(qsTr("Item"), 	    115, Qt.AlignLeft,    true, "item");
_lines.addColumn(qsTr("Description"), 115, Qt.AlignLeft,    true, "description");
_lines.addColumn(qsTr("Units"),   	    100, Qt.AlignLeft,    true, "hours");

if (privileges.check("CanViewRates"))
{
  _lines.addColumn(qsTr("Rate"), 	    115, Qt.AlignRight,    true, "rate");
  _lines.addColumn(qsTr("Extended"),    115, Qt.AlignRight,    true, "extended");
}
_lines.addColumn(qsTr("Time/Exp"),    20, Qt.AlignLeft,    true, "type");

_lines.itemSelected.connect(_edit, "animateClick");

// Make connections
_close.clicked.connect(mywindow, "close");

_lines.valid.connect(sHandleButtons);

_new.clicked.connect(lineNew);
_edit.clicked.connect(lineEdit);
_delete.clicked.connect(lineDelete);
_view.clicked.connect(lineView);
_save.clicked.connect(sSave);
_orderComments.textChanged.connect(sHandleSaveButton);

_TimeExpenseInformation['currentChanged(int)'].connect(sTabCheck);


function set(input)
{
  _filter = input.filter;
  _sheet = input.sheet;

  if("emp_id" in input)
    _employees.setId(input.emp_id);

  if("mode" in input)
  {
    if (input.mode == 0)
    {
      _mode = "new";
      _weekending.enabled = true;
      _view.enabled = false;
      _edit.enabled = false;
      _delete.enabled = false;
    }
    else if (input.mode == 1)
    {
      _mode = "edit";
      _id = input.headid;
      _save.setFocus();
      _weekending.enabled = false;
      _employees.enabled = false;
      _site.enabled = false;

      sFillList();
    }
    else if (input.mode == 2)
    {
      _mode = "view";
      _close.setFocus();
      _id = input.headid;
      _save.enabled = false;
      _view.enabled = true;
      _edit.enabled = false;
      _new.enabled = false;
      _delete.enabled = false;
      _orderComments.enabled = false;

      sFillList();
    }
  }

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

//get the sheet from input...if the sheet is there...then pass it in
//...pass the _id if it's there...this is the headid and can be used to get the sheet

//...if there's no sheet...then save the te.tehead record and get the sheet number

  if(_id > 0)
  {
  
  }else{
    var params   = new Object();

    q = toolbox.executeQuery("select nextval('te.timesheet_seq') as sheetnum;");

    if (q.first())
    {    
      params.sheetnum = q.value("sheetnum");  
      _sheetNumberExtra.text = q.value("sheetnum");
    }
  
    q = toolbox.executeQuery("select nextval('te.tehead_tehead_id_seq') as headid;");

    if (q.first())
    {    
      params.headid = q.value("headid");  
      _id = q.value("headid");
    }

    params.site = _site.text;
    params.weekending = _weekending.date;

    q = toolbox.executeQuery('insert into te.tehead('
                       + ' tehead_id,tehead_site,tehead_weekending,'
                       + 'tehead_number) VALUES (<? value("headid") ?>,'
                       + '<? value("site") ?>,<? value("weekending") ?>'
                       + ',<? value("sheetnum") ?>);',params );
  
  }
  lineOpen(0);  

  _weekending.enabled = false;
  _employees.enabled = false;
  _site.enabled = false;
  _save.enabled = true;


  //need to get the id here
  sFillList();
}

function lineEdit()
{
  lineOpen(1);
  _save.enabled = true;
  sFillList();
}


function lineView()
{
  lineOpen(2);
  sFillList();
}


function lineOpen(mode)
{  
  var params   = new Object;

  // new mode
  params.mode   = mode;
  if (mode == 0)
    {
    params.filter = "teitem_id=" + _lines.id();
    params.itemid = _lines.id();
    params.headid = _id;
    params.site = _site.text;
    params.weekending = _weekending.date;
    params.empid = _employees.id();

    }
  // edit mode
  if (mode == 1)
    {
    params.filter = "teitem_id=" + _lines.id();
    params.itemid = _lines.id();
    params.headid = _id;
    params.site = _site.text;
    params.weekending = _weekending.date;
    params.empid = _employees.id();
    }

  // view mode
  if (mode == 2)
    {
    params.filter = "teitem_id=" + _lines.id();
    params.itemid = _lines.id();
    params.headid = _id;
    params.site = _site.text;
    params.weekending = _weekending.date;
    params.empid = _employees.id();
    }


  try {
    var wnd = toolbox.openWindow("time_expense", mywindow, Qt.ApplicationModal, Qt.Dialog);
    toolbox.lastWindow().set(params);
    wnd.exec();
  } catch(e) {
    print("te open time_expense exception @ " + e.lineNumber + ": " + e);
  }

  sFillList();
}

function sSave()
{
    var params = new Object;
    params.id = _id;
    params.emp = _employees.id();
    params.site = _site.text;
    params.notes = _orderComments.plainText;

    q = toolbox.executeQuery('update te.tehead set tehead_site = <? value("site") ?>,'
 	                  + 'tehead_notes = <? value("notes") ?> '
                              + ' WHERE tehead_id=<? value("id") ?>;', params );
    
    mydialog.accept();
}


function sHandleSaveButton()
{
  if (_first == false){
    _save.enabled = true;
  }else{
    _first = false;
  }
}



function sFillList()
{
  try {
    var params = new Object;
    params.id = _id;
    params.type = _type;
    params.emp = _employees.id();

  if (_id > 0)
  {
    q = toolbox.executeQuery('select teitem_id,tehead_id,'
		+ 'tehead_number as sheet_number,'
                       + 'tehead_site, tehead_weekending as weekending,'
                       + 'teitem_workdate as workdate,item_number as item,'
		+ 'item_descrip1 as description,'
                       + 'formatqty(teitem_qty) as hours,'
                       + 'formatsalesprice(teitem_rate) as rate,'
                       + "emp_code,teitem_emp_id,'' as cust_number,"
		+ 'teitem_po as po,teitem_linenumber as line_number, '
		+ 'tehead_notes as notes,teitem_type as type, '
                       + 'formatsalesprice(teitem_total) as extended '
                       + 'from te.tehead,te.teitem,item,emp '
                       + 'where tehead_id = teitem_tehead_id '
                       + 'and tehead_id = <? value("id") ?> '
                       + 'and teitem_emp_id= emp_id '
                       + 'and teitem_item_id = item_id '
                       + 'and teitem_cust_id = -1 '
		+ 'union '
		+ 'select teitem_id,tehead_id,'
		+ 'tehead_number as sheet_number,'
                       + 'tehead_site, tehead_weekending as weekending,'
                       + 'teitem_workdate as workdate,item_number as item,'
		+ 'item_descrip1 as description,'
                       + 'formatqty(teitem_qty) as hours,'
                       + 'formatsalesprice(teitem_rate) as rate,'
                       + 'emp_code,teitem_emp_id,cust_number,'
		+ 'teitem_po as po,teitem_linenumber as line_number, '
		+ 'tehead_notes as notes,teitem_type as type, '
                       + 'formatsalesprice(teitem_total) as extended '
                       + 'from te.tehead,te.teitem,item,emp,cust '
                       + 'where tehead_id = teitem_tehead_id '
                       + 'and tehead_id = <? value("id") ?> '
                       + 'and teitem_emp_id= emp_id '
                       + 'and teitem_item_id = item_id '
                       + 'and teitem_cust_id = cust_id '
                       + 'order by line_number ', params );
  }else{
    q = toolbox.executeQuery('select teitem_id,tehead_id,tehead_number as sheet_number,'
                             + 'tehead_site,tehead_weekending s weekending,'
                             + 'teitem_workdate as workdate,'
                             + 'item_number as item,item_descrip1 as description,'
                             + 'formatqty(teitem_qty) as hours,'
                             + 'formatsalesprice(teitem_rate) as rate,'
                             + "emp_code,teitem_emp_id,'' as cust_number,"
		      + 'teitem_po as po,'
                             + 'teitem_linenumber as line_number, '
   		      + 'tehead_notes as notes,teitem_type as type, '
                             + 'formatsalesprice(teitem_total) as extended '
                             + 'from te.tehead,te.teitem,item,emp '
                             + 'where tehead_id = teitem_tehead_id '
                             + 'and teitem_emp_id = emp_id '
                             + 'and teitem_item_id = item_id '
                             + 'and teitem_emp_id = <? value("emp") ?> '
		      + 'union '
		      + 'select teitem_id,tehead_id,'
		      + 'tehead_number as sheet_number,'
                             + 'tehead_site,tehead_weekending s weekending,'
                             + 'teitem_workdate as workdate,'
                             + 'item_number as item,item_descrip1 as description,'
                             + 'formatqty(teitem_qty) as hours,'
                             + 'formatsalesprice(teitem_rate) as rate,'
                             + 'emp_code,teitem_emp_id,cust_number,teitem_po as po,'
                             + 'teitem_linenumber as line_number, '
   		      + 'tehead_notes as notes,teitem_type as type, '
                             + 'formatsalesprice(teitem_total) as extended '
                             + 'from te.tehead,te.teitem,item,emp,cust '
                             + 'where tehead_id = teitem_tehead_id '
                             + 'and teitem_emp_id = emp_id '
                             + 'and teitem_item_id = item_id '
                             + 'and teitem_cust_id = cust_id '
                             + 'and teitem_emp_id = <? value("emp") ?> '
                             + ' order by line_number;', params );

  }

    _lines.populate(q);
    if (q.first())
    {    
    _weekending.date = q.value("weekending");
    _sheetNumberExtra.text = q.value("sheet_number");
    _employees.setId(q.value("teitem_emp_id"));
    _empid = q.value("teitem_emp_id");
    _site.text = q.value("tehead_site");
    _orderComments.setPlainText(qsTr(q.value("notes")));
    }

    if (q.lastError().type != QSqlError.NoError)
    {
      toolbox.messageBox("critical", mywindow,
                         qsTr("Database Error"), q.lastError().text);
      return;
    }

  } catch (e) {
    print(e.lineNumber + ": " + e);
  }

  if (_mode == "view"){
      _weekending.enabled = false;
      _employees.enabled = false;
      _site.enabled = false;
  }
}


function sHandleButtons()
{
  var currentItem  = _lines.currentItem();
  if (currentItem != null)
  {
    if (_mode != "view"){
      _delete.enabled = true;
      _edit.enabled = true;
      _view.enabled = true;
    }
  }
}


function sTabCheck()
{

  if (_TimeExpenseInformation.currentIndex > 0)
  {
    if(_weekending.date == "Invalid Date")
    {
      toolbox.messageBox("critical", mywindow,
         qsTr("Date Required"), qsTr("A Sheet Date is required.  Please enter a date to continue.") );

      _TimeExpenseInformation.setCurrentIndex(0);
      _weekending.setFocus();
    }else{
      if (_mode != "view"){
        _new.enabled = true;
      }
    }
  }   
}


function printReport()
{
  //toolbox.printReport("ListOpenSalesOrdersBySalesrep", getParams());
}


if (privileges.check("MaintainTimeExpenseOthers"))
{
  if(_empid > 0)
  {
     _x = _empid;
    _employees.populate("SELECT emp_id,emp_code FROM emp order by emp_code",_x);
  }
  else
  {
    var params = new Object; 
    q = toolbox.executeQuery("select emp_id,emp_code from emp order by emp_code;",params);

    if (q.first())
    {
      _x = (q.value("emp_id"));
      _employees.populate("SELECT emp_id,emp_code FROM emp order by emp_code",_x);
    }
    else
    {
      _employees.populate("SELECT emp_id,emp_code FROM emp order by emp_code");
    }
  }

}else{
  if (privileges.check("MaintainTimeExpenseSelf"))
  {
    _employees.populate("SELECT emp_id,emp_code FROM emp where emp_code = CURRENT_USER");
  }
}



