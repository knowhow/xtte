CREATE OR REPLACE FUNCTION te.postsheet(integer, text, text) RETURNS integer AS $$
DECLARE
pTeheadId ALIAS FOR $1;
pPhrase1 ALIAS FOR $2;
pPhrase2 ALIAS FOR $3; 
_r record;
_notes TEXT;
_value NUMERIC;
_olaccntid INTEGER;
_expaccntid INTEGER;
_count INTEGER;

BEGIN
  -- Validate: No posting for contractors
  IF (SELECT (count(teemp_id) > 0) 
      FROM te.tehead
        JOIN te.teemp ON (tehead_emp_id=teemp_emp_id)
      WHERE ((tehead_id=pTeheadId)
        AND (teemp_contractor))) THEN
    RAISE EXCEPTION 'Time and Expense Sheets can not be posted for contractors.  Voucher instead.';
  END IF;
  
  -- Get labor and overhead account
  SELECT accnt_id INTO _olaccntid
  FROM accnt
  WHERE (accnt_id=fetchmetricvalue('PrjLaborAndOverhead'));

  GET DIAGNOSTICS _count = ROW_COUNT;
  IF (_count = 0) THEN
    RAISE EXCEPTION 'No valid Project Labor and Overhead Account Defined';
  END IF;

  -- Get applicable time sheets
  FOR _r IN 
    SELECT tehead_number,
      teitem_id, teitem_linenumber, teitem_type, teitem_notes,
      item_descrip1, teitem_qty,
      teexp_expcat_id, teexp_accnt_id, 
      emp_code, emp_wage, emp_wage_period,
      prj_id, prj_number
    FROM te.tehead
     JOIN te.teitem ON (teitem_tehead_id=tehead_id)
     JOIN item ON (teitem_item_id=item_id)
     JOIN te.teexp ON (teitem_item_id=teexp_id)
     JOIN emp ON (tehead_emp_id=emp_id)
     JOIN prjtask ON (prjtask_id=teitem_prjtask_id)
     JOIN prj ON (prj_id=prjtask_prj_id)
    WHERE ((tehead_id = pTeheadId)
     AND (NOT teitem_posted)
     AND (teitem_vodist_id IS NULL)
     AND (teitem_type = 'T'))

  LOOP  
    -- Determine value
    _value := te.calcRate(_r.emp_wage, _r.emp_wage_period) * _r.teitem_qty;

    -- Determine G/L account to post to
    IF (_r.teexp_accnt_id > 1) THEN
      _expaccntid := getPrjAccntId(_r.prj_id, _r.teexp_accnt_id);
    ELSE
      SELECT getPrjAccntId(_r.prj_id, expcat_exp_accnt_id) INTO _expaccntid
      FROM expcat
      WHERE (expcat_id=_r.teexp_expcat_id);
    END IF;

    -- Execute the posting
    _notes := (pPhrase1 || _r.item_descrip1 || '/' || _r.emp_code || pPhrase2 || ' ' || _r.prj_number);
    PERFORM insertGLTransaction( 'T/E', 'TE', _r.tehead_number, _notes,
                                 _olaccntid, _expaccntid, -1,
                                 _value, current_date );

    -- Update the time sheet item
    UPDATE te.teitem SET 
      teitem_posted = true,
      teitem_postedvalue = teitem_postedvalue + _value
    WHERE (teitem_id=_r.teitem_id);
                        
  END LOOP;
          
RETURN 1;
END;
$$ LANGUAGE 'plpgsql' VOLATILE