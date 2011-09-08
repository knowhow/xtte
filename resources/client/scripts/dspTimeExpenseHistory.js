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
xtte.dspTimeExpenseHistory = new Object;

var _close       	= mywindow.findChild("_close");
var _print       	= mywindow.findChild("_print");
var _query      	= mywindow.findChild("_query");
var _list     	= mywindow.findChild("_list");
var _parameterWidget 	= mywindow.findChild("_parameterWidget");

_list.addColumn(qsTr("Sheet #"),		XTreeWidget.orderColumn,Qt.AlignLeft,    true, "f_sheet_number");
_list.addColumn(qsTr("Employee #"),	XTreeWidget.orderColumn,Qt.AlignLeft,    true, "emp_code");
_list.addColumn(qsTr("Work Date"),		XTreeWidget.dateColumn, Qt.AlignLeft,    true, "teitem_workdate");
_list.addColumn(qsTr("Type"),		XTreeWidget.dateColumn, Qt.AlignLeft,    true, "teitem_type");
_list.addColumn(qsTr("Status"),		XTreeWidget.dateColumn, Qt.AlignLeft,    true, "tehead_status");
_list.addColumn(qsTr("Project#"),		XTreeWidget.orderColumn,Qt.AlignLeft,    true, "prj_number");
_list.addColumn(qsTr("Project Name"),	-1,		 Qt.AlignLeft,    false,"prj_name");
_list.addColumn(qsTr("Task#"),		XTreeWidget.orderColumn,Qt.AlignLeft,    false, "prjtask_number");
_list.addColumn(qsTr("Task Name"),		-1,		 Qt.AlignLeft,    false,"prjtask_name");
_list.addColumn(qsTr("Cust.#"),		XTreeWidget.orderColumn,Qt.AlignLeft,    false, "cust_number");
_list.addColumn(qsTr("Cust. Name"),	-1,		 Qt.AlignLeft,    false, "cust_name");
_list.addColumn(qsTr("PO"),		XTreeWidget.orderColumn,Qt.AlignLeft,    false, "teitem_po");
_list.addColumn(qsTr("Item"),		XTreeWidget.itemColumn, Qt.AlignLeft,    true, "item_number");
_list.addColumn(qsTr("Description"),	-1,  		 Qt.AlignLeft,    true, "item_descrip1");
_list.addColumn(qsTr("Qty"), 		XTreeWidget.qtyColumn,  Qt.AlignRight,   true, "teitem_qty");
_list.addColumn(qsTr("Billable"), 		XTreeWidget.qtyColumn,  Qt.AlignRight,   false, "teitem_billable");
privileges.check("CanViewRates")
  _list.addColumn(qsTr("Ext."), 		XTreeWidget.moneyColumn,  Qt.AlignRight,   true, "teitem_total");

var teSql = "SELECT 1,'" + qsTr("Time") + "','T' "
          + "UNION "
          + "SELECT 2,'" + qsTr("Expense") +  "','E';";

var empGrpSql = "SELECT empgrp_id, empgrp_name, empgrp_name "
              + "FROM empgrp "
              + "ORDER BY empgrp_name;";

_parameterWidget.append(qsTr("Start Date"), "startDate", ParameterWidget.Date, mainwindow.dbDate());
_parameterWidget.append(qsTr("End Date"), "endDate",   ParameterWidget.Date, mainwindow.dbDate());
_parameterWidget.appendComboBox(qsTr("Type"), "typeEnum", teSql);
_parameterWidget.append(qsTr("Employee"), "emp_id",   ParameterWidget.Employee);
_parameterWidget.appendComboBox(qsTr("Employee Group"), "empgrp_id", empGrpSql);
_parameterWidget.append(qsTr("Project"), "prj_id",   ParameterWidget.Project);
_parameterWidget.append(qsTr("Customer"), "cust_id",   ParameterWidget.Customer);
_parameterWidget.appendComboBox(qsTr("Customer Type"), "custtype_id", XComboBox.CustomerTypes - 0);
_parameterWidget.append(qsTr("Customer Type Pattern"), "custtype_pattern", ParameterWidget.Text);
_parameterWidget.appendComboBox(qsTr("Customer Group"), "custgrp_id", XComboBox.CustomerGroups - 0);
_parameterWidget.append(qsTr("Item"), "item_id",   ParameterWidget.Item);
_parameterWidget.appendComboBox(qsTr("Item Group"), "itemgrp_id", XComboBox.ItemGroups - 0);
_parameterWidget.appendComboBox(qsTr("Class Code"), "classcode_id", XComboBox.ClassCodes - 0);
_parameterWidget.append(qsTr("Class Code Pattern"), "classcode_pattern", ParameterWidget.Text);

_parameterWidget.applyDefaultFilterSet();

xtte.dspTimeExpenseHistory.populateMenu = function(pMenu, pItem, pCol)
{
  if(pMenu == null)
    pMenu = _booitem.findChild("_menu");

  if(pMenu != null)
  {
    var editAct = toolbox.menuAddAction(pMenu, qsTr("Edit..."), true);
    editAct.triggered.connect(xtte.dspTimeExpenseHistory.editItem);
    editAct.enabled = (privileges.check("MaintainTimeExpense") &&
                       pItem.rawValue("tehead_status") == 'O');

    var viewAct = toolbox.menuAddAction(pMenu, qsTr("View..."), true);
    viewAct.triggered.connect(xtte.dspTimeExpenseHistory.viewItem);
  }
}

xtte.dspTimeExpenseHistory.getParams = function()
{
  var params = _parameterWidget.parameters();
  params.open = qsTr("Open");
  params.approved = qsTr("Approved");
  params.closed = qsTr("Closed");
  params.time = qsTr("Time");
  params.expense = qsTr("Expense");

  if("typeEnum" in params)
  {
    if (params.typeEnum == 1)
      params.timeOnly = true;
    else
      params.expenseOnly = true;
  }

  return params;
}

xtte.dspTimeExpenseHistory.print = function()
{
  var params = xtte.dspTimeExpenseHistory.getParams();
  params.includeFormatted = true;

  toolbox.printReport("TimeExpenseHistory", params);
}

xtte.dspTimeExpenseHistory.fillList = function()
{
  var qry = toolbox.executeDbQuery("timeexpensehistory", "detail",   xtte.dspTimeExpenseHistory.getParams());
  _list.populate(qry)
  if(!qry.first())
    xtte.errorCheck(qry);
}

xtte.dspTimeExpenseHistory.editItem = function()
{
  xtte.dspTimeExpenseHistory.openItem(xtte.editMode);
}


xtte.dspTimeExpenseHistory.viewItem = function()
{
  xtte.dspTimeExpenseHistory.openItem(xtte.viewMode);
}


xtte.dspTimeExpenseHistory.openItem = function(mode)
{  
  var params   = new Object;
  params.mode = mode;
  params.teitem_id = _list.id();

  var wnd = toolbox.openWindow("timeExpenseSheetItem", mywindow);
  toolbox.lastWindow().set(params);
  if (wnd.exec() > 0)
    xtte.timeExpenseSheet.fillList();
}

// Connections
_print.clicked.connect(xtte.dspTimeExpenseHistory.print);
_query.clicked.connect(xtte.dspTimeExpenseHistory.fillList);
_list["populateMenu(QMenu *, XTreeWidgetItem *, int)"].connect(xtte.dspTimeExpenseHistory.populateMenu)
_close.clicked.connect(mywindow, "close");

