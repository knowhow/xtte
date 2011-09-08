-- Function: te.invoicesheet(integer)

-- DROP FUNCTION te.invoicesheet(integer);

CREATE OR REPLACE FUNCTION te.invoicesheet(integer)
  RETURNS integer AS
$BODY$
DECLARE
_headid int;
_invcnum text;
_s record;
_t record;
_linenum text;
_lineInt int;
_item text;
pHeadID ALIAS FOR $1;

BEGIN

_headid := pHeadID;

        -- note that we are putting a very basic workflow in place here
        --  A is approved...if further approval is needed (mgr, etc) then the status should goto P
       for _s in select * from (
       select tehead_id,tehead_number,tehead_weekending,cust_number,cust_id,teitem_po, prj_number,prj_id
       from te.tehead,cust,te.teitem,prj
       where tehead_id = pHeadID
       and prj_id = teitem_prj_id
       and tehead_id = teitem_tehead_id
       and cust_id = teitem_cust_id
       group by tehead_id,tehead_number,teitem_po,prj_number,prj_id,tehead_weekending,cust_number,cust_id
       ) foo

       -- loop thru records and create invoices by customer, by PO for the provided headid
       LOOP
         --select nextval('invchead_invchead_id_seq') into _invcid;
         select CAST(fetchInvcNumber() AS TEXT) into _invcnum;
         
         insert into api.invoice(invoice_number,invoice_date, ship_date, order_date, 
         customer_number, po_number, project_number)
         values (_invcnum,CURRENT_DATE,CURRENT_DATE,CURRENT_DATE,_s.cust_number,_s.teitem_po,_s.prj_number );

          -- update the te.tehead record with C status
          update te.tehead set tehead_billable_status = 'C' where tehead_id = pHeadID;

         _lineInt := 0;
          -- loop thru all lines of the sheet
          for _t in select * from (
             select teitem_id,teitem_linenumber, tehead_site as site,teitem_type,teitem_emp_id,uom_name as uom,item_number,teitem_cust_id,teitem_po,teitem_item_id,teitem_qty as qty,teitem_rate as rate,teitem_prj_id, teitem_notes as notes
             from te.teitem, item, te.tehead, uom
             where item_id = teitem_item_id
             and teitem_uom_id = uom_id
             and teitem_tehead_id = tehead_id 
             and teitem_tehead_id = pHeadID 
             and teitem_billable = true 
             and teitem_type = 'E'
             and teitem_cust_id = _s.cust_id
             and teitem_po = _s.teitem_po
             and teitem_prj_id = _s.prj_id
             or teitem_tehead_id = pHeadID 
             and teitem_tehead_id = tehead_id
             and item_id = teitem_item_id
             and teitem_uom_id = uom_id
	     and teitem_billable = true 
             and teitem_type = 'T' 
             and item_id = teitem_item_id
             and teitem_cust_id = _s.cust_id
             and teitem_po = _s.teitem_po
             and teitem_prj_id = _s.prj_id
             order by teitem_linenumber
          ) foo

          LOOP
            --raise notice 'line %',_t.teitem_linenumber;

            _lineInt := _lineInt + 1;
            insert into api.invoiceline(invoice_number, line_number, item_number, site, 
            qty_ordered, qty_billed, net_unit_price, qty_uom, price_uom, 
            notes)
            values(_invcnum,_t.teitem_linenumber,_t.item_number,_t.site,_t.qty,_t.qty,_t.rate,_t.uom,_t.uom,_t.notes);       

            -- update the te.teitem record with the invoice id AND C status
            update te.teitem set teitem_invchead_id = getinvcheadid(_invcnum), teitem_billable_status = 'C' where teitem_id = _t.teitem_id;
            
          END LOOP;
       END LOOP;

RETURN 1;
END;
$BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
ALTER FUNCTION te.invoicesheet(integer) OWNER TO "admin";
