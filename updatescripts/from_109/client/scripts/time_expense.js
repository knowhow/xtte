debugger;
// time_expense.js
// Define local variables

var _newMode    = 0;
var _editMode   = 1;
var _viewMode   = 2;

var _hours		= mywindow.findChild("_hours");
var _total		= mywindow.findChild("_total");	
var _totalLit	= mywindow.findChild("_totalLit");	
var _rate	  	= mywindow.findChild("_rate");
var _rateLit	= mywindow.findChild("_rateLit");
var _clients	= mywindow.findChild("_clients");
var _employees	= mywindow.findChild("_employees");
var _items		= mywindow.findChild("_items");
var _po		= mywindow.findChild("_po");
var _project	= mywindow.findChild("_project");
var _task		= mywindow.findChild("_task");
var _linenumber	= mywindow.findChild("_linenumber");
var _sheet		= mywindow.findChild("_sheet");
var _cancel		= mywindow.findChild("_cancel");
var _save		= mywindow.findChild("_save");
var _weekending	= mywindow.findChild("_weekending");
var _workdate	= mywindow.findChild("_workdate");
var _radioTime	= mywindow.findChild("_radioTime");
var _radioExpense	= mywindow.findChild("_radioExpense");
var _qtyLabel        	= mywindow.findChild("_qtyLabel");
var _billable        	= mywindow.findChild("_billable");
var _prepaid        	= mywindow.findChild("_prepaid");
var _budgetactual	= mywindow.findChild("_budgetactual");	
var _actual        	= mywindow.findChild("_actual");
var _budget        	= mywindow.findChild("_budget");
var _actualCost       	= mywindow.findChild("_actualCost");
var _budgetCost       	= mywindow.findChild("_budgetCost");
var _notes		= mywindow.findChild("_notes");
var _prev		= mywindow.findChild("_previous");
var _next		= mywindow.findChild("_new");
var _savehours;
var _saverate;
var _saveproject;
var _savetask;
var _sheetnum;
var _linenum;
var _itemid;
var _headid;
var _type;
var _empid;
var _taskid;
var _site;
var _hoursSAVED;
var _totalSAVED;
var _billableSAVED;
var _prepaidSAVED;
var _first = true;
var _mode;
var _nav;
var _modified = false;
var _newlinenum;
var _error = false;

_task.enabled = false;
_task.newID.connect(sHandleTask);
// look to the booitem script for handling of project/task change


//add budget/actual
//var _items = mywindow.findChild("_items");
//var layout = toolbox.widgetGetLayout(_items);

//var _budgetactual = toolbox.loadUi("budgetactual", mywindow);
//toolbox.layoutGridAddWidget(layout, _budgetactual, 0, 0);

// if the employee has admin priv - then enable the employee drop down...otherwise...populate only with the current employee/login

var _sheetLit 	= mywindow.findChild("_sheetLit");
var _linenumberLit 	= mywindow.findChild("_linenumberLit");

_sheetLit.visible=false;
_linenumberLit.visible = false;

// Define connections
_rate.valueChanged.connect(extension);
_hours.valueChanged.connect(extension);
//_items['currentIndexChanged(QString)'].connect(getprice);
_items["newId(int)"].connect(getprice);
_cancel.clicked.connect(cancel);
_task.clicked.connect(gettask);
_save.clicked.connect(sSaveClose);
var ext = _hours.text * _rate.text;
_total.setLocalValue(ext)
_total.enabled=false;
_total.readonly = true;
_radioTime.checked = true;
_billable.visible = true;
_prepaid.visible = false;
_radioTime.clicked.connect(timeswitch);
_radioExpense.clicked.connect(expenseswitch);
_billable.clicked.connect(billablecheck);
_prepaid.clicked.connect(prepaidcheck);
_prev.clicked.connect(sPrev);
_next.clicked.connect(sNext);
_notes.textChanged.connect(notesChange);
//_clients['currentIndexChanged(QString)'].connect(clientChange);
_clients["newId(int)"].connect(clientChange);
_project["newId(int)"].connect(projectChange);
_po.editingFinished.connect(setButtons);
_linenumber.enabled = true;

//_project.enabled = false;
_task.enabled = false;
_employees.enabled = false;
_prev.enabled = false;
_save.enabled = false;
_next.enabled = false;


//NOTE:  
//   startDate = Weekending
//   endDate = WorkDate

