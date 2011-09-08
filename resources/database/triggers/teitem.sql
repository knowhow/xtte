CREATE OR REPLACE FUNCTION te.triggerteitem() RETURNS "trigger" AS $$
DECLARE
_r RECORD;
_status CHAR(1) := 'O';

BEGIN
  -- Validate whether we can take this action
  IF (TG_OP = 'UPDATE') THEN
    IF ((OLD.teitem_type != NEW.teitem_type)
      OR (OLD.teitem_workdate != NEW.teitem_workdate)
      OR (OLD.teitem_cust_id != NEW.teitem_cust_id)
      OR (OLD.teitem_po != NEW.teitem_po)
      OR (OLD.teitem_item_id != NEW.teitem_item_id)
      OR (OLD.teitem_qty != NEW.teitem_qty)
      OR (OLD.teitem_rate != NEW.teitem_rate)
      OR (OLD.teitem_total != NEW.teitem_total)
      OR (OLD.teitem_billable != NEW.teitem_billable)
      OR (OLD.teitem_prepaid != NEW.teitem_prepaid)
      OR (OLD.teitem_notes != NEW.teitem_notes)) THEN
      
      SELECT tehead_status INTO _status FROM te.tehead WHERE tehead_id=NEW.teitem_tehead_id;
    END IF;
  ELSIF (TG_OP = 'INSERT') THEN
    SELECT tehead_status INTO _status FROM te.tehead WHERE tehead_id=NEW.teitem_tehead_id;
  ELSE -- Must be delete
    SELECT tehead_status INTO _status FROM te.tehead WHERE tehead_id=OLD.teitem_tehead_id;
  END IF;

  IF (_status != 'O') THEN
    RAISE EXCEPTION 'Time and Expense Sheets may only be edited or deleted when the status is Open';
  END IF;

  _status := 'C';
  
  -- Update header status, default is to close if all processing complete
  IF (TG_OP = 'UPDATE') THEN
    IF ((COALESCE(OLD.teitem_invcitem_id,-1) != COALESCE(NEW.teitem_invcitem_id,-1))
      OR (COALESCE(OLD.teitem_vodist_id,-1) != COALESCE(NEW.teitem_vodist_id,-1))
      OR (OLD.teitem_posted != NEW.teitem_posted)) THEN

      SELECT 
        te.sheetstate(NEW.teitem_tehead_id, 'I') AS invoiced,
        te.sheetstate(NEW.teitem_tehead_id, 'V') AS vouchered,
        te.sheetstate(NEW.teitem_tehead_id, 'P') AS posted
      INTO _r;

      IF (_r.invoiced = 0 OR _r.vouchered = 0 OR _r.posted = 0) THEN
        _status := 'A'; -- Something is still open, so approved
      END IF;
    
      UPDATE te.tehead SET tehead_status = _status WHERE (tehead_id=NEW.teitem_tehead_id);
    END IF;
  END IF;

  -- Update header with last use info
  IF (TG_OP = 'DELETE') THEN
    UPDATE te.tehead SET
      tehead_lastupdated=('now'::text)::timestamp(6) with time zone
    WHERE (tehead_id=OLD.teitem_tehead_id);
  ELSE
    UPDATE te.tehead SET
      tehead_lastupdated=('now'::text)::timestamp(6) with time zone,
      tehead_username=current_user
    WHERE (tehead_id=NEW.teitem_tehead_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

SELECT dropIfExists('TRIGGER', 'teitemtrigger', 'te');
CREATE TRIGGER teitemTrigger
  AFTER INSERT OR UPDATE OR DELETE
  ON te.teitem
  FOR EACH ROW
  EXECUTE PROCEDURE te.triggerteitem();
