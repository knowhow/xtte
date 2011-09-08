CREATE OR REPLACE FUNCTION te.sheetstate(integer, char(1)) RETURNS integer AS $$
DECLARE
pTeheadId ALIAS FOR $1;
pType ALIAS FOR $2;
_state integer;
_count integer;

BEGIN
  -- Check and return the process state of the sheet
  --    1 = All processed
  --    0 = Processing required
  --   -1 = Not Applicable
  
  IF (pType = 'I') THEN
    SELECT state INTO _state
    FROM (
      SELECT 1 AS state
      FROM te.teitem
      WHERE ((teitem_tehead_id=pTeheadId)
       AND (teitem_billable)
       AND (teitem_qty >= 0)
       AND (teitem_invcitem_id IS NOT NULL))
      UNION ALL
      SELECT 0 AS state
      FROM te.teitem
      WHERE ((teitem_tehead_id=pTeheadId)
       AND (teitem_billable)
       AND (teitem_qty >= 0)
       AND (teitem_invcitem_id IS NULL))
     ) data
     ORDER BY state ASC
     LIMIT 1;

  ELSIF (pType = 'V') THEN
    SELECT state INTO _state
    FROM (
      SELECT 1 AS state
      FROM te.tehead
        JOIN emp ON (tehead_emp_id=emp_id)  
        LEFT OUTER JOIN te.teemp ON (emp_id=teemp_emp_id)
        LEFT OUTER JOIN te.teitem ON (teitem_tehead_id=tehead_id)
        LEFT OUTER JOIN vend ON (UPPER(emp_number)=UPPER(vend_number))
      WHERE ((teitem_tehead_id=pTeheadId)
       AND ((teitem_type = 'E' AND NOT teitem_prepaid) 
         OR (teitem_type = 'T' AND COALESCE(teemp_contractor,false)))
       AND (vend_id IS NOT NULL)
       AND (teitem_qty > 0)
       AND (teitem_vodist_id IS NOT NULL))
      UNION ALL
      SELECT 0 AS state
      FROM te.tehead
        JOIN emp ON (tehead_emp_id=emp_id)  
        LEFT OUTER JOIN te.teemp ON (emp_id=teemp_emp_id)
        LEFT OUTER JOIN te.teitem ON (teitem_tehead_id=tehead_id)
        LEFT OUTER JOIN vend ON (UPPER(emp_number)=UPPER(vend_number))
      WHERE ((teitem_tehead_id=pTeheadId)
       AND ((teitem_type = 'E' AND NOT teitem_prepaid) 
         OR (teitem_type = 'T' AND COALESCE(teemp_contractor,false)))
       AND (vend_id IS NOT NULL)
       AND (teitem_qty > 0)
       AND (teitem_vodist_id IS NULL))
     ) data
     ORDER BY state ASC
     LIMIT 1;

  ELSIF (pType = 'P') THEN
    SELECT state INTO _state
    FROM (
      SELECT 1 AS state
      FROM te.teitem
       JOIN te.tehead ON (teitem_tehead_id=tehead_id)
       JOIN te.teemp ON (tehead_emp_id=teemp_emp_id)
      WHERE ((teitem_tehead_id=pTeheadId)
       AND (teitem_type = 'T')
       AND (teitem_posted)
       AND (NOT teemp_contractor))
      UNION ALL
      SELECT 0 AS state
      FROM te.teitem
       JOIN te.tehead ON (teitem_tehead_id=tehead_id)
       JOIN te.teemp ON (tehead_emp_id=teemp_emp_id)
      WHERE ((teitem_tehead_id=pTeheadId)
       AND (teitem_type = 'T')
       AND (NOT teitem_posted)
       AND (NOT teemp_contractor))
     ) data
     ORDER BY state ASC
     LIMIT 1;
  ELSE
    RAISE EXCEPTION 'Unknown process type %', pType;
  END IF;

  GET DIAGNOSTICS _count = ROW_COUNT;
  IF (_count = 0) THEN
    RETURN -1;
  END IF;
  
  RETURN _state;

END;
$$ LANGUAGE 'plpgsql';
