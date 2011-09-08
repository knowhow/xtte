/*
  This file is part of the xtprjaccnt Package for xTuple ERP,
  and is Copyright (c) 1999-2011 by OpenMFG LLC, d/b/a xTuple.  It
  is licensed to you under the xTuple End-User License Agreement ("the
  EULA"), the full text of which is available at www.xtuple.com/EULA.
  While the EULA gives you access to source code and encourages your
  involvement in the development process, this Package is not free
  software.  By using this software, you agree to be bound by the
  terms of the EULA.
*/

include("xtte");

xtte.configureCRM = new Object;

var _telayout = new QBoxLayout(mywindow);
var _tespcr = new QSpacerItem(10, 0, 1, 1 | 4);
var _laborAndOverheadLit = toolbox.createWidget("QLabel", mywindow, "_laborAndOverheadLit");
var _laborAndOverhead = toolbox.createWidget("GLCluster", mywindow, "_laborAndOverhead");
_laborAndOverheadLit.text = qsTr("Project Labor And Overhead:");
_laborAndOverheadLit.buddy= _laborAndOverhead;
_laborAndOverhead.setType(0x02);  // Liability

_telayout.addWidget(_laborAndOverheadLit);
_telayout.addWidget(_laborAndOverhead);
_telayout.addItem(_tespcr);

var _useProjects = mywindow.findChild("_useProjects")
var _layout = toolbox.widgetGetLayout(_useProjects);
_layout.insertLayout(1, _telayout);

xtte.configureCRM.save = function()
{ 
  var id = -1;
  if (_useProjects.checked)
    id = _laborAndOverhead.id() 
    
  metrics.set("PrjLaborAndOverhead", id);
}
// Initialize
_laborAndOverhead.setEnabled(_useProjects.checked);
_laborAndOverhead.setId(metrics.value("PrjLaborAndOverhead"));

// Connections
mywindow.saving.connect(xtte.configureCRM.save);
_useProjects["toggled(bool)"].connect(_laborAndOverheadLit, "setEnabled(bool)");
_useProjects["toggled(bool)"].connect(_laborAndOverhead, "setEnabled(bool)");

