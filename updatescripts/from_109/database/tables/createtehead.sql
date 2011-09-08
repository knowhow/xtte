

CREATE FUNCTION createtehead() RETURNS INTEGER AS $$
DECLARE
  _statement TEXT := '';
  _version   TEXT := '';
BEGIN
  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='tehead'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN

    IF (EXISTS(SELECT attname
                 FROM pg_attribute
                WHERE attrelid=(SELECT oid FROM pg_class WHERE relname='tehead')
                  AND attname='tehead_status')) THEN
      ALTER TABLE te.tehead ADD tehead_billable_status character(1);
      ALTER TABLE te.tehead ADD tehead_payable_status character(1);
      COMMENT ON COLUMN te.tehead.tehead_billable_status IS 'Status for Invoicing.  A is Approved, P is Pending, C is Complete.';
      COMMENT ON COLUMN te.tehead.tehead_payable_status IS 'Status of Payment.  A is Approved, P is Pending, C is Complete - Used for payment of reimbursable expense items';

      UPDATE te.tehead set tehead_billable_status = tehead_status, tehead_payable_status = tehead_status;

      ALTER TABLE te.tehead DROP tehead_status;
    END IF;
  ELSE  
    _statement = 'CREATE TABLE te.tehead ' ||
			'(  tehead_id serial NOT NULL, ' ||
			'tehead_site text, ' ||
			'tehead_number text, ' ||
			'tehead_weekending date, ' ||
			'tehead_lastupdated timestamp without time zone NOT NULL DEFAULT (''now''::text)::timestamp(6) with time zone, ' ||
			'tehead_username text DEFAULT "current_user"(), ' ||
			'tehead_billable_status character(1), ' ||
			'tehead_payable_status character(1), ' ||
			'tehead_notes text, ' ||
			'  CONSTRAINT tehead_pkey PRIMARY KEY (tehead_id) ) ' ||
			'WITH (OIDS=FALSE); ' ||
			'ALTER TABLE te.tehead OWNER TO "admin"; ' ||
			'GRANT ALL ON TABLE te.tehead TO "admin"; ' ||
			'GRANT ALL ON TABLE te.tehead TO xtrole; ' ||
			'COMMENT ON TABLE te.tehead IS ''time/expense header''; ' ||
			'COMMENT ON COLUMN te.tehead.tehead_billable_status IS ''Status for Invoicing.  A is Approved, P is Pending, C is Complete.''; ' || 
			'COMMENT ON COLUMN te.tehead.tehead_payable_status IS ''Status of Payment.  A is Approved, P is Pending, C is Complete - Used for payment of reimbursable expense items''; ';

  END IF;

  EXECUTE _statement;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT createtehead();
DROP FUNCTION createtehead();


