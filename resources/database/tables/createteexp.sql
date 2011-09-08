CREATE FUNCTION createteexp() RETURNS INTEGER AS $$
BEGIN
  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='teexp'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN

    -- te.teexp table exists
    -- do nothing (this ensures that the table is created as needed.  Revisions should go here

  ELSE  
    CREATE TABLE te.teexp
    (
      teexp_id integer PRIMARY KEY,
      teexp_expcat_id integer,
      teexp_accnt_id integer
    );

    GRANT ALL ON TABLE te.teexp TO xtrole;
    COMMENT ON TABLE te.teexp IS 'Expense/Item';

  END IF;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT createteexp();
DROP FUNCTION createteexp();

