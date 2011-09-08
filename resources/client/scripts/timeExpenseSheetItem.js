/*
 * This file is part of the xtte package for xTuple ERP: PostBooks Edition, a free and
 * open source Enterprise Resource Planning software suite,
 * Copyright (c) 1999-2011 by OpenMFG LLC, d/b/a xTuple.
 * It is licensed to you under the Common Public Attribution License
 * version 1.0, the full text of which (including xTuple-specific Exhibits)
 * is available at www.xtuple.com/CPAL.  By using this software, you agree
 * to be bound by its terms.
 */

include("xtte");

// Define local variables
xtte.timeExpenseSheetItem = new Object;

var _hours              = mywindow.findChild("_hours");
var _total              = mywindow.findChild("_total");	
var _totalLit           = mywindow.findChild("_totalLit");	
var _rate               = mywindow.findChild("_rate");
var _rateLit            = mywindow.findChild("_rateLit");
var _clients            = mywindow.findChild("_clients");
var _employee           = mywindow.findChild("_employee");
var _items              = mywindow.findChild("_items");
var _po		 = mywindow.findChild("_po");
var _project            = mywindow.findChild("_project");
var _task               = mywindow.findChild("_task");
var _linenumber         = mywindow.findChild("_linenumber");
var _sheet              = mywindow.findChild("_sheet");
var _buttonBox          = mywindow.findChild("_buttonBox");
var _weekending         = mywindow.findChild("_weekending");
var _workdate           = mywindow.findChild("_workdate");
var _type               = mywindow.findChild("_type");
var _qtyLabel           = mywindow.findChild("_qtyLabel");
var _billable           = mywindow.findChild("_billable");
var _prepaid            = mywindow.findChild("_prepaid");
var _actual             = mywindow.findChild("_actual");
var _budget             = mywindow.findChild("_budget");
var _actualCost         = mywindow.findChild("_actualCost");
var _budgetCost         = mywindow.findChild("_budgetCost");
var _notes              = mywindow.findChild("_notes");
var _sheetLit 	 = mywindow.findChild("_sheetLit");
var _dayHrs		 = mywindow.findChild("_dayHrs");
var _weekHrs            = mywindow.findChild("_weekHrs");

var _cancel = _buttonBox.button(QDialogButtonBox.Cancel);
var _prev = _buttonBox.addButton(qsTr("Prev"), QDialogButtonBox.ActionRole);
var _next = _buttonBox.addButton(qsTr("Next"), QDialogButtonBox.ActionRole);

var _sheetnum;
var _linenum;
var _teitemid = -1;
var _headid = -1;
var _taskid = -1;
var _site;
var _mode = xtte.newMode;
var _modified = false;
var _populating = false;
var _last = true;

set = function(input)
{
  if("emp_id" in input)
    _employee.setId(input.emp_id);
  
  if("weekending" in input)
    _weekending.date = input.weekending;

  if ("tehead_id" in input)
    _headid = input.tehead_id;

  if ("site" in input)
    _site = input.site;

  if ("teitem_id" in input)
    _teitemid = input.teitem_id;

  if ("mode" in input)
  {
    _mode = input.mode;

    if (input.mode == xtte.newMode)
      xtte.timeExpenseSheetItem.clear();
    else 
    { 
      if (input.mode == xtte.viewMode)
      {
        var shortcut = _buttonBox.button(QDialogButtonBox.Cancel).shortcut;
        _buttonBox.removeButton(_buttonBox.button(QDialogButtonBox.Cancel));
        _buttonBox.removeButton(_buttonBox.button(QDialogButtonBox.Save));
        _buttonBox.addButton(QDialogButtonBox.Close);
        _buttonBox.button(QDialogButtonBox.Close).shortcut = shortcut;
        _weekending.enabled = false;
        _next.enabled = false;
        _prepaid.enabled = false;
        _type.enabled = false;
        _weekending.enabled = false;
        _workdate.enabled = false;
        _hours.enabled = false;
        _rate.enabled = false;
        _items.enabled = false;
        _employee.enabled = false;
        _clients.enabled = false;
        _po.enabled = false;
        _project.enabled = false;
        _task.enabled = false;
        _notes.enabled = false;
        _billable.enabled = false; 
      }
      else if (input.mode == xtte.editMode)
      {
        _project.enabled = false;
        _task.enabled = false;
      }

      xtte.timeExpenseSheetItem.populate();
    }
  }
  
  return mainwindow.NoError;
}