function set(input)
{
  if(input.empid > 0){
    var params = new Object();    
    params.empid = input.empid;
    _employees.setId(params.empid);
  }
  
  if(input.weekending != "Invalid Date"){
    _weekending.date = input.weekending;
    _weekending.enabled = false;
  }

  if ("mode" in input)
  {
    if (input.mode == _newMode)
    {
      _mode = _newMode;
      // if sheet/line are passed...then we need to add a new line to the given sheet
      // get default rate/customer from the project billing setup
      _next.text = qsTr("New");
      _itemid = input.itemid;      
      _headid = input.headid;
      _site = input.site;
      _empid = input.empid;
      // increment the max line number...
      populate(0);
    }
    else if (input.mode == _viewMode)
    {
      _mode = _viewMode;
      _cancel.text = "Close";
      _itemid = input.itemid;      
      _headid = input.headid;
      _site = input.site;
      _empid = input.empid;
      _save.enabled = false;
      populate(2);
    }
    else if (input.mode == _editMode)
    {
      _mode = _editMode;      
      _itemid = input.itemid;
      _headid = input.headid;
      _site = input.site;
      populate(1);
    }
  }
  //getprice();  
  return 0;
}


function setButtons()
{
  if (_mode != _viewMode){
    _save.enabled = true;
    _next.enabled = true;
  }
}

function extension()
{
  var _rate	  	= mywindow.findChild("_rate");
  var _hours  	= mywindow.findChild("_hours");  
  var _total	= mywindow.findChild("_total");
  _total.localValue = (_hours.localValue * _rate.localValue)

  if(_first == true)
  {
    _totalSAVED = _total.localValue;
  }else{
    _modified = true;
  }

  if(_task.id() > 0)
  {
    //rollupActual();
  }
}


function sFillItems()
{
     _items.setQuery("select item_id,item_number,item_descrip1 from "
             + "(SELECT item_id,item_number,item_descrip1,"
             + "coalesce(teexp_id::text,'N') as exp "
             + "FROM te.teexp right OUTER JOIN (select item_id,item_number, "
             + "item_descrip1 from item "
             + "where item_active = true "
             + "and item_type = 'R') filter"
             + " ON teexp_id = item_id) exptable "
             + "where exp <> 'N'");
}

function gettask()
{
  var params = new Object();
  params.prj = _project.id();

  if(params.prj > 0){

    var qry = toolbox.executeDbQuery("te", "gettask", params);
    _task.populate(qry);

    if(_taskid > 0){
      _task.setId(_taskid);
    }

    if(qry.lastError().type != QSqlError.NoError)
    {
      toolbox.messageBox("critical", mywindow,
                       qsTr("Database Error"), qry.lastError().text);
      return;
    }

    if (qry.first())
    {
    // no action
    }else{
        toolbox.messageBox("critical", mywindow,
                       qsTr("task"), "No task found. A default task will be added");

      var parmlist = new Object();
      parmlist.prjnum = _project.number;

      var q = toolbox.executeQuery("insert into api.task(project_number,"
	+ "number,status,name,description,owner,assigned_to) "
	+ 'values(<? value("prjnum") ?>,'
	+ "'DEFAULT','In-Process',"
            + "'Default','Default',CURRENT_USER,CURRENT_USER);",parmlist);
    }

    getprice();
    setActualBudget();
  }
}


function sHandleTask()
{  
  getprice();
  setActualBudget();
}


function populateProjects()
{
  var q = toolbox.executeQuery("SELECT 0 as prj_id, ' ' as prj_number FROM prj "
        + " UNION "
        + "SELECT prj_id,prj_number FROM prj;");
  if (q.first())
  {
    _project.populate(q);  
  }
  else if (q.lastError().type != 0)
  {
    toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                       q.lastError().databaseText);
    return;
  }
}


