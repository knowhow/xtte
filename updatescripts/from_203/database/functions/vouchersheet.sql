-- Function: te.vouchersheet(integer)

-- DROP FUNCTION te.vouchersheet(integer);

CREATE OR REPLACE FUNCTION te.vouchersheet(integer) RETURNS integer AS $$
DECLARE
pHeadID ALIAS FOR $1;
_s record;
_t record;
_v record;
_notes text;
_voheadid INTEGER;
_vodistid INTEGER;
_first BOOLEAN := true;
_total NUMERIC := 0;
_wage NUMERIC;
_glaccnt INTEGER;

BEGIN
  -- Loop through vendors
  FOR _v IN 
    SELECT tehead_id, vend_id, teitem_curr_id
    FROM te.tehead
      JOIN te.teitem ON (teitem_tehead_id=tehead_id)
      JOIN emp ON (tehead_emp_id=emp_id)
      LEFT OUTER JOIN te.teemp ON (emp_id=teemp_emp_id)
      JOIN vend ON (UPPER(emp_number)=UPPER(vend_number))
    WHERE ((tehead_id = pHeadID)
      AND (teitem_prepaid = false)
      AND (teitem_vodist_id IS NULL)
      AND (teitem_type = 'E' OR (COALESCE(teemp_contractor,false) AND emp_wage > 0 )))
    LOOP
       
       -- Gather items for this vendor
       FOR _s IN 
         SELECT tehead_id, tehead_number, tehead_weekending,
          teitem_id, teitem_linenumber, teitem_workdate, teitem_type,
          item_number, teitem_item_id, teitem_qty, prj_id,
          teitem_total, tehead_notes, teitem_type,
          teexp_expcat_id, teexp_accnt_id, emp_wage, emp_wage_period,
          vend_id, vend_taxzone_id, teitem_curr_id, vend_terms_id,
          vend_number, vend_1099, COALESCE(teemp_contractor,false) AS contractor,
          warehous_code
         FROM te.tehead
           JOIN te.teitem ON (teitem_tehead_id=tehead_id)
           JOIN te.teexp ON (teitem_item_id=teexp_id)
           JOIN emp ON (tehead_emp_id=emp_id)
           LEFT OUTER JOIN te.teemp ON (emp_id=teemp_emp_id)
           JOIN vend ON (UPPER(emp_number)=UPPER(vend_number))
           JOIN item ON (teitem_item_id=item_id)
           JOIN prjtask ON (teitem_prjtask_id=prjtask_id)
           JOIN prj ON (prjtask_prj_id=prj_id)
           JOIN warehous ON (tehead_warehous_id=warehous_id)
        WHERE ((tehead_id = pHeadID)
           AND (vend_id = _v.vend_id)
           AND (teitem_curr_id = _v.teitem_curr_id)
           AND (teitem_prepaid = false)
           AND (teitem_vodist_id IS NULL)
           AND (teitem_type = 'E' OR (COALESCE(teemp_contractor,false) AND emp_wage > 0 )))
       
       -- Loop thru records and create vouchers by supplier for the provided headid
       LOOP        
         IF (_first) THEN
           _voheadid = nextval('vohead_vohead_id_seq');
           _wage := te.calcRate(_s.emp_wage, _s.emp_wage_period);
           
           INSERT INTO vohead (vohead_id, vohead_number, vohead_vend_id,
               vohead_distdate, vohead_docdate, vohead_duedate,
               vohead_terms_id, vohead_taxzone_id, vohead_invcnumber, 
               vohead_reference, vohead_amount, vohead_1099, vohead_curr_id, 
               vohead_notes, vohead_posted, vohead_misc, vohead_pohead_id )
           VALUES ( _voheadid, fetchVoNumber(), _s.vend_id, _s.tehead_weekending, _s.tehead_weekending,
               determineDueDate(_s.vend_terms_id, _s.tehead_weekending), _s.vend_terms_id,
               _s.vend_taxzone_id, 'N/A', ('T&E Sheet ' || _s.tehead_number), 0, _s.vend_1099, 
               _v.teitem_curr_id, _s.tehead_notes, false, true, -1 );

           _first := false;
         END IF;

          -- insert vodist records here
          _vodistid = nextval('vodist_vodist_id_seq');

          -- Map expense directly to account so we can get project account mapping if applicable
          IF (_s.teexp_accnt_id > 1) THEN
            _glaccnt := getPrjAccntId(_s.prj_id, _s.teexp_accnt_id);
          ELSE
           SELECT getPrjAccntId(_s.prj_id, expcat_exp_accnt_id) INTO _glaccnt
           FROM expcat
           WHERE (expcat_id=_s.teexp_expcat_id);
          END IF;
          
          IF (_s.teitem_type = 'T') THEN
            -- Time sheet record
            _notes := formatdate(_s.teitem_workdate) || E'\t' || _s.item_number || E'\t' || formatQty(_s.teitem_qty) || ' hours' || E'\t';
            	   
            INSERT INTO vodist ( vodist_id, vodist_vohead_id, vodist_poitem_id,
               vodist_costelem_id, vodist_accnt_id, vodist_amount,
               vodist_expcat_id, vodist_notes ) 
               VALUES ( _vodistid, _voheadid, -1,-1, _glaccnt, 
                        _wage * _s.teitem_qty,
                        -1, _notes );

             _total := _total + _wage * _s.teitem_qty;
          ELSE
            -- Expense record
            _notes := formatdate(_s.teitem_workdate) || E'\t' || _s.item_number || E'\t' || E'\t';

            INSERT INTO vodist ( vodist_id, vodist_vohead_id, vodist_poitem_id,
               vodist_costelem_id, vodist_accnt_id, vodist_amount,
               vodist_expcat_id, vodist_notes ) 
               VALUES ( _vodistid, _voheadid, -1,-1,  _glaccnt, 
               _s.teitem_total,-1, _notes );

            _total := _total + _s.teitem_total;
          END IF;

          UPDATE vohead SET vohead_amount = _total WHERE (vohead_id=_voheadid);
          
          -- Update the te.teitem record with the relationship
          UPDATE te.teitem SET teitem_vodist_id = _vodistid WHERE teitem_id = _s.teitem_id;
       END LOOP;
       
       _total := 0;
       
  END LOOP;
          
RETURN 1;
END;
$$ LANGUAGE 'plpgsql' VOLATILE