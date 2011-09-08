-- Function: te.vouchersheet(integer)

-- DROP FUNCTION te.vouchersheet(integer);

CREATE OR REPLACE FUNCTION te.vouchersheet(integer) RETURNS integer AS $$
DECLARE
pHeadID ALIAS FOR $1;
_s record;
_t record;
_u record;
_notes text;
_voheadid INTEGER;
_vodistid INTEGER;
_first BOOLEAN := true;
_total NUMERIC := 0;

BEGIN
        -- note that we are putting a very basic workflow in place here
        --  A is approved...if further approval is needed (mgr, etc) then the status should goto P
       FOR _s IN 
         SELECT tehead_id, tehead_number, tehead_weekending,
          teitem_id, teitem_linenumber, teitem_workdate, teitem_type, teitem_emp_id,
          item_number, teitem_item_id, teitem_qty,
          teitem_total, tehead_site, tehead_notes, teitem_type,
          teexp_expcat_id, teexp_accnt_id, emp_wage, emp_wage_period,
          vend_id, vend_taxzone_id, vend_curr_id, vend_terms_id,
          vend_number, vend_1099
         FROM te.tehead
           JOIN te.teitem ON (teitem_tehead_id=tehead_id)
           JOIN te.teexp ON (teitem_item_id=teexp_id)
           JOIN emp ON (teitem_emp_id=emp_id)
           JOIN vend ON (UPPER(emp_number)=UPPER(vend_number))
           JOIN item ON (teitem_item_id=item_id)
        WHERE ((tehead_id = pHeadID)
           AND (teitem_prepaid = false)
           AND (COALESCE(tehead_payable_status,'P')!='C')
           AND (COALESCE(teitem_payable_status,'P')!='C'))
       
       -- Loop thru records and create vouchers by supplier for the provided headid
       LOOP        
         IF (_first) THEN
           _voheadid = nextval('vohead_vohead_id_seq');
           
           INSERT INTO vohead (vohead_id, vohead_number, vohead_vend_id,
               vohead_distdate, vohead_docdate, vohead_duedate,
               vohead_terms_id, vohead_taxzone_id, vohead_invcnumber, 
               vohead_reference, vohead_amount, vohead_1099, vohead_curr_id, 
               vohead_notes, vohead_posted, vohead_misc, vohead_pohead_id )
           VALUES ( _voheadid, fetchVoNumber(), _s.vend_id, current_date, _s.tehead_weekending,
               determineDueDate(_s.vend_terms_id, current_date), _s.vend_terms_id,
               _s.vend_taxzone_id, _s.tehead_number, _s.tehead_site , 0, _s.vend_1099, 
               _s.vend_curr_id, _s.tehead_notes, false, true, -1 );

           _first := false;
         END IF;

         IF (_s.emp_wage_period != 'H') THEN
           RAISE EXCEPTION 'Voucher not processed.  Only employees with hourly rates supported.';
         ELSIF (_s.emp_wage = 0) THEN
           RAISE EXCEPTION 'Voucher not processed.  Employe wage set at zero.';
         END IF;

          -- insert vodist records here
          _vodistid = nextval('vodist_vodist_id_seq');

          IF (_s.teitem_type = 'T') THEN
            -- Time sheet record
            _notes := formatdate(_s.teitem_workdate) || E'\t' || _s.item_number || E'\t' || formatQty(_s.teitem_qty) || ' hours' || E'\t';
            	   
            INSERT INTO vodist ( vodist_id, vodist_vohead_id, vodist_poitem_id,
               vodist_costelem_id, vodist_accnt_id, vodist_amount,
               vodist_expcat_id, vodist_notes ) 
               VALUES ( _vodistid, _voheadid, -1,-1, _s.teexp_accnt_id, _s.emp_wage * _s.teitem_qty,
                        _s.teexp_expcat_id, _notes );

             _total := _total + _s.emp_wage * _s.teitem_qty;
          ELSE
            -- Expense record
            _notes := formatdate(_s.teitem_workdate) || E'\t' || _s.item_number || E'\t' || E'\t';

            INSERT INTO vodist ( vodist_id, vodist_vohead_id, vodist_poitem_id,
               vodist_costelem_id, vodist_accnt_id, vodist_amount,
               vodist_expcat_id, vodist_notes ) 
               VALUES ( _vodistid, _voheadid, -1,-1, _s.teexp_accnt_id, _s.teitem_total,_s.teexp_expcat_id, _notes );

            _total := _total + _s.teitem_total;
          END IF;
          
          -- Update the te.teitem record with the status
          UPDATE te.teitem SET teitem_payable_status = 'C' WHERE teitem_id = _s.teitem_id;
       END LOOP;

       -- Update the te.tehead record with C status
       IF (NOT _first) THEN
         UPDATE vohead SET 
           vohead_amount = _total 
         WHERE (vohead_id=_voheadid);
         
         UPDATE te.tehead set tehead_payable_status = 'C' 
         WHERE ((tehead_id = pHeadID)
         AND (NOT EXISTS (
            SELECT teitem_id
            FROM te.teitem
            WHERE ((teitem_tehead_id=pHeadId)
              AND (COALESCE(teitem_payable_status,'P') != 'C')))));
       ELSE
         RAISE EXCEPTION 'No time sheet data to process.';
       END IF;
          
RETURN 1;
END;
$$ LANGUAGE 'plpgsql' VOLATILE