function getprice()
{
   // pricing heirarchy...
   //   - item list price (rate)
   //   - customer default rate from Billing Info tab in cust master

   //   - employee default rate from emp table (need a cust/emp relationship)
   //   - project rate (from project itself) (need a emp/project relationship)
   //   - task rate (from task...under project)  (need a emp/task relationship)

   // allow use of pricing schedule and price qty breaks (future functionality)
   // the new billing tabs for Project & Task will each have a rate defined...these should override the list price...but what about the price schedule???

// added the && _rate.text == ""

  if (_first == false){
    _modified = true;
  }
  
  var _ratetest = mywindow.findChild("_rate").localValue;

  if (_radioExpense.checked && _ratetest == "0.00"){

    // check for item list price
    var params = new Object();
    params.itemid = _items.id();

    var qry = toolbox.executeQuery('SELECT item_listprice as listprice '
      + ' from item where item_id = <? value("itemid") ?>;',params);

    if(qry.lastError().type != QSqlError.NoError)
    {
      toolbox.messageBox("critical", mywindow,
                       qsTr("Database Error"), qry.lastError().text);
      return;
    }

    if (qry.first())
    {
      _rate.setLocalValue(qry.value("listprice"));
    }
  } //expense

  // check for task rate
  if (_radioTime.checked){
    var params = new Object();
    params.taskid = _task.id();

    var qry = toolbox.executeQuery("SELECT teprjtask_rate as rate "
                        + "FROM te.teprjtask,prjtask "
                        + ' WHERE prjtask_number = teprjtask_prjtask_number '
                     	 + ' and prjtask_prj_id = teprjtask_prj_id '
		 + ' and prjtask_id = <? value("taskid") ?>;',params);
    if (qry.first())
    {
      _rate.localValue = (qry.value("rate"));
      return;
    }
    else if (qry.lastError().type != 0)
    {
      toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                       qry.lastError().databaseText);
      return;
    } 

    // check for project rate
    var params = new Object();
    params.prjid = _project.id();
    params.custid = _clients.id();

    var qry = toolbox.executeQuery("SELECT teprj_rate as rate "
                               + "FROM te.teprj "
                               + ' WHERE teprj_cust_id = <? value("custid") ?> '
                               + ' and teprj_prj_id = <? value("prjid") ?>;',params);
    if (qry.first())
    {
      _rate.localValue = (qry.value("rate"));
      return;
    }
    else if (qry.lastError().type != 0)
    {
      toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                       qry.lastError().databaseText);
      return;
    } 

    // check for emp rate
    var params = new Object();
    params.code = _employees.text;

    var qry = toolbox.executeQuery("SELECT emp_id "
        + "FROM emp "
        + ' WHERE emp_code = <? value("code") ?>;',params);

    if (qry.first())
    {
      params.empid = qry.value("emp_id");
       var qry = toolbox.executeQuery("SELECT teemprate_rate as rate "
        + "FROM te.teemprate "
        + ' WHERE teemprate_emp_id = <? value("empid") ?>;',params);

      if (qry.first())
      {
        _rate.localValue = (qry.value("rate"));
        return;
      }
    }

    // check for customer rate
    var params = new Object();
    params.custname = _clients.text;

    var qry = toolbox.executeQuery("SELECT tecustrate_rate as rate "
        + "FROM te.tecustrate "
        + ' WHERE tecustrate_cust_name = <? value("custname") ?>;',params);

    if (qry.first())
    {
      _rate.localValue = (qry.value("rate"));
      return;
    }
    else if (qry.lastError().type != 0)
    {
      toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                       qry.lastError().databaseText);
      return;
    } 

    // check for item list price
    var params = new Object();
    params.itemid = _items.id();

    var qry = toolbox.executeQuery('SELECT item_listprice as listprice '
      + ' from item where item_id = <? value("itemid") ?>;',params);

    if(qry.lastError().type != QSqlError.NoError)
    {
      toolbox.messageBox("critical", mywindow,
                       qsTr("Database Error"), qry.lastError().text);
      return;
    }

    if (qry.first())
    {
      _rate.setLocalValue(qry.value("listprice"));
    }
  } //time
}


function cancel()
{
  if (mywindow.windowModality)
    mydialog.reject();
  else
    mywindow.close();
}