xtte.timeExpenseSheetItem.extension = function()
{
  _total.localValue = (_hours.toDouble() * _rate.localValue);
  if (_type.code == 'T')
    xtte.timeExpenseSheetItem.empTotals();
  xtte.timeExpenseSheetItem.modified();
}

xtte.timeExpenseSheetItem.gettask = function()
{
  if (_project.isValid())
  {
    var params = new Object();
    params.prj_id = _project.id();
    params.name = qsTr("Default");
    if (_mode == xtte.newMode)
      params.active = true;
    if (_workdate.isValid())
      params.startDate = _workdate.date;

    var qry = toolbox.executeDbQuery("timeexpensesheetitem", "gettask", params);
    if(!xtte.errorCheck(qry))
      return;

    _task.populate(qry);

    if(_taskid > 0)
      _task.setId(_taskid);

    if (!qry.first())
    {
      var msg = qsTr("No task found. A default task will be added");
      toolbox.messageBox("critical", mywindow, qsTr("task"), msg);
      toolbox.executeDbQuery("timeexpensesheetitem","instask",params);

      qry = toolbox.executeDbQuery("timeexpensesheetitem", "gettask", params);
      _task.populate(qry);
    }

    xtte.timeExpenseSheetItem.getPrice();
    xtte.timeExpenseSheetItem.budgTotals();
    xtte.timeExpenseSheetItem.actTotals();
  }
}

xtte.timeExpenseSheetItem.modified = function()
{
  if (_populating)
    return;

  _modified = true;
}

xtte.timeExpenseSheetItem.getPrice = function()
{
  if (_populating || !_clients.isValid())
    return;
  if (_type.code == 'T' && !_billable.checked)
  {
    _rate.localValue = 0;
    _rate.enabled = false;
    return;
  }
  else if (_mode == xtte.editMode)
  {
    if (QMessageBox.question(mywindow,
                       qsTr("Upate Rate?"),
                       qsTr("<p>Would you like to update the existing rate?"),
                        QMessageBox.Ok, QMessageBox.Cancel) == QMessageBox.Cancel)
      return;
  }

  _rate.enabled = true;

  var params = new Object();
  params.item_id = _items.id();
  params.task_id = _task.id();
  params.prj_id = _project.id();
  params.cust_id = _clients.id();
  params.emp_id = _employee.id();
  if (_type.code == "T")
    params.time = true;
  
  var qry = toolbox.executeDbQuery("timeexpensesheetitem", "getterate", params);
  
  if (qry.first())
    _rate.setBaseValue(qry.value("rate"));
  else
    xtte.errorCheck(qry);

  xtte.timeExpenseSheetItem.modified();
}

xtte.timeExpenseSheetItem.populate = function()
{
  _modified = false;
 
  // Edit or View mode
  var params = new Object();
  params.teitem_id = _teitemid;

  qry = toolbox.executeDbQuery("timeexpensesheetitem","detail", params);
  if (qry.first())
  {
    if (_mode == xtte.newMode)
      _mode = xtte.editMode;
    _populating = true; 

    _headid = qry.value("teitem_tehead_id");
    _sheet.text = (qry.value("tehead_number"));
    _sheetnum = (qry.value("tehead_number"));
    _employee.setId(qry.value("tehead_emp_id"));
    _weekending.date = (qry.value("tehead_weekending"));

    _linenumber.text = (qry.value("teitem_linenumber"));
    _linenum = (qry.value("teitem_linenumber"));
    _workdate.date = (qry.value("teitem_workdate"));
    _type.code = qry.value("teitem_type");
    _clients.setId(qry.value("teitem_cust_id"));
    _po.text = (qry.value("teitem_po"));
    _items.setId(qry.value("teitem_item_id"));
    _hours.text = (qry.value("teitem_qty"));
    _rate.setId(qry.value("teitem_curr_id") - 0);
    _rate.localValue = (qry.value("teitem_rate"));
    _total.localValue = (qry.value("teitem_total"));
    _project.setId(qry.value("prj_id"));
    _task.setId(qry.value("teitem_prjtask_id"));
    _billable.checked = qry.value("teitem_billable");
    _prepaid.checked = qry.value("teitem_prepaid")
    _notes.plainText = qry.value("teitem_notes");

    _last = qry.value("ismax");
    if (_last && _mode == xtte.editMode)
      _next.text = qsTr("New");
    else
      _next.text = qsTr("Next");

    _next.enabled = !(_last && _mode == xtte.viewMode);
    _prev.enabled = (_linenum > 1);

    _populating = false;
    _modified = false;
  }
  else if (!xtte.errorCheck)
    return;

  xtte.timeExpenseSheetItem.empTotals();
}

