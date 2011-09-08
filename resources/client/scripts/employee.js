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
xtte.employee = new Object;

var _externalRate = mywindow.findChild("_externalRate"); 
var _layout = toolbox.widgetGetLayout(_externalRate);
var _contractor = toolbox.createWidget("QCheckBox", mywindow, "_contractor");
_contractor.text = qsTr("Contractor");

_layout.addWidget(_contractor, 1, 4);

var _teempid = -1; 
var _empid = -1;

set = function(input)
{
  if("emp_id" in input)
  {
    _empid = input.emp_id;
    xtte.employee.populate();
  }

  if("mode" in input)
  {
    if (input.mode == "view")
      _contractor.enabled = false;
  }

  return mainwindow.NoError;
}

xtte.employee.save = function(empId)
{
  if (empId <= 0)
    return;

  var params = new Object();
  params.teemp_id	= _teempid;
  params.emp_id	= empId;
  params.contractor	= _contractor.checked;

  var query = "updteemp";
  if (_teempid == -1)
    query = "insteemp";

  var q = toolbox.executeDbQuery("employee", query, params);
  xtte.errorCheck(q);
}

xtte.employee.populate = function()
{
  var params = new Object();
  params.emp_id = _empid;    

  var q = toolbox.executeDbQuery("employee", "selteemp", params);

  if (q.first())
  {
    _teempid = q.value("teemp_id");
    _contractor.checked = (q.value("teemp_contractor"));
  }
  else
    xtte.errorCheck(q);
}

mydialog["finished(int)"].connect(xtte.employee.save);