function populate(mode)
{
  _modified = false;
  if (mode == _editMode)
  {
    _sheetLit.visible=true;
    _linenumberLit.visible = true;
    _weekending.enabled = false;
    try
    {

      var params = new Object();
      params.id = _itemid;
      params.headid = _headid;
	
      var q = toolbox.executeQuery("SELECT tehead_site as site, "
                               + "tehead_weekending as weekending, "
                               + "tehead_number as sheetnum, "
		        + "teitem_workdate as workdate, "
		        + "teitem_linenumber as line_number, "
		        + "teitem_item_id as itemid,teitem_rate as rate, "
                               + "teitem_qty as hours, teitem_total as total,"
		        + "teitem_emp_id as empid, "
		        + "teitem_po as po, teitem_prjtask_id as task,"
                               + "teitem_cust_id as custid, teitem_prj_id as project, "
                               + "teitem_type as type,teitem_prepaid as prepaid, "
                               + "teitem_billable as billable,teitem_notes as notes "
                               + "FROM te.tehead,te.teitem "
                               + " WHERE tehead_id = teitem_tehead_id and " 		
                               + ' teitem_id=<? value("id") ?>;',params);

      if (q.first())
      {
        _type = (q.value("type"));
        if (_type == "T") 
        {
          _radioTime.checked = true;
          timeswitch();
        }else{
          _radioExpense.checked = true;
          expenseswitch();
          if(q.value("billable")){
             _billable.checked = true;
          
          }
          if(q.value("prepaid")){
             _prepaid.checked = true;
          }
        }
        _weekending.date = (q.value("weekending"));
        _weekending.enabled = false;
        _workdate.date = (q.value("workdate"));
        _rate.localValue = (q.value("rate"));
        _saverate = q.value("rate");
        _hours.localValue = (q.value("hours"));
        _hoursSAVED = (q.value("hours"));
        _items.setId(q.value("itemid"));
        _employees.setId(q.value("empid"));
        _clients.setId(q.value("custid"));
        _po.text = (q.value("po"));
        _project.setId(q.value("project"));
        _taskid = q.value("task");
        gettask();
        _sheet.text = (q.value("sheetnum"));
        _sheetnum = (q.value("sheetnum"));
        _linenumber.text = (q.value("line_number"));
        _linenum = (q.value("line_number"));
        _notes.setText(q.value("notes"));
        _notesSAVED = _notes;

        if (q.value("billable") == true)
        {
          _billable.checked = true;
        }else{
          _billable.checked = false;
        }

        _billableSAVED = _billable.checked;
        _prepaidSAVED = _prepaid.checked;

        _rate.localValue = _saverate;
        _total.localValue = (q.value("total"));

//check to see if there's a higher line number...if yes...set button text to Next and enable it
        var q = toolbox.executeQuery('select te.maxline(<? value("headid") ?>) '
            + 'as linenumber;',params);
        if (q.first())
        {
          _newlinenum = (q.value("linenumber") + 1);
          if (q.value("linenumber") > _linenum)
          {
            _next.text = qsTr("Next");
            _next.enabled = true;
          }else if (q.value("linenumber") == _linenum){
            _next.text = qsTr("New");
            _next.enabled = true;
          }
        }
        if (_linenum == 1)
        {
          _prev.enabled = false;
        }else{
          var q = toolbox.executeQuery('select te.minline(<? value("headid") ?>)'
               + ' as linenumber;',params);
          if (q.first())
          {
            if (q.value("linenumber") < _linenum)
            {
              _prev.enabled = true;
            }
          }
        }
      }
      else if (q.lastError().type != 0)
      {
        toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                         q.lastError().databaseText);
        return;
      } 
    }
    catch (e) { print("populate() exception @ " + e.lineNumber + ": " + e); }
  }


  if (mode == _viewMode)
  {
    _modified = false;
    _sheetLit.visible=true;
    _linenumberLit.visible = true;
    _weekending.enabled = false;
    _save.enabled = false;
    _next.enabled = false;

    try
    {

      var params = new Object();
      params.id = _itemid;
      params.headid = _headid;

      var q = toolbox.executeQuery("SELECT tehead_site as site, "
                               + "tehead_weekending as weekending, "
                               + "tehead_number as sheetnum, "
		        + "teitem_workdate as workdate, "
		        + "teitem_linenumber as line_number, "
		        + "teitem_item_id as itemid,teitem_rate as rate, "
                               + "teitem_qty as hours, teitem_emp_id as empid, "
		        + "teitem_po as po, teitem_prjtask_id as task,"
                               + "teitem_cust_id as custid, teitem_prj_id as project, "
                               + "teitem_type as type,teitem_prepaid as prepaid, "
                               + "teitem_billable as billable,teitem_notes as notes "
                               + "FROM te.tehead,te.teitem "
                               + " WHERE tehead_id = teitem_tehead_id and " 		
                               + ' teitem_id=<? value("id") ?>;',params);
      if (q.first())
      {
        _type = (q.value("type"));
        if (_type == "T") 
        {
          _radioTime.checked = true;
          timeswitch();
        }else{
          _radioExpense.checked = true;
          expenseswitch();
          if(q.value("billable")){
             _billable.checked = true;
          }
          if(q.value("prepaid")){
             _prepaid.checked = true;
          }
          _prepaid.enabled = false;
        }
        _radioTime.enabled = false;
        _radioExpense.enabled = false;
        _weekending.date = (q.value("weekending"));
        _weekending.enabled = false;
        _workdate.date = (q.value("workdate"));
        _workdate.enabled = false;
        _hours.localValue = (q.value("hours"));
        _savehours = q.value("hours");
        _hours.enabled = false;
        _hoursSAVED = (q.value("hours"));
        _rate.localValue = (q.value("rate"));
        _saverate = q.value("rate");
        _rate.enabled = false;
        _items.setId(q.value("itemid"));
        _items.enabled = false;
        _employees.setId(q.value("empid"));
        _employees.enabled = false;
        _clients.setId(q.value("custid"));
        _clients.enabled = false;
        _po.text = (q.value("po"));
        _po.enabled = false;
        _project.setId(q.value("project"));
        _saveproject = q.value("project");
        _project.enabled = false;
        _taskid = q.value("task");
        _savetask = q.value("task");
        gettask();
        _task.enabled = false;
        _sheet.text = (q.value("sheetnum"));
        _sheetnum = (q.value("sheetnum"));
        _linenumber.text = (q.value("line_number"));
        _linenum = (q.value("line_number"));
        _notes.setText(q.value("notes"));
        _notes.enabled = false;

        if (q.value("billable") == true)
        {
          _billable.checked = true;
        }else{
          _billable.checked = false;
        }
        _billable.enabled = false;
       
        var q = toolbox.executeQuery('select te.maxline(<? value("headid") ?>) '
             + 'as linenumber;',params);
        if (q.first())
        {
          if (q.value("linenumber") > _linenum)
          {
            _next.text = qsTr("Next");
            _next.enabled = true;
          }else if (q.value("linenumber") == _linenum){
            _next.text = qsTr("New");
            _next.enabled = true;
          }
        }

        if (_linenum == 1)
        {
          _prev.enabled = false;
        }else{
          var q = toolbox.executeQuery('select te.minline(<? value("headid") ?>)'
               + ' as linenumber;',params);
          if (q.first())
          {
            if (q.value("linenumber") < _linenum)
            {
              _prev.enabled = true;
            }
          }
        }
      }
      else if (q.lastError().type != 0)
      {
        toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                         q.lastError().databaseText);
        return;
      } 
    }
    catch (e) { print("populate() exception @ " + e.lineNumber + ": " + e); }
  }


  if (mode == _newMode)
  {
    try
    {
      if(_weekending.date > 0){
        _weekending.enabled = false;
      }

      //_project.enabled = false;
      _task.enabled = false;

      var params = new Object();
      params.prjid = _project.id();

      if (_headid > 0)
      {
        _sheetLit.visible=true;
        
        params.headid = _headid;
        params.id = _itemid;

        var q = toolbox.executeQuery("select tehead_number as sheet_number, "
                       + " tehead_id, tehead_weekending as weekending "
                       + " from te.tehead where "
		+ ' tehead_id = <? value("headid") ?>;',params);

        if (q.first())
        {
           _weekending.date = (q.value("weekending"));      
           if(_weekending.date > 0)
           {
             _weekending.enabled = false;
           }  
           _sheet.text = (q.value("sheet_number"));
           _sheetnum = (q.value("sheet_number"));
           _headid = (q.value("tehead_id"));
        }
        else if (q.lastError().type != 0)
        {
          toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                         q.lastError().databaseText);
          return;
        } 
      }

      if (_empid > 0)
      {
        _employees.setId(_empid);
        _employees.enabled = false;
      }

      //get rate for project
      var q = toolbox.executeQuery("SELECT teprj_rate as rate, "
                               + "teprj_cust_id as custid "
                               + "FROM te.teprj "
                               + ' WHERE teprj_prj_id = <? value("prjid") ?>;',params);
      if (q.first())
      {
        if (_rate.localValue == 0){
           _rate.localValue = (q.value("rate"));
        }
        _clients.setId(q.value("custid"));
      }
      else if (q.lastError().type != 0)
      {
        toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                         q.lastError().databaseText);
        return;
      } 
    }
    catch (e) { print("populate() exception @ " + e.lineNumber + ": " + e); }
  }