xtte.timeExpenseSheetItem.accepted = function()
{
  if (xtte.timeExpenseSheetItem.save())
  {
    if (_mode == xtte.newMode)
      xtte.timeExpenseSheetItem.clear();
    else
      mywindow.close();
  }
}

xtte.timeExpenseSheetItem.save = function()
{
  try
  {
    if (!_workdate.isValid())
      throw new Error(qsTr("Work Date Required"));
    
    if (!_project.isValid())
      throw new Error(qsTr("Project Required"));
 
    if (!_items.isValid())
      throw new Error(qsTr("Item Required"));

    if (_task.id == -1)
      throw new Error(qsTr("Task Required"));

    if (_hours.toDouble < 0 && _billable.checked)
      throw new Error(qsTr("Billing of negative amounts is not supported"));
  }
  catch (e)
  {
    QMessageBox.critical(mywindow, qsTr("Processing Error"), e.message);
    return false;
  }

  if (_hours.toDouble() <= 0 && _type.code == 'E' && !_prepaid.checked)
  {
    var msg = qsTr("The system only supports vouchering positive expense quantities.  "
            +      "Do you want to save anyway?")
    if (QMessageBox.question( mywindow, mywindow.windowTitle, msg, 
        QMessageBox.Yes | QMessageBox.Escape, QMessageBox.No | QMessageBox.Default) == QMessageBox.No)
      return false;
  }


  var params = new Object();
  params.teitem_tehead_id      = _headid;
  params.teitem_linenumber     = _linenum;
  params.teitem_type 	        = _type.code;
  params.teitem_workdate       = _workdate.date;
  params.teitem_cust_id        = _clients.id();
  params.teitem_po             = _po.text;
  params.teitem_item_id        = _items.id();
  params.teitem_qty            = _hours.toDouble();
  params.teitem_rate           = _rate.localValue;
  params.teitem_total          = _total.localValue;
  params.teitem_prjtask_id     = _task.id();
  params.teitem_billable       = _billable.checked;
  params.teitem_prepaid        = _prepaid.checked;
  params.teitem_notes          = _notes.plainText;
  params.teitem_id             = _teitemid;
  params.teitem_curr_id        = _rate.id();

  var query = "updteitem";
  if (_teitemid < 0)
    query = "insteitem";

  var q = toolbox.executeDbQuery("timeexpensesheetitem", query, params);
  if (q.first())
    _teitemid = q.value("teitem_id");
  else if (!xtte.errorCheck(q))
    return;

  _prev.enabled = true;

  return true;
}


xtte.timeExpenseSheetItem.typeChanged = function()
{
  if (_type.code == "T")
  {
    _qtyLabel.text = qsTr("Hours:");
    _rateLit.text = qsTr("Rate:");
    _rate.enabled = _clients.isValid();
    _billable.visible = true;
    _prepaid.visible = false;
    _prepaid.checked = false;
  } 
  else
  {
    _qtyLabel.text = qsTr("Qty:");
    _rateLit.text = qsTr("Unit Cost:");
    _billable.visible = true;
    _prepaid.visible = true;
    _rate.enabled = true;
    _rate.localValue = 0;
  }

  xtte.timeExpenseSheetItem.getPrice();
  xtte.timeExpenseSheetItem.empTotals();
  xtte.timeExpenseSheetItem.modified();
}

xtte.timeExpenseSheetItem.customerChanged = function()
{
  _billable.enabled = _clients.isValid();
  _rate.enabled = (_clients.isValid() || _type.code == 'E');

  if (_populating)
    return;

  if (!_clients.isValid())
  {
    _po.clear();
    _rate.localValue = 0;
    _billable.checked = false;
  }

  var params = new Object;
  params.cust_id = _clients.id();

  q = toolbox.executeDbQuery("timeexpensesheetitem", "getcustinfo", params);
  if (q.first())
    _rate.setId(q.value("cust_curr_id") - 0);
  else if (!xtte.errorCheck(q))
    return;

  xtte.timeExpenseSheetItem.getPrice();
}

xtte.timeExpenseSheetItem.projectChanged = function()
{
  //enable and reset the task fields
  _task.enabled = (_project.isValid() && _mode == xtte.newMode);

  xtte.timeExpenseSheetItem.gettask();
  xtte.timeExpenseSheetItem.modified();
  xtte.timeExpenseSheetItem.getPrice();
}


