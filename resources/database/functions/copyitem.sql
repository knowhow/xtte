CREATE OR REPLACE FUNCTION te.copyItem(INTEGER, TEXT) RETURNS INTEGER AS $$
DECLARE
  pSItemid ALIAS FOR $1;
  pTItemNumber ALIAS FOR $2;
  _itemid INTEGER;
  _r RECORD;
  _id INTEGER;

BEGIN
  _itemid := public.copyItem(pSItemid, pTItemNumber);

  INSERT INTO te.teexp
  SELECT _itemid, teexp_expcat_id, teexp_accnt_id
  FROM te.teexp src
  WHERE (src.teexp_id=pSItemid);

  RETURN _itemid;
END;
$$ LANGUAGE 'plpgsql';