_first = false;

}

// add validation to save() to make sure that edited lines, or new lines for an existing sheet...keep the same weekending date...we could also put this in an onchange (if possible) on the weekending/startdate field


function sSave()
{
    var params = new Object();
    params.weekendingdate = _weekending.date;
    params.workdate = _workdate.date;
    params.employees = mywindow.findChild("_employees").id();

    params.hours = mywindow.findChild("_hours").localValue;
    params.rate = mywindow.findChild("_rate").localValue;
    params.total = mywindow.findChild("_total").localValue;
    params.clients = _clients.id();
    params.po = mywindow.findChild("_po").text;
    params.items = mywindow.findChild("_items").id();
    params.project = mywindow.findChild("_project").text;
    params.projid = mywindow.findChild("_project").id();
    params.task = mywindow.findChild("_task").text;
    params.taskid = mywindow.findChild("_task").id();
    params.sheet = _sheetnum;
    params.line = _linenum;
    params.site = _site;
    params.notes = _notes.plainText;

    if(_billable.checked){
      params.billable = true;   
    }else{
      params.billable = false;
    }

    if(_prepaid.checked){
      params.prepaid = true;   
    }else{
      params.prepaid = false;
    }

    if (_itemid > 0){
      params.itemid = _itemid;
    }

    if (_headid > 0){
      params.headid = _headid;
    }else{
      params.headid;
    }

    if (_radioTime.checked){
      params.type = "T";
    }else{
      params.type = "E";
    }

    if (params.clients > 0){
          //next action
    }else{
       if (_radioTime.checked){
         toolbox.messageBox("critical", mywindow, qsTr("Error"),
                         "Customer Required");
         _clients.setFocus();
         _error = true;
       return;
       }
    }
     
    if (params.weekendingdate == "Invalid Date"){
             toolbox.messageBox("critical", mywindow, qsTr("Error"),
                         "Sheet Date Required");
       _weekending.setFocus();
       _error = true;     
       return;
    }

    if (params.workdate == "Invalid Date"){
           toolbox.messageBox("critical", mywindow, qsTr("Error"),
                         "Work Date Required");
       _workdate.setFocus();
       _error = true;     
       return;
    }
    
    if (params.project == ""){
       	toolbox.messageBox("critical", mywindow, qsTr("Error"),
                       "Project Required");
       _project.setFocus();
       _error = true;
       return;
    }

    if (params.items == -1){
       	toolbox.messageBox("critical", mywindow, qsTr("Error"),
                       "Item Required");
       _items.setFocus();
       _error = true;
       return;
    }

    if (params.line == ""){
      params.line == 0;
    }

    if (params.items == -1){
       	toolbox.messageBox("critical", mywindow, qsTr("Error"),
                       "Item Required");
       _items.setFocus();
       _error = true;
       return;
    }

    if (params.task == ""){
       	toolbox.messageBox("critical", mywindow, qsTr("Error"),
                       "Task Required");
       _task.setFocus();
       _error = true;
       return;
    }

    //var q = toolbox.executeDbQuery("te","addsheet",params);
    var q = toolbox.executeQuery('select te.addsheet(<? value("weekendingdate") '
	+ ' ?>,<? value("workdate") ?>,<? value("items") ?>, '
    + ' <? value("employees") ' 
	+ ' ?>,<? value("po") ?>,<? value("clients") ?>, '
	+ ' <? value("hours") ?>,<? value("rate") ?>, '
	+ ' <? value("total") ?>, '
           + ' <? value("headid") ?>, '
	+ ' <? value("site") ?>,'
           + '<? value("projid") ?>, '
	+ '<? value("taskid") ?>, ' 
	+ '<? value("type") ?>,'
	+ ' <? value("line") ?>,'
           + ' <? value("billable") ?>,'
           + ' <? value("prepaid") ?>,'
           + ' <? value("notes") ?> );',params);

    _cancel.text = "Close";

    _prev.enabled = true;
    _linenumberLit.visible = true;
    _linenumber.enabled = true;
    if (_linenumber.text == ""){
      var q = toolbox.executeQuery('select ' 
           + 'te.maxline(te.getsheetid(<? value("sheet") ?>)) '
           + 'as linenumber;',params);
      if (q.first())
      {
        _linenumber.setText(q.value("linenumber"));
        _linenum = (q.value("linenumber"));
        params.line = _linenum;


        var q = toolbox.executeQuery("SELECT teitem_id as id "
                   + "from te.teitem,te.tehead "
                  + "WHERE (teitem_tehead_id = tehead_id) "
	       + 'AND (tehead_id = te.getsheetid(<? value("sheet") ?>)) '
	       + 'AND (teitem_linenumber = <? value("line") ?>) '
	       + " LIMIT 1;",params);

        if (q.first())
        {
          _itemid = q.value("id");
        }
      }
    }

}


function timeswitch()
{
  if (_radioTime.checked)
  {
    _qtyLabel.text = "Hours:";
    _billable.visible = true;
    _prepaid.visible = false;
  }
  sFillItems();
  getprice();
}


function expenseswitch()
{
  if (_radioExpense.checked)
  {
    _qtyLabel.text = "Qty:";
    _billable.visible = true;
    _prepaid.visible = true;
    _rate.localValue = 0;
  }
  sFillItems();
  getprice();
}

function billablecheck()
{
  if (_billableSAVED != _billable.checked)
  {
    if (_first == false){
      _modified = true;
    }
  }
}

function prepaidcheck()
{
  if (_prepaidSAVED != _prepaid.checked)
  {
    if (_first == false){
      _modified = true;
    }
  }
}


function projectChange()
{
  //enable and reset the task fields
  if(_project.currentText != " ")
  {
    if (_mode != _viewMode){
      _save.enabled = true; 
      _next.enabled = true;
      _task.enabled = true;
    }
    gettask();
    //getprice();
  }
}

function clientChange()
{
  //enable and reset the Project and task fields

  //if the price has been overridden...then get the pricing info
  if(_clients.currentText != " ")
  {
    if (_mode != _viewMode){
      _save.enabled = true;
      _next.enabled = true;
      _project.enabled = true;
    }
    //_task.enabled = true;
    //populateProjects();
    getprice();
  }
}