xtte.timeExpenseSheetItem.taskChanged = function()
{  
  var custid = -1;
  var itemid = -1;
  var params = new Object;
  params.prjtask_id = _task.id();

  q = toolbox.executeDbQuery("timeexpensesheetitem", "taskdefaults", params);
  if (q.first())
  {
    custid = q.value("cust_id");
    itemid = q.value("item_id")
  }
  else if (!xtte.errorCheck(q))
    return;

  if (_populating)
  {
    // Disable if customer matches default, otherwise default must have changed
    // so allow for editing so user can decide what to do
    _clients.enabled = !(_clients.isValid() && _clients.id() == custid)
    _items.enabled = !(_items.isValid() && _items.id() == itemid)
  }
  else
  {
    if (custid > 0)
    {
      _clients.setId(custid);
      _clients.enabled = false;
    }
    else
      _clients.enabled = true;

    if (itemid > 0)
    {
      _items.setId(itemid);
      _items.enabled = false;
    }
    else
      _items.setId(-1);
      _items.enabled = true;
  }

  xtte.timeExpenseSheetItem.getPrice();
  xtte.timeExpenseSheetItem.budgTotals();
  xtte.timeExpenseSheetItem.actTotals();
  xtte.timeExpenseSheetItem.modified();
}

xtte.timeExpenseSheetItem.budgTotals = function()
{
  var params = new Object;
  params.prj_id = _project.id();
  params.task_id = _task.id();
 
  var q = toolbox.executeDbQuery("timeexpensesheetitem", "taskbudg",params);
  if (q.first())
  {
    _budget.text = q.value("budget_hours");        
    _actual.text = q.value("actual_hours");       
    _budgetCost.text = q.value("budget_cost");        
    _actualCost.text = q.value("actual_cost");        
    
  }
  else 
    xtte.errorCheck(q);
}


xtte.timeExpenseSheetItem.actTotals = function()
{
  var params = new Object;
  params.task_id = _task.id();
  params.teitem_id = _teitemid;

  var expense = 0;
  var hours = 0;  

  // get the task actuals then add the current
  var q = toolbox.executeDbQuery("timeexpensesheetitem","taskrollup",params);

  if (q.first())
  {
      _actual.text = q.value("total_hours");
      _actualCost.text = q.value("total_expense");
  } 
  else
    xtte.errorCheck(q);
}

xtte.timeExpenseSheetItem.empTotals = function()
{
  if (_populating)
    return;

  var params = new Object;
  params.teitem_id = _teitemid;
  params.tehead_id = _headid;
  params.emp_id = _employee.id();
  params.workDate = _workdate.date;
  if (_type.code == 'T')
    params.hours = _hours.toDouble() - 0;

  var q = toolbox.executeDbQuery("timeexpensesheetitem", "emptotals", params);

  if (q.first())
  {
    _dayHrs.setText(q.value("day_hours"));
    _weekHrs.setText(q.value("sheet_hours"));
  } 
  else
    xtte.errorCheck(q);
}

xtte.timeExpenseSheetItem.prev = function()
{
  if (_modified)
  {
    if (QMessageBox.question(mywindow,
                       qsTr("Unsaved Changed"),
                       qsTr("<p>You have made some changes "
                       + "which have not yet been saved!\n" 
                       + "Would you like to save them now?"),
                        QMessageBox.Save, QMessageBox.No) == QMessageBox.Save)
    {
      if (!xtte.timeExpenseSheetItem.save())
        return;
    }
  }

  var params = new Object;
  if (_teitemid > 0)
    params.teitem_id = _teitemid;
  else
    params.tehead_id = _headid;

  var q = toolbox.executeDbQuery("timeexpensesheetitem", "teitemprev", params);

  if (q.first())
  {
    _teitemid = q.value("teitem_id");
    _modified = false;

    if (_mode == xtte.newMode)
      _mode = xtte.editMode;

    _next.enabled = true;
    xtte.timeExpenseSheetItem.populate();
  }
  else
    xtte.errorCheck(q);
}


xtte.timeExpenseSheetItem.next = function()
{
  if (_modified)
  {

    if (toolbox.messageBox("question", mywindow,
                       qsTr("Unsaved Changed"),
                       qsTr("<p>You have made some changes "
                       + "which have not yet been saved!\n" 
                       + "Would you like to save them now?"),
                        QMessageBox.Save, QMessageBox.Cancel) != QMessageBox.Save)
      return;

    if (!xtte.timeExpenseSheetItem.save())
      return;
  }

  if (_last)
    xtte.timeExpenseSheetItem.clear();
  else
  {
    var params = new Object;
    params.teitem_id = _teitemid;
    var q = toolbox.executeDbQuery("timeexpensesheetitem","teitemnext",params);

    if (q.first())
    {
      _modified = false;
      _teitemid = q.value("teitem_id");
      _prev.enabled = true;
      xtte.timeExpenseSheetItem.populate();
    }
    else if (xtte.errorCheck(q))
      xtte.timeExpenseSheetItem.clear();
  }
}

