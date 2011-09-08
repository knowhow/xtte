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
xtte.customer = new Object;


if (privileges.check("CanViewRates"))
{
  var _custid = -1;
  var _creditGroup = mywindow.findChild("_creditGroup");
  var _layout = toolbox.widgetGetLayout(_creditGroup);
  var _tecustomer = toolbox.loadUi("tecustomer", mywindow);
  var groupBox_3 = mywindow.findChild("groupBox_3");
  var groupBox_4 = mywindow.findChild("groupBox_4");
  var _creditStatusGroup = mywindow.findChild("_creditStatusGroup");

  _layout.addWidget(_tecustomer, 0, 0, 1, 3);
  _layout.addWidget(groupBox_4, 1, 0, 1, 1);
  _layout.addWidget(_creditStatusGroup, 1, 1, 1, 1);
  _layout.addWidget(groupBox_3, 1, 2, 1, 1);
  _layout.addWidget(_creditGroup, 2, 0, 1, 3);

  var _number = mywindow.findChild("_number");
  var _blanketPos = mywindow.findChild("_blanketPos");
  var _billingGroup = mywindow.findChild("_billingGroup");
  var _rate = _tecustomer.findChild("_rate");
  var _tecustrateid = -1;
  var _basecurrid = _rate.id();

  xtte.customer.modeChanged = function(mode)
  {
    _billingGroup.enabled = (mode == mainwindow.cNew || mode == mainwindow.cEdit);
  }

  xtte.customer.save = function()
  {

    var params = new Object();
    params.tecustrate_id = _tecustrateid;
    params.cust_id       = _custid;
    params.curr_id       = _rate.id();
    params.rate          = _rate.localValue;

    var query = "updtecustrate";
    if (!_billingGroup.checked)
      query = "deltecustrate";
    else if (_tecustrateid == -1)
      query = "instecustrate";

    var q = toolbox.executeDbQuery("customer", query, params);
    if (q.first())
      _tecustrateid = q.value("tecustrate_id");
    else
      xtte.errorCheck(q);
  }

  xtte.customer.populate = function(custId)
  {
    if (_custid == custId)
      return;

    _custid = custId;

    var params = new Object();
    params.cust_id = _custid;

    var q = toolbox.executeDbQuery("customer", "seltecustrate", params);

    if (q.first())
    {
      _billingGroup.checked = true;
      _tecustrateid = q.value("tecustrate_id");
      _rate.setId(q.value("tecustrate_curr_id"));
      _rate.localValue = q.value("tecustrate_rate");
      return;
    }
    else
      xtte.errorCheck(q);

    _billingGroup.checked = false;
    _tecustrateid = -1;
    _rate.setId(_basecurrid);
    _rate.localValue = 0;
  }

  // Initialize
  QWidget.setTabOrder(_blanketPos, _rate);

  mywindow["newId(int)"].connect(xtte.customer.populate);
  mywindow["newMode(int)"].connect(xtte.customer.modeChanged);
  mywindow["saved(int)"].connect(xtte.customer.save);

  xtte.customer.populate();
}
