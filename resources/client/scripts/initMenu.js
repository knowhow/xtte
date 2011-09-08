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
xtte.initMenu = new Object;

// change the search_path to ensure existing client code works with overload functions
var qry = toolbox.executeQuery("SHOW search_path;", new Object);
if (! qry.first())
  toolbox.messageBox("critical", mainwindow, qsTr("Initialize te failed"),
                     qsTr("Failed to initialize the te package. "
                        + "This functionality may not work correctly. ")
                        .arg(qry.lastError().databaseText));
else
{
  // If the search path is empty set the base value to public
  var search_path = qry.value("search_path");
  if(search_path == "")
  {
    search_path = "public";
  }

  // Prepend xtmfg to the existing search path.
  qry = toolbox.executeQuery("SET search_path TO te, " + search_path + ";", new Object);
  if(!qry.isActive())
  {
    toolbox.messageBox("critical", mainwindow, qsTr("Initialize xtmfg failed"),
                       qsTr("Failed to initialize the te package. This "
                          + "functionality may not work correctly. %1")
                          .arg(qry.lastError().databaseText));
  }
}

// Define menu and action variables
var crmMenu = mainwindow.findChild("menu.crm.projects");
crmMenu.addSeparator();

var tesheetAction = crmMenu.addAction(qsTr("Time and Expense..."), mainwindow);
tesheetAction.objectName = "pm.teSheets";
tesheetAction.setData("MaintainTimeExpense");
tesheetAction.enabled = privileges.value("MaintainTimeExpense");

var crmRptMenu = mainwindow.findChild("menu.crm.reports");
var orderActPrj = mainwindow.findChild("pm.dspOrderActivityByProject");

var historyAction = new QAction(qsTr("Time and Expense History"), mainwindow);
historyAction.objectName = "pm.teHistory";
historyAction.setData("ViewTimeExpenseHistory");
historyAction.enabled = privileges.value("ViewTimeExpenseHistory");
crmRptMenu.insertAction(orderActPrj, historyAction);

// Define function(s)
xtte.initMenu.openSheets = function()
{
  toolbox.openWindow("timeExpenseSheets");
}

xtte.initMenu.openHistory = function()
{
  toolbox.openWindow("dspTimeExpenseHistory");
}

// Connect Actions
tesheetAction.triggered.connect(xtte.initMenu.openSheets);
historyAction.triggered.connect(xtte.initMenu.openHistory);
