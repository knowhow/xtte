CREATE OR REPLACE FUNCTION te.triggerteprj() RETURNS "trigger" AS $$
DECLARE
  _update BOOLEAN := false;
BEGIN

  IF (TG_OP = 'INSERT') THEN
    _update = true;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (COALESCE(OLD.teprj_cust_id,-1) != COALESCE(NEW.teprj_cust_id,-1)) THEN
      _update = true;
    END IF;
  END IF;

  IF (_update) THEN
      UPDATE te.teprjtask SET teprjtask_cust_id=NEW.teprj_cust_id
      FROM prjtask
      WHERE ((teprjtask_prjtask_id=prjtask_id)
      AND (prjtask_prj_id=NEW.teprj_prj_id));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

SELECT dropIfExists('TRIGGER', 'teprjtrigger', 'te');
CREATE TRIGGER teprjtrigger
  AFTER UPDATE OR INSERT
  ON te.teprj
  FOR EACH ROW
  EXECUTE PROCEDURE te.triggerteprj();
