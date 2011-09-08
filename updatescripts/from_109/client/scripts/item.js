debugger;

//find the tab list and create a new widget to insert into it.
var tablist = mywindow.findChild("_tab"); 
// load a predefined screen by name from the database
var expensePage = toolbox.loadUi("teexpense", mywindow);

//insert the new tab
toolbox.tabInsertTab(tablist,2,expensePage, "Expense");

var _itemtype = mywindow.findChild("_itemtype");
_itemtype['currentIndexChanged(QString)'].connect(handleExpense);

var _close = mywindow.findChild("_close");
var _description = mywindow.findChild("_description");
var _item = mywindow.findChild("_itemNumber");
var _account = mywindow.findChild("_account");
var _expcat = mywindow.findChild("_expcat");
var _accountSelected = mywindow.findChild("_accountSelected");
var _expcatSelected = mywindow.findChild("_expcatSelected");
var _allowExpenseGroup = mywindow.findChild("_allowExpenseGroup");
var _inventoryUOM = mywindow.findChild("_inventoryUOM");

var _itemid;
var _mode;
var _saved = false;

tablist['currentChanged(int)'].connect(populate);
_inventoryUOM.newID.connect(handleExpense);

var _save = mywindow.findChild("_save");
_save.clicked.connect(sSave);

_allowExpenseGroup.toggled.connect(deleteExpenseItemSetup);
_accountSelected.toggled.connect(clickswitch);
_expcatSelected.toggled.connect(clickswitch);

function clickswitch()
{
  if(_accountSelected.checked)
  {
    _account.enabled = true;
    _expcat.enabled = false;
    _expcat.setId(-1);
  }else{
    _account.enabled = false;
    _expcat.enabled = true;
    _account.setId(-1);
  }
}

function set(params)
{
  if("itemid" in params)
  {
    _itemid = params.itemid;
    populate();
  }

  if("mode" in params)
  {
    if (params.mode == "new")
    {
      _mode = "new";
      _expense.setFocus();
    }
    else if (params.mode == "edit")
    {
      _mode = "edit";
      _save.setFocus();
    }
    else if (params.mode == "view")
    {
      _mode = "view";
      _item.enabled = false;
      _description.enabled = false;
      _close.text = qsTr("&Close");
      _save.hide();

      _close.setFocus();
    }
  }

  handleExpense();

  return mainwindow.NoError;
}


function deleteExpenseItemSetup()
{
  try
  {
    if (_allowExpenseGroup.checked || !_saved)
      return;

    var msg = qsTr("Are you sure you do not want this item to be an expense item?")
    if (toolbox.messageBox("critical", mywindow, mywindow.windowTitle, msg, 
	QMessageBox.Yes | QMessageBox.Escape, 
	QMessageBox.No | QMessageBox.Default) == QMessageBox.Yes)
    {
      var params = new Object;
      params.item = _item.text;

      var q = toolbox.executeQuery("select getitemid(<? value('item') ?>) "
        + "as itemid;",params);
      if (q.first())
      {
        params.itemid = q.value("itemid");
        var qry = toolbox.executeQuery('delete from te.teexp '
	+ 'where teexp_id = <? value("itemid") ?>;',params);

        if (qry.lastError().type != QSqlError.NoError)
        {
          toolbox.messageBox("critical", mywindow,
                       qsTr("Database Error"), qry.lastError().text);
          return;
        }
        _saved = false;
        _allowExpenseGroup.checked = false;
        _expcat.setId(-1);
        _account.setId(-1);
      }
    }
  }
  catch (e)
  {
    print(e);
    toolbox.messageBox("critical", mywindow, mywindow.windowTitle, e);
  }
}

function sSave()
{

  var params = new Object;
  params.item = _item.text;
  params.expcat_id = _expcat.id();
  params.accnt_id = _account.id();

  if (params.expcat_id > 0 || params.accnt_id > 0) 
  {
    var q = toolbox.executeQuery("select getitemid(<? value('item') ?>) "
      + "as itemid;",params);
    if (q.first())
    {
      params.itemid = q.value("itemid");
    }

    var q_str = "";
    if (_mode == "new" || _mode == "edit" )
    {
      // check to see if it's already in teexp
      var q = toolbox.executeQuery("select teexp_id from te.teexp "
        + "where teexp_id = <? value('itemid') ?>;",params);
      if (q.first())
      {  
        q_str = 'UPDATE te.teexp '
           +'   SET teexp_expcat_id=<? value("expcat_id") ?>,'
           + 'teexp_accnt_id = <? value("accnt_id") ?> '
           +' WHERE(teexp_id=<? value("itemid") ?>);';
      }else{
        if (params.itemid > 0)
        {
          q_str = 'INSERT INTO te.teexp '
           +'(teexp_id, teexp_expcat_id, teexp_accnt_id) '
           +'VALUES '
           +'(<? value("itemid") ?>, <? value("expcat_id") ?>,<? value("accnt_id") ?>);';
        }
      }
    }
    var qry = toolbox.executeQuery(q_str, params);
    if (qry.lastError().type != QSqlError.NoError)
    {
      toolbox.messageBox("critical", mywindow,
                       qsTr("Database Error"), qry.lastError().text);
      return;
    }
  }
}

function populate()
{
  var params = new Object;
  params.item_id = _itemid;
  params.item = _item.text;

  var q = toolbox.executeQuery("select getitemid(<? value('item') ?>) as itemid;",params);
  if (q.first())
  {
    params.item_id = q.value("itemid");
  
    var qry = toolbox.executeQuery('select teexp_id,teexp_expcat_id,teexp_accnt_id '
                                + 'FROM te.teexp '
                                + 'where teexp_id = <? value("item_id") ?>;',params);

    if(qry.first())
    {
      _saved = true;
      _allowExpenseGroup.checked = true;
      _expcat.setId(qry.value("teexp_expcat_id"));
      _account.setId(qry.value("teexp_accnt_id"));

      if(_account.id() > 0)
      {
        _accountSelected.checked = true;
      }else{
        _expcatSelected.checked = true;
      }
      params.item_id = q.value("itemid");
    }
  }
}

function handleExpense()
{
  tablist.setTabEnabled(tablist.indexOf(expensePage),_itemtype.currentIndex == 3);
}