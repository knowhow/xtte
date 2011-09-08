-- Function: te.insertmiscvoucher(te.voucher)

-- DROP FUNCTION te.insertmiscvoucher(te.voucher);

CREATE OR REPLACE FUNCTION te.insertmiscvoucher(te.voucher)
  RETURNS boolean AS
$BODY$
DECLARE
	pNew ALIAS FOR $1;
	_voheadid INTEGER;
	pHeadID INTEGER;
	_lineInt INTEGER;
	_vodistid INTEGER;
	_t RECORD;
	_u RECORD;
	_notes TEXT;
	_version TEXT;
	_curr character;
BEGIN

        SELECT NEXTVAL('vohead_vohead_id_seq') into _voheadid;

        INSERT INTO vohead (vohead_id,vohead_misc, vohead_posted, vohead_pohead_id, vohead_docdate)
                               VALUES ( _voheadid,true, false, -1, CURRENT_DATE);

        update vohead 
        SET vohead_number=
	(SELECT (CASE -- use a case here so we don't unnecessarily fetch a new invoice number
			WHEN pNew.voucher_number IS NULL THEN CAST(fetchVoNumber() AS TEXT)
			WHEN pNew.voucher_number = '' THEN CAST(fetchVoNumber() AS TEXT)
			ELSE pNew.voucher_number
		END)),
        vohead_vend_id=(select vend_id from vend where lower(vend_name) = lower(pNew.vendor_name)),   
	vohead_distdate=pNew.distribution_date, 
	vohead_docdate=COALESCE(pNew.voucher_date, CURRENT_DATE), 
	vohead_duedate=pNew.duedate,
	vohead_terms_id=getTermsId(pNew.terms),
	vohead_taxzone_id=(select 
			CASE
			WHEN pNew.tax_zone = 'None' THEN NULL
			ELSE getTaxZoneId(pNew.tax_zone)
		END),
	vohead_invcnumber=pNew.invoice_number,
	vohead_reference=pNew.reference,
	vohead_amount=pNew.voucher_amount, 
	vohead_1099=(select vend_1099 from vend where vend_name = pNew.vendor_name), 
	vohead_curr_id=COALESCE(
	getCurrId(pNew.currency),
	(
			SELECT vend_curr_id
			FROM vend
			WHERE (vend_id=(SELECT getVendId(pNew.vendor_name)))
		),
		basecurrid()),
	vohead_notes=pNew.notes
	WHERE vohead_id=_voheadid;

	--get the tehead_id using the pNew.invoice_number

	SELECT tehead_id into pHeadID from te.tehead where tehead_number = pNew.invoice_number;

        select curr_symbol into _curr from curr_symbol where curr_id = basecurrid();

        _lineInt := 0;
        -- loop thru all lines of the sheet
        for _t in select * from (
          select teitem_id,teitem_linenumber, teitem_workdate as workdate,tehead_site as site,teitem_type,teitem_emp_id,item_number,teitem_item_id,teitem_qty as qty,teitem_rate as rate,teitem_total as total, teitem_notes as notes
          from te.teitem, item, te.tehead
          where item_id = teitem_item_id
          and teitem_tehead_id = tehead_id 
          and teitem_tehead_id = pHeadID 
          and teitem_prepaid = false
          and teitem_type = 'E'
          order by teitem_linenumber
        ) foo

        LOOP
          _lineInt := _lineInt + 1;

          if _notes is not null then
	   _notes := _notes || formatdate(_t.workdate) || E'\t' || _t.item_number || E'\t' || E'\t' || _curr || formatmoney(_t.total) || E'\t' || _t.notes;
          else
	   _notes := formatdate(_t.workdate) || E'\t' || _t.item_number || E'\t' || E'\t' || _curr || formatmoney(_t.total) || E'\t' || _t.notes;
          end if;
          _notes := _notes || E'\n';
             --insert into api.invoiceline(invoice_number, line_number, item_number, site, 
             --qty_ordered, qty_billed, net_unit_price, qty_uom, price_uom, 
             --notes)
             --values(_invcnum,_t.teitem_linenumber,_t.item_number,_t.site,_t.qty,_t.qty,_t.rate,_t.uom,_t.uom,_t.notes);       

	     -- determine the account/exp cat

  	  select teexp_expcat_id,teexp_accnt_id into _u from te.teexp where teexp_id = _t.teitem_item_id;

          -- insert vodist records here
          select nextval('vodist_vodist_id_seq') into _vodistid;

          INSERT INTO vodist ( vodist_id, vodist_vohead_id, vodist_poitem_id,
             vodist_costelem_id, vodist_accnt_id, vodist_amount,
             vodist_expcat_id ) 
             VALUES ( _vodistid, _voheadid, -1,-1, _u.teexp_accnt_id, _t.total,_u.teexp_expcat_id );

          --if version > 3.5, then update the notes field in vodist
          IF (SUBSTRING(fetchMetricText('ServerVersion') FROM 3 FOR 1) >= '5') THEN
            UPDATE vodist SET vodist_notes = _t.notes WHERE vodist_id = _vodistid;
          END IF;
          
          -- update the te.teitem record with the invoice id AND C status
          update te.teitem set teitem_payable_status = 'C' where teitem_id = _t.teitem_id;
            
        END LOOP;
        --update the vohead notes field with the notes from individual expense entries
        update vohead set vohead_notes = _notes where vohead_id = _voheadid;

	RETURN TRUE;
END;
$BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
ALTER FUNCTION te.insertmiscvoucher(te.voucher) OWNER TO "admin";
