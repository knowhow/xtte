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
xtte.item = new Object;

var _tab = mywindow.findChild("_tab"); 
var _expensePage = toolbox.loadUi("teexpense", mywindow);
toolbox.tabInsertTab(_tab, 2, _expensePage, "Project");

var _projectExpense = mywindow.findChild("_projectExpense");
var _itemtype = mywindow.findChild("_itemtype");
var _close = mywindow.findChild("_close");
var _description = mywindow.findChild("_description");
var _account = mywindow.findChild("_account");
var _expcat = mywindow.findChild("_expcat");
var _accountSelected = mywindow.findChild("_accountSelected");
var _expcatSelected = mywindow.findChild("_expcatSelected");
var _allowExpenseGroup = mywindow.findChild("_allowExpenseGroup");
var _inventoryUOM = mywindow.findChild("_inventoryUOM");
var _save = mywindow.findChild("_save");

var _saved = false;
var _isnew = true;

xtte.item.clickswitch = function()
{
  if(_accountSelected.checked)
  {
    _account.enabled = true;
    _expcat.enabled = false;
    _expcat.setId(-1);
  }
  else
  {
    _account.enabled = false;
    _expcat.enabled = true;
    _account.setId(-1);
  }
}

xtte.item.save = function(id)
{
  var params = new Object;
  params.item_id = id;
  params.expcat_id = _expcat.id();
  params.accnt_id = _account.id();

  var query = "updteexp";
  if (!_projectExpense.checked)
    query = "delteexp";
  else if (_isnew)
    query = "insteexp";

  var q = toolbox.executeDbQuery("item", query, params);
  xtte.errorCheck(q);
}

xtte.item.populate = function(itemId)
{
  var params = new Object;
  params.item_id = itemId;

  var q = toolbox.executeDbQuery("item", "selteexp", params);

  if (q.first())
  {
    _projectExpense.checked = true;
    _expcat.setId(q.value("teexp_expcat_id"));
    _account.setId(q.value("teexp_accnt_id"));

    if(_account.id() > 0)
      _accountSelected.checked = true;
    else
      _expcatSelected.checked = true;

    _isnew = false;
  }
  else if (!xtte.errorCheck(q))
    return
  else
  {
    _projectExpense.checked = false;
    _isnew = true;
  }

  xtte.item.handleExpense();
}

xtte.item.handleExpense = function()
{
  _tab.setTabEnabled(_tab.indexOf(_expensePage), _itemtype.currentIndex == 3);
}

xtte.item.checkSave = function()
{
  if (_projectExpense.checked == true &&
      !_expcat.isValid() && 
      !_account.isValid())
  {
    QMessageBox.critical(mywindow,
                       qsTr("Can not save item"),
                       qsTr("You must select a G/L Account or an expense account for Project Expense Items."));
  }
  else
    mywindow.sSave();
}

// Initialize
_expcat.enabled = false;
_account.setType(0x01 | 0x02 | 0x04); // Asset, Liability, Expense

// Connections
toolbox.coreDisconnect(_save, "clicked()", mywindow, "sSave()"); 
_save.clicked.connect(xtte.item.checkSave);
mywindow["saved(int)"].connect(xtte.item.save);
mywindow["newId(int)"].connect(xtte.item.populate);
_accountSelected.toggled.connect(xtte.item.clickswitch);
_expcatSelected.toggled.connect(xtte.item.clickswitch);
_itemtype['currentIndexChanged(QString)'].connect(xtte.item.handleExpense);
_inventoryUOM.newID.connect(xtte.item.handleExpense);

