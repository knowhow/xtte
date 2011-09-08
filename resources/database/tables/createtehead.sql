CREATE FUNCTION createtehead() RETURNS INTEGER AS $$
BEGIN

  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='tehead'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN
      -- Future Alterations here
  ELSE  
    CREATE SEQUENCE te.timesheet_seq START 1000; 
    GRANT ALL ON TABLE te.timesheet_seq TO xtrole;

    CREATE TABLE te.tehead
    (
      tehead_id serial NOT NULL PRIMARY KEY,
      tehead_number text DEFAULT nextval('te.timesheet_seq'::regclass),
      tehead_weekending date,
      tehead_lastupdated timestamp without time zone NOT NULL DEFAULT now(),
      tehead_notes text,
      tehead_status character(1) NOT NULL DEFAULT 'O'::bpchar,
      tehead_emp_id integer,
      tehead_warehous_id integer NOT NULL,
      tehead_username text NOT NULL DEFAULT current_user,
      CHECK (tehead_status = ANY (ARRAY['O'::bpchar, 'A'::bpchar, 'C'::bpchar]))
    );
    GRANT ALL ON TABLE te.tehead TO xtrole;
    COMMENT ON TABLE te.tehead IS 'time/expense header';

    GRANT ALL ON SEQUENCE te.tehead_tehead_id_seq TO xtrole;
  END IF;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT createtehead();
DROP FUNCTION createtehead();


