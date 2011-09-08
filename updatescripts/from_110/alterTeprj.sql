ALTER TABLE te.teprj ADD COLUMN teprj_curr_id INTEGER REFERENCES curr_symbol(curr_id) ON DELETE SET NULL;
UPDATE te.teprj SET teprj_curr_id = baseCurrId() WHERE teprj_rate IS NOT NULL;
ALTER TABLE te.teprj ADD FOREIGN KEY (teprj_prj_id) REFERENCES prj (prj_id) ON DELETE CASCADE;
UPDATE te.teprj SET teprj_cust_id=NULL WHERE teprj_cust_id=-1;
ALTER TABLE te.teprj ADD FOREIGN KEY (teprj_cust_id) REFERENCES custinfo (cust_id) ON DELETE SET NULL;
ALTER TABLE te.teprj DROP CONSTRAINT teprj_pkey;
ALTER TABLE te.teprj ADD UNIQUE (teprj_cust_id);
