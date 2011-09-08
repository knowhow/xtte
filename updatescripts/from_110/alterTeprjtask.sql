ALTER TABLE te.teprjtask DROP CONSTRAINT teprjtask_pkey;
ALTER TABLE te.teprjtask ADD COLUMN teprjtask_id SERIAL PRIMARY KEY;
ALTER TABLE te.teprjtask ADD COLUMN teprjtask_curr_id INTEGER DEFAULT baseCurrId() REFERENCES curr_symbol ON DELETE SET DEFAULT;
ALTER TABLE te.teprjtask ADD COLUMN teprjtask_prjtask_id INTEGER REFERENCES public.prjtask(prjtask_id) ON DELETE CASCADE;
UPDATE te.teprjtask SET
  teprjtask_prjtask_id=prjtask_id
FROM prj
 JOIN public.prjtask ON (prj_id=prjtask_id)
WHERE ((prj_id=teprjtask_prj_id)
 AND (prjtask_number=teprjtask_prjtask_number));
ALTER TABLE te.teprjtask DROP COLUMN teprjtask_prj_id;
ALTER TABLE te.teprjtask DROP COLUMN teprjtask_prjtask_number;
ALTER TABLE te.teprjtask ADD UNIQUE (teprjtask_prjtask_id);
UPDATE te.teprjtask SET teprjtask_item_id = NULL WHERE teprjtask_item_id = -1;
ALTER TABLE te.teprjtask ADD FOREIGN KEY (teprjtask_item_id) REFERENCES item (item_id) ON DELETE SET NULL;
GRANT ALL ON TABLE te.teprjtask_teprjtask_id_seq TO xtrole;