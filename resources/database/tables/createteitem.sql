CREATE FUNCTION createteitem() RETURNS INTEGER AS $$
BEGIN

  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='teitem'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN

    -- Future changes here


  ELSE  
    CREATE TABLE te.teitem
    (
      teitem_id serial PRIMARY KEY,
      teitem_tehead_id integer REFERENCES te.tehead (tehead_id) ON DELETE CASCADE,
      teitem_linenumber integer NOT NULL,
      teitem_type character(1) NOT NULL, -- T or E
      teitem_workdate date,
      teitem_cust_id integer,
      teitem_vend_id integer, -- future use - for payment of vendor for expenses
      teitem_po text,
      teitem_item_id integer NOT NULL,
      teitem_qty numeric NOT NULL,
      teitem_rate numeric NOT NULL,
      teitem_total numeric NOT NULL,
      teitem_prjtask_id numeric,
      teitem_lastupdated timestamp without time zone NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
      teitem_billable boolean,
      teitem_prepaid boolean, -- Used for expenses only.  CC paid expenses would be prepaid.
      teitem_notes text,
      teitem_posted boolean DEFAULT false,
      teitem_curr_id integer NOT NULL DEFAULT basecurrid() REFERENCES curr_symbol (curr_id) ON DELETE SET DEFAULT,
      teitem_uom_id integer,
      teitem_invcitem_id integer REFERENCES invcitem (invcitem_id) ON DELETE SET NULL,
      teitem_vodist_id integer  REFERENCES vodist (vodist_id)  ON DELETE SET NULL,
      teitem_postedvalue numeric NOT NULL DEFAULT 0
    );

     GRANT ALL ON TABLE te.teitem TO xtrole;
     COMMENT ON TABLE te.teitem IS 'time/expense detail';
     COMMENT ON COLUMN te.teitem.teitem_type IS 'T or E';
     COMMENT ON COLUMN te.teitem.teitem_vend_id IS 'future use - for payment of vendor for expenses';
     COMMENT ON COLUMN te.teitem.teitem_prepaid IS 'Used for expenses only.  CC paid expenses would be prepaid.';

     GRANT ALL ON SEQUENCE te.teitem_teitem_id_seq TO xtrole;

  END IF;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT createteitem();
DROP FUNCTION createteitem();



