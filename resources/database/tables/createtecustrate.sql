CREATE FUNCTION createtecustrate() RETURNS INTEGER AS $$
BEGIN
  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='tecustrate'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN
    -- te.tecustrate table exists
    -- do nothing (this ensures that the table is created as needed.  Revisions should go here
  ELSE  
    CREATE TABLE te.tecustrate
    (
      tecustrate_cust_id integer NOT NULL PRIMARY KEY,
      tecustrate_rate numeric(16,4) NOT NULL,
      tecustrate_id serial NOT NULL,
      tecustrate_curr_id integer NOT NULL DEFAULT basecurrid() 
          REFERENCES curr_symbol (curr_id) ON DELETE SET DEFAULT,
      FOREIGN KEY (tecustrate_cust_id)
          REFERENCES custinfo (cust_id) ON DELETE CASCADE,
      UNIQUE (tecustrate_cust_id)
    );

  GRANT ALL ON TABLE te.tecustrate TO xtrole;
  COMMENT ON TABLE te.tecustrate IS 'Default Customer Billing rate for Time/Expense';

  END IF;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT createtecustrate();
DROP FUNCTION createtecustrate();

