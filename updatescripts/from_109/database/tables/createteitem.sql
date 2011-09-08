-- Table: te.teitem

-- DROP TABLE te.teitem;



CREATE FUNCTION createteitem() RETURNS INTEGER AS $$
DECLARE
  _statement TEXT := '';
  _version   TEXT := '';
BEGIN
  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='teitem'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN

    IF (EXISTS(SELECT attname
                 FROM pg_attribute
                WHERE attrelid=(SELECT oid FROM pg_class WHERE relname='tehead')
                  AND attname='tehead_status')) THEN
      ALTER TABLE te.teitem ADD teitem_billable_status character(1);
      ALTER TABLE te.teitem ADD teitem_invchead_id integer;
      ALTER TABLE te.teitem ADD teitem_payable_status character(1);
      COMMENT ON COLUMN te.teitem.teitem_billable_status IS 'Status for Invoicing.  A is Approved, P is Pending, C is Complete.';
      COMMENT ON COLUMN te.teitem.teitem_payable_status IS 'Status of Payment.  A is Approved, P is Pending, C is Complete - Used for payment of reimbursable expense items';

      UPDATE te.teitem set teitem_billable_status = teitem_status, teitem_payable_status = teitem_status;

      ALTER TABLE te.teitem DROP teitem_status;
    END IF;    

  ELSE  
    _statement = 'CREATE TABLE te.teitem ' ||
			'( teitem_id serial NOT NULL,  ' ||
			'teitem_tehead_id integer, ' ||
			'teitem_linenumber integer NOT NULL, ' ||
			'teitem_type character(1) NOT NULL, ' ||
			'teitem_workdate date, ' ||
			'teitem_emp_id integer NOT NULL, ' ||
			'teitem_cust_id integer, ' ||
			'teitem_vend_id integer, ' ||
			'teitem_po text, ' ||
			'teitem_item_id integer NOT NULL, ' ||
			'teitem_qty numeric NOT NULL, ' ||
			'teitem_rate numeric NOT NULL, ' ||
			'teitem_total numeric NOT NULL, ' ||
			'teitem_prj_id numeric, ' ||
			'teitem_prjtask_id numeric, ' ||
			'teitem_lastupdated timestamp without time zone NOT NULL DEFAULT (''now''::text)::timestamp(6) with time zone, ' ||
			'teitem_username text DEFAULT "current_user"(), ' ||
			'teitem_billable boolean, ' ||
			'teitem_prepaid boolean, ' ||
			'teitem_billable_status character(1), ' ||
			'teitem_invchead_id integer, ' ||
			'teitem_payable_status character(1), ' ||
			'teitem_uom_id integer, ' ||
			'teitem_notes text, ' ||
			'CONSTRAINT teitem_pkey PRIMARY KEY (teitem_id) ) ' ||
			'WITH (OIDS=FALSE); ' ||
			'ALTER TABLE te.teitem OWNER TO "admin"; ' ||
			'GRANT ALL ON TABLE te.teitem TO "admin"; ' ||
			'GRANT ALL ON TABLE te.teitem TO xtrole; ' ||
			'COMMENT ON TABLE te.teitem IS ''time/expense detail''; ' ||
			'COMMENT ON COLUMN te.teitem.teitem_type IS ''T or E''; ' ||
			'COMMENT ON COLUMN te.teitem.teitem_vend_id IS ''future use - for payment of vendor for expenses''; ' ||
			'COMMENT ON COLUMN te.teitem.teitem_prepaid IS ''Used for expenses only.  CC paid expenses would be prepaid.''; ' ||
			'COMMENT ON COLUMN te.teitem.teitem_billable_status IS ''Status for invoicing - A is approved, P is Pending, C is complete''; ' ||
			'COMMENT ON COLUMN te.teitem.teitem_payable_status IS ''Status for Vouchering.  A is approved, P is Pending, C is complete - This is for reimbursable expense items.''; ';

  END IF;

  EXECUTE _statement;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT createteitem();
DROP FUNCTION createteitem();



