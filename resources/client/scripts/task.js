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
xtte.task = new Object;

var _tab = mywindow.findChild("_tab"); 
var _tebilling = toolbox.loadUi("tebilling", mywindow);
toolbox.tabInsertTab(_tab, 2, _tebilling, qsTr("Billing"));
_tab.setEnabled(2, privileges.check("CanViewRates"));

var _number = mywindow.findChild("_number");
var _actualHours = mywindow.findChild("_actualHours");
var _actualExp = mywindow.findChild("_actualExp");
var _billingGroup = _tebilling.findChild("_billingGroup");
var _itemGroup = _tebilling.findChild("_itemGroup");
var _cust = _tebilling.findChild("_cust");
var _rate = _tebilling.findChild("_rate");
var _item = _tebilling.findChild("_item");
var _useItem = _tebilling.findChild("_useItem");
var _teprjtaskid = -1; 
var _prjtaskid = -1;

set = function(input)
{
  if("prjtask_id" in input)
  {
    _prjtaskid = input.prjtask_id;
    xtte.task.populate();
  }

  if("cust_id" in input)
  {
    _cust.setId(input.cust_id);
    _cust.enabled = false;
  }

  if("mode" in input)
  {
    if (input.mode == "view")
    {
      _cust.enabled = false;
      _billingGroup.enabled = false;
      _itemGroup.enabled = false;
    }
  }

  return mainwindow.NoError;
}

xtte.task.save = function(prjtaskId)
{
  if (prjtaskId <= 0)
    return;

  var params = new Object();
  params.teprjtask_id	= _teprjtaskid;
  params.prjtask_id	= prjtaskId;
  if (_cust.isValid())
    params.cust_id  	= _cust.id();
  if (_billingGroup.checked)
  {
    params.rate	= _rate.localValue;
    params.curr_id	= _rate.id();
  }
  if (_useItem.checked && _item.isValid())
    params.item_id	= _item.id()

  var query = "updteprjtask";
  if (_teprjtaskid == -1)
    query = "insteprjtask";

  var q = toolbox.executeDbQuery("task", query, params);
  xtte.errorCheck(q);
}

xtte.task.populate = function()
{
  var params = new Object();
  params.prjtask_id = _prjtaskid;    

  var q = toolbox.executeDbQuery("task", "selteprjtask", params);

  if (q.first())
  {
    _teprjtaskid = q.value("teprjtask_id");

    if (!_cust.isValid())
      _cust.setId(q.value("cust_id"));

    if (q.value("curr_id") == -1)
      _billingGroup.checked = false;
    else
    {
      _billingGroup.checked = true;
      _rate.setId(q.value("curr_id"));
      _rate.localValue = q.value("teprjtask_rate");
    }

    if (q.value("item_id") == -1)
      _useItem.checked = false;
    else
    {
      _useItem.checked = true;
      _item.setId(q.value("item_id"));
    }
  }
  else
    xtte.errorCheck(q);
}

// Initialize
_item.setQuery(xtte.itemSql);
_useItem.checked = false;

// Connections
mydialog["finished(int)"].connect(xtte.task.save);

