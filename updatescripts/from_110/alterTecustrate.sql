ALTER TABLE te.tecustrate DROP CONSTRAINT tecustrate_pkey;
ALTER TABLE te.tecustrate ADD COLUMN tecustrate_id SERIAL PRIMARY KEY;
ALTER TABLE te.tecustrate ADD COLUMN tecustrate_cust_id INTEGER REFERENCES custinfo (cust_id) ON DELETE CASCADE;
UPDATE te.tecustrate SET tecustrate_cust_id = cust_id
FROM custinfo
WHERE (tecustrate_cust_name=cust_name);
ALTER TABLE te.tecustrate DROP COLUMN tecustrate_cust_name;
DELETE FROM te.tecustrate WHERE tecustrate_cust_id IS NULL;
ALTER TABLE te.tecustrate ADD COLUMN tecustrate_curr_id INTEGER NOT NULL DEFAULT baseCurrId() REFERENCES curr_symbol(curr_id) ON DELETE SET DEFAULT;
ALTER TABLE te.tecustrate ADD UNIQUE (tecustrate_cust_id);
GRANT ALL ON SEQUENCE te.tecustrate_tecustrate_id_seq TO xtrole;
