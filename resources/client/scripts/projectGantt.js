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
xtte.projectGantt = new Object;

var _webView = new QWebView(mywindow);
var _toolBar = mywindow.findChild("_toolBar");
var _layout = toolbox.widgetGetLayout(_toolBar);
var _prjid;
var _prjNumber;
var _prjName;
var _startDate;
var _dueDate;
var _jsCode;
var _cssCode;
var _jsPath;
var _cssPath;
var _qry;
var _page;
var _gantt;

set = function (input) 
{ 
  if ("startDate" in input)
    _startDate = input.startDate;

  if ("dueDate" in input)
    _dueDate = input.dueDate;

  if ("prjName" in input)
    _prjName = input.prjName;

  if ("prjNumber" in input)
  {
    _prjNumber = input.prjNumber;
    qry = toolbox.executeDbQuery("projectGantt","getprj",input);
    if (qry.first())
      _prjid = qry.value("prj_id");

    xtte.projectGantt.populate();
  }
}

xtte.projectGantt.populate = function()
{

    _page = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
    _page = _page + '<html><head>';
    _page = _page + '<link rel="stylesheet" type="text/css" href="file:///' + _cssPath + '"/>';
    _page = _page + '<script language="javascript" src="file:///' + _jsPath + '"></script>';
    _page = _page + '</head><body bgcolor="#F0F0F0"><div class="gantt" id="GanttChartDIV"></div></body></html>';

    _gantt = "<script>";
    _gantt = _gantt + "var g = new JSGantt.GanttChart('g', document.getElementById('GanttChartDIV'), 'day');";
    _gantt = _gantt + "g.setShowRes(0);";
    _gantt = _gantt + "g.setShowDur(0);";
    _gantt = _gantt + "g.setShowComp(0);";
    _gantt = _gantt + "g.setDateInputFormat('dd/mm/yyyy');";
    _gantt = _gantt + "g.setCaptionType('Resource');";
    _gantt = _gantt + "if (g) {";
    _gantt = _gantt + "g.AddTaskItem(new JSGantt.TaskItem(" + _prjid + ", '" + _prjName + "', '" + _startDate + "', '" + _dueDate + "', '000000', '', 0, '', 0, 1, 0, 1));";

    var j = 0;
    
    params = new Object;
    params.prj_id = _prjid;
    qryTask = toolbox.executeDbQuery("projectGantt","tasks",params);
    while(qryTask.next()) 
    {
      j = j + 1;
      var barColor = "000000";
      if (j == 1) barColor = "4F81BD";
      if (j == 2) barColor = "C0504D";
      if (j == 3) barColor = "9BBB59";
      if (j == 4) barColor = "8064A2";
      if (j == 5) barColor = "4BACC6";
      if (j == 6) { barColor = "F79646"; j = 0;}

      _gantt = _gantt + "g.AddTaskItem(new JSGantt.TaskItem(" + _prjid + qryTask.value("prjtask_id") + ", '" + qryTask.value("prjtask_name") + "', '" + qryTask.value("start_date") + "', '" + qryTask.value("due_date") + "', '" + barColor + "', '', 0, '', 0, 0, " + _prjid + ", 1));";
    }

    _gantt = _gantt + "g.Draw();";
    _gantt = _gantt + "g.DrawDependencies();";
    _gantt = _gantt + "}";
    _gantt = _gantt + "else {";
    _gantt = _gantt + ' alert("not defined");';
    _gantt = _gantt + "  }";
    _gantt = _gantt + "</script>";
     
    var html = _page + _gantt;
    _webView.setHtml(html);
    // This snippet should make the link open in a new browser, but nothing happens. Why?
    //_webView.page().linkDelegationPolicy = QWebPage.DelegateAllLinks;
}

// Initialize
mywindow.findChild("_close").triggered.connect(mywindow, "close");

_layout.addWidget(_webView, 1, 0);

// Create jsGantt files on local OS if they don't already exist
var tmpdir = toolbox.getTempDir();
_jsPath = tmpdir + "/jsgantt.js";
_cssPath = tmpdir + "/jscantt.css";

if (!toolbox.fileExists(_jsPath))
{
  // Create jsGantt script
  qry = toolbox.executeDbQuery("projectGantt","jsgantt");
  if (qry.first());
    _jsCode = qry.value("script_source");

  toolbox.textStreamWrite(_jsPath, _jsCode);

  // Create jsGantt style sheet
  qry = toolbox.executeDbQuery("projectGantt","jsganttcss");
  if (qry.first());
    _cssCode = qry.value("script_source");

  toolbox.textStreamWrite(_cssPath, _cssCode);
}
