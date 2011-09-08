CREATE FUNCTION createteemp() RETURNS INTEGER AS $$
BEGIN
  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='teemp'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN

    -- te.teemp table exists
    -- do nothing (this ensures that the table is created as needed.  Revisions should go here

  ELSE  
    CREATE TABlE te.teemp
    (
      teemp_id serial,
      teemp_emp_id integer REFERENCES emp (emp_id) ON DELETE CASCADE,
      teemp_contractor boolean default false
    );

    GRANT ALL ON TABLE te.teemp TO xtrole;
    GRANT ALL ON SEQUENCE te.teemp_teemp_id_seq TO xtrole;

  END IF;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT createteemp();
DROP FUNCTION createteemp();