CREATE FUNCTION createteprj() RETURNS INTEGER AS $$
BEGIN
  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='teprj'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN

    -- Future changes here

  ELSE  
    CREATE TABLE te.teprj
    (
      teprj_id serial PRIMARY KEY,
      teprj_prj_id integer,
      teprj_cust_id integer REFERENCES custinfo (cust_id) ON DELETE SET NULL,
      teprj_rate numeric,
      teprj_curr_id integer REFERENCES curr_symbol (curr_id)  ON DELETE SET NULL
    );

    GRANT ALL ON TABLE te.teprj TO xtrole;
    GRANT ALL ON SEQUENCE te.teprj_teprj_id_seq TO xtrole;
    COMMENT ON TABLE te.teprj IS 't/e information for projects';

  END IF;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT createteprj();
DROP FUNCTION createteprj();


