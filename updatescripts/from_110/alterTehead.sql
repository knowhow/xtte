ALTER TABLE te.tehead ADD COLUMN tehead_status CHAR(1) CHECK (tehead_status IN ('O','A','C'));
UPDATE te.tehead SET tehead_status='C';
ALTER TABLE te.tehead ADD COLUMN tehead_emp_id integer;
UPDATE te.tehead SET tehead_emp_id = COALESCE((SELECT DISTINCT teitem_emp_id FROM te.teitem WHERE teitem_tehead_id=tehead_id),tehead_emp_id);
ALTER TABLE te.tehead ALTER COLUMN tehead_status SET NOT NULL;
ALTER TABLE te.tehead DROP COLUMN tehead_billable_status;
ALTER TABLE te.tehead DROP COLUMN tehead_payable_status;
ALTER TABLE te.tehead ALTER COLUMN tehead_status SET DEFAULT 'O';
ALTER TABLE te.tehead ALTER COLUMN tehead_number SET DEFAULT nextval('te.timesheet_seq');
ALTER TABLE te.tehead ADD COLUMN tehead_warehous_id INTEGER;
UPDATE te.tehead SET tehead_warehous_id=warehous_id
FROM warehous
WHERE warehous_code = tehead_site;
ALTER TABLE te.tehead ALTER COLUMN tehead_warehous_id SET NOT NULL;
ALTER TABLE te.tehead DROP COLUMN tehead_site;
