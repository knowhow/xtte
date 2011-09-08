var _delete 		= mywindow.findChild("_delete");
var _invchead        		= mywindow.findChild("_invchead");

_delete.clicked.connect(sDelete);

function sDelete(){

   // reset the tehead/teitem for this invoice
   // tehead_billable_status to 'A' from 'C' for this invoice
   // teitem_billable_status to 'A' from 'C' for this invoice
   // identify the tehead in question
   // select teitem_tehead_id from teitem where teitem_invchead_id = NEW.invchead_id;

  var params = new Object();   
  //params.id = _invchead.id();

  var selected = _invchead.selectedItems();

  for (var i = 0; i < selected.length; i++){

    params.id = selected[i].id();

    if (params.id > 0)
    {
      var q = toolbox.executeQuery('select te.resetSheetStatus(<? value("id") ?>) ;',params);

    }
  }



}