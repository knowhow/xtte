/*
 * This file is part of the xtte package for xTuple ERP: PostBooks Edition, a free and
 * open source Enterprise Resource Planning software suite,
 * Copyright (c) 1999-2011 by OpenMFG LLC, d/b/a xTuple.
 * It is licensed to you under the Common Public Attribution License
 * version 1.0, the full text of which (including xTuple-specific Exhibits)
 * is available at www.xtuple.com/CPAL.  By using this software, you agree
 * to be bound by its terms.
 */

var xtte;
if (!xtte)
  xtte = new Object;

xtte.itemSql = "SELECT item_id,item_number,item_descrip1,item_descrip2, "
             + "       item_type,item_config,item_upccode,uom_name "
             + "FROM item JOIN uom ON (uom_id=item_inv_uom_id) "
             + "          JOIN te.teexp ON (teexp_id=item_id) "
             + "WHERE item_type='R' "

xtte.newMode 	= 0;
xtte.editMode	= 1;
xtte.viewMode	= 2;

xtte.errorCheck = function (q)
{
  if (q.lastError().type != QSqlError.NoError)
  {
    toolbox.messageBox("critical", mywindow,
                        qsTr("Database Error"), q.lastError().text);
    return false;
  }

  return true;
}