function notesChange()
{
  if (_first == false){
    _modified = true;
  }
}

function populateClients()
{
  var q = toolbox.executeQuery("SELECT 0 as cust_id, ' ' as cust_name FROM custinfo "
        + " UNION "
        + "SELECT cust_id,cust_name FROM custinfo;");
  if (q.first())
  {
    _clients.populate(q);        
  }
  else if (q.lastError().type != 0)
  {
    toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                       q.lastError().databaseText);
    return;
  } 
}


function setActualBudget()
{
  var parms = new Object;
  parms.prjid = _project.id();
  parms.taskid = _task.id();
 
  var q = toolbox.executeQuery("SELECT "
               + "formatqty(prjtask_hours_budget) as budget_hours,"
               + "formatqty(prjtask_hours_actual) as actual_hours,"
               + "formatmoney(prjtask_exp_budget) as budget_cost,"
               + "formatmoney(prjtask_exp_actual) as actual_cost "
               + "from prjtask "
               + "where prjtask_id = <? value('taskid') ?> ;",parms);
  if (q.first())
  {
     _budget.text = q.value("budget_hours");        
     _actual.text = q.value("actual_hours");    
     //_actual.setPrecision(mywindow.qtyVal());    
     _budgetCost.text = q.value("budget_cost");        
     _actualCost.text = q.value("actual_cost");        
     //_actualCost.setPrecision(decimalPlaces());
    
     if (_mode == _newMode)
     {
       //rollupActual();
     }
   }
   else if (q.lastError().type != 0)
   {
     toolbox.messageBox("critical", mywindow, qsTr("Database Error"),
                       q.lastError().databaseText);
     return;
   } 
}


function rollupActual()
{
  var parms = new Object;
  parms.taskid = _task.id();

  _totalCost = 0;
  _totalhrs = 0;    

  // get the task actuals then add the current
  var q = toolbox.executeQuery('select formatqty(sum(total_hours)) as total_hours,'
           + 'formatcost(sum(total_cost)) as total_cost from '
           + '(select sum(teitem_qty) as total_hours,'
           + 'sum(teitem_total) as total_cost from te.teitem '
           + 'where teitem_prjtask_id = <? value("taskid") ?> '
           + "and teitem_type = 'T' "
           + 'union '
           + 'select 0 as total_hours,'
           + 'sum(teitem_total) as total_cost from te.teitem '
           + 'where teitem_prjtask_id = <? value("taskid") ?> '
           + "and teitem_type = 'E') rollup;",parms);

  if (q.first())
  {
    //var _totalhrs = parseFloat(q.value("total_hours"));

    if(_radioTime.checked)
    {
      _actual.setText(q.value("total_hours"));
    }
    _actualCost.setText(q.value("total_cost"));
  } 
}


