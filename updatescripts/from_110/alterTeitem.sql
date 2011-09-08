ALTER TABLE te.teitem ADD COLUMN teitem_vodist_id INTEGER REFERENCES vodist(vodist_id) ON DELETE SET NULL;
ALTER TABLE te.teitem ADD COLUMN teitem_posted BOOLEAN DEFAULT FALSE;
ALTER TABLE te.teitem ADD FOREIGN KEY (teitem_tehead_id) REFERENCES te.tehead (tehead_id) ON DELETE CASCADE;
ALTER TABLE te.teitem DROP COLUMN teitem_username;
ALTER TABLE te.teitem DROP COLUMN teitem_emp_id;
ALTER TABLE te.teitem ADD COLUMN teitem_curr_id INTEGER NOT NULL DEFAULT baseCurrId() REFERENCES curr_symbol(curr_id) ON DELETE SET DEFAULT;
ALTER TABLE te.teitem DROP COLUMN teitem_prj_id;
ALTER TABLE te.teitem ADD COLUMN teitem_invcitem_id INTEGER REFERENCES invcitem (invcitem_id) ON DELETE SET NULL;
ALTER TABLE te.teitem ADD COLUMN teitem_postedvalue NUMERIC NOT NULL DEFAULT 0;

CREATE FUNCTION alterteitem() RETURNS INTEGER AS $$
BEGIN
  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='teitem'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN

    IF (EXISTS(SELECT attname
                 FROM pg_attribute
                WHERE attrelid=(SELECT oid FROM pg_class WHERE relname='teitem')
                  AND attname='teitem_invchead_id')) THEN
      UPDATE te.teitem SET teitem_invcitem_id = invcitem_id
      FROM invcitem WHERE teitem_invchead_id = invcitem_invchead_id AND teitem_linenumber = invcitem_linenumber;
      ALTER TABLE te.teitem DROP COLUMN teitem_billable_status;
      ALTER TABLE te.teitem DROP COLUMN teitem_payable_status;
      ALTER TABLE te.teitem DROP COLUMN teitem_invchead_id;
    END IF;   
  END IF;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT alterteitem();
DROP FUNCTION alterteitem();