xtte.timeExpenseSheetItem.clear = function()
{
  var params = new Object();
  params.tehead_id = _headid;

  var q = toolbox.executeDbQuery("timeexpensesheet","header",params);

  if (q.first())
  {
    _weekending.date = (q.value("tehead_weekending"));      
    _sheet.text = (q.value("tehead_number"));
    _sheetnum = (q.value("tehead_number"));
    _employee.setId(q.value("tehead_emp_id"));
  }
  else if (!xtte.errorCheck(q))
    return;

  q = toolbox.executeDbQuery("timeexpensesheetitem", "nextlinenum", params);
  if (q.first())
  {
    _linenumber.setText(q.value("linenumber"));
    _linenum = (q.value("linenumber"));
  } 
  else 
    xtte.errorCheck(q);

  _mode = xtte.newMode;
  _teitemid = -1;
  _prev.enabled = true;
  _type.enabled = true;
  _workdate.clear();
  _workdate.enabled = true;
  _workdate.setFocus();
  _hours.text = "0.0";
  _hours.enabled = true;
  _rate.localValue = 0;
  _items.enabled = true;
  _items.setId(-1);
  _employee.enabled = false;
  _clients.enabled = true;
  _po.clear();
  _po.enabled = true;
  _project.enabled = true;
  _task.enabled = true;
  _notes.clear();
  _notes.enabled = true;
  _next.text = qsTr("New");
  _next.enabled = false;

  xtte.timeExpenseSheetItem.getPrice();

  _modified = false;
}


xtte.timeExpenseSheetItem.setSecurity = function()
{
  if (privileges.check("CanViewRates"))
  {
    _rate.visible = true;
    _total.visible = true;
    _rateLit.visible = true;
    _totalLit.visible = true;
  }
  else
  {
    _rate.visible = false;
    _total.visible = false;
    _rateLit.visible = false;
    _totalLit.visible = false;
  }
}

// Initialize default states
_hours.setValidator(mainwindow.transQtyVal());

_prev.enabled = false;
_next.enabled = false;
_task.enabled = false;
_weekending.enabled = false;
_linenumber.enabled = true;
_employee.enabled = false;
_total.enabled = false;
_total.readonly = true;
_rate.enabled = false;
_billable.visible = true;
_billable.enabled = false;
_prepaid.visible = false;
_next.enabled = false;

_type.append(1, qsTr("Time"), "T");
_type.append(2, qsTr("Expense"), "E");

_items.setQuery(xtte.itemSql);

_project.setAllowedStatuses(0x02); // In process

// Define connections
_buttonBox.accepted.connect(xtte.timeExpenseSheetItem.accepted);
_buttonBox.rejected.connect(mydialog, "reject");
_prev.clicked.connect(xtte.timeExpenseSheetItem.prev);
_next.clicked.connect(xtte.timeExpenseSheetItem.next);

_task.newID.connect(xtte.timeExpenseSheetItem.taskChanged);
_rate.valueChanged.connect(xtte.timeExpenseSheetItem.extension);
_workdate.newDate.connect(xtte.timeExpenseSheetItem.empTotals);
_hours.textChanged.connect(xtte.timeExpenseSheetItem.extension);
_hours.editingFinished.connect(xtte.timeExpenseSheetItem.actTotals);
_rate.lostFocus.connect(xtte.timeExpenseSheetItem.actTotals);
_type.newID.connect(xtte.timeExpenseSheetItem.typeChanged);
_items["newId(int)"].connect(xtte.timeExpenseSheetItem.getPrice);
_clients["newId(int)"].connect(xtte.timeExpenseSheetItem.customerChanged);
_project["newId(int)"].connect(xtte.timeExpenseSheetItem.projectChanged);
_employee.newId.connect(xtte.timeExpenseSheetItem.modified);
_po.textChanged.connect(xtte.timeExpenseSheetItem.modified);
_workdate.newDate.connect(xtte.timeExpenseSheetItem.modified);
_billable.toggled.connect(xtte.timeExpenseSheetItem.getPrice);
_prepaid.toggled.connect(xtte.timeExpenseSheetItem.modified);
_notes.textChanged.connect(xtte.timeExpenseSheetItem.modified);

xtte.timeExpenseSheetItem.getPrice();
xtte.timeExpenseSheetItem.setSecurity();