function sPrev()
{

  if (_modified)
  {

    if (toolbox.messageBox("question", mywindow,
                       qsTr("Unsaved Changed"),
                       qsTr("<p>You have made some changes which "
		+ "have not yet been saved!\n" 
                       + "Would you like to save them now?"),
                        QMessageBox.Save, QMessageBox.Cancel) != QMessageBox.Save)
    return;

    if (_linenumber.text == null && _newlinenum > 0){
      _linenum = _newlinenum;
      _linenumber.setText(_linenum);
    }
    sSave();
  }

  var params = new Object;
  params.id = _itemid;

  _nav = "prev";

  var q = toolbox.executeQuery("SELECT a.teitem_id as id "
                               + "from te.teitem AS a, te.teitem AS b "
                               + " WHERE ((a.teitem_tehead_id = b.teitem_tehead_id) "
		        + "   AND (a.teitem_linenumber < b.teitem_linenumber)"
                               + '   AND (b.teitem_id=<? value("id") ?>)) '
		        + " ORDER BY a.teitem_linenumber DESC"
		        + " LIMIT 1;",params);

  if (q.first())
  {
    _first = true;
    _modified = false;

    _itemid = q.value("id");
    if (_mode == _newMode)
    {
      _next.text = qsTr("Next");
      populate(0);
    }
    else if (_mode == _viewMode)
    {
      populate(2);
    }
    else if (_mode == _editMode)
    {
      populate(1);
    }
    _next.enabled = true;
  }
}


function sSaveClose()
{
  sSave();
  if (_error == false)
    mywindow.close();

  _error == false;

}


function sNext()
{
  var params = new Object;
  params.id = _itemid;

  if (_modified)
  {

    if (toolbox.messageBox("question", mywindow,
                       qsTr("Unsaved Changed"),
                       qsTr("<p>You have made some changes which "
		+ "have not yet been saved!\n" 
                       + "Would you like to save them now?"),
                        QMessageBox.Save, QMessageBox.Cancel) != QMessageBox.Save)
    return;

    sSave();
  }

  if (_next.text == qsTr("New"))
  {
    sNew();
    return;
  }

  _nav = "next";

  var q = toolbox.executeQuery("SELECT a.teitem_id as id "
                               + "from te.teitem AS a, te.teitem AS b "
                               + " WHERE ((a.teitem_tehead_id = b.teitem_tehead_id) "
		        + "   AND (a.teitem_linenumber > b.teitem_linenumber)"
                               + '   AND (b.teitem_id=<? value("id") ?>)) '
		        + " ORDER BY a.teitem_linenumber "
		        + " LIMIT 1;",params);

  if (q.first())
  {
    _first = true;
    _modified = false;

    _itemid = q.value("id");
    if (_mode == _newMode)
    {
      _next.text = qsTr("New");
      populate(0);
    }
    else if (_mode == _viewMode)
    {
      populate(2);
    }
    else if (_mode == _editMode)
    {
      populate(1);
    }
    _prev.enabled = true;
  }else{
    // reset fields and setup the screens to create a new line
    sNew();

  }
}

function sNew()
{
  _prev.enabled = true;
  
  _next.enabled = false;
  _radioTime.enabled = true;
  _radioExpense.enabled = true;
  _workdate.date = 0;
  _workdate.enabled = true;
  _workdate.setFocus();
  _hours.localValue = "";
  _hours.enabled = true;
  _rate.localValue = 0;
  _rate.enabled = true;
  _items.enabled = true;
  _employees.enabled = false;
  _clients.enabled = true;
  _po.text = "";
  _po.enabled = true;
  _project.enabled = true;
  _task.enabled = true;
  _linenumber.text = null;
  _linenum = null;
  _notes.setText("");
  _notes.enabled = true;

  getprice();

}


function sSetSecurity()
{

  if (privileges.check("CanViewRates")){
    _rate.visible = true;
    _total.visible = true;
    _budgetactual.visible = true;
    _rateLit.visible = true;
    _totalLit.visible = true;
  }else{
    _rate.visible = false;
    _total.visible = false;
    _budgetactual.visible = false;
    _rateLit.visible = false;
    _totalLit.visible = false;
  }
}



//populateClients();
//fillitems();
sFillItems();
getprice();
sSetSecurity();