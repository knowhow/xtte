CREATE OR REPLACE FUNCTION createteprjtask() RETURNS INTEGER AS $$
BEGIN
  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='teprjtask'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN

    -- te.teprjtask table exists
    -- do nothing (this ensures that the table is created as needed.  Revisions should go here

  ELSE  
    CREATE TABLE te.teprjtask
    (
      teprjtask_id serial PRIMARY KEY,
      teprjtask_cust_id integer,
      teprjtask_rate numeric,
      teprjtask_item_id integer REFERENCES item (item_id) ON DELETE SET NULL,
      teprjtask_prjtask_id integer REFERENCES prjtask (prjtask_id) ON DELETE CASCADE,
      teprjtask_curr_id integer DEFAULT basecurrid() REFERENCES curr_symbol (curr_id) ON DELETE SET DEFAULT,
      UNIQUE (teprjtask_prjtask_id)
    );

    GRANT ALL ON TABLE te.teprjtask TO xtrole;
    GRANT ALL ON SEQUENCE te.teprjtask_teprjtask_id_seq TO xtrole;
    COMMENT ON TABLE te.teprjtask IS 't/e information for tasks';

  END IF;
  
  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT createteprjtask();
DROP FUNCTION createteprjtask();