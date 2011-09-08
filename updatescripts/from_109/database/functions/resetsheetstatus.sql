-- Function: te.resetSheetStatus(integer)
-- DROP FUNCTION te.resetSheetStatus(integer);
CREATE OR REPLACE FUNCTION te.resetSheetStatus(integer)
  RETURNS integer AS
$BODY$
DECLARE
_t record;
pInvchead ALIAS FOR $1;

BEGIN

   -- reset the tehead/teitem for this invoice
   -- tehead_billable_status to 'A' from 'C' for this invoice
   -- teitem_billable_status to 'A' from 'C' for this invoice
   -- identify the tehead in question
   -- select teitem_tehead_id from teitem where teitem_invchead_id = NEW.invchead_id;

   --for each item, update the associated head record
   -- loop thru all lines of the sheet
    for _t in select * from (
      select teitem_id,teitem_tehead_id
      from te.teitem
      where teitem_invchead_id = pInvchead 
    ) foo

    LOOP
      update te.tehead set tehead_billable_status = 'A' where tehead_id = _t.teitem_tehead_id;
      update te.teitem set teitem_billable_status = 'A' where teitem_invchead_id = pInvchead;
    END LOOP;

RETURN 1;
END;
$BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
ALTER FUNCTION te.resetSheetStatus(integer) OWNER TO "admin";

