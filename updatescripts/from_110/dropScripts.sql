UPDATE pkghead SET pkghead_indev = true WHERE pkghead_name = 'te';
DELETE FROM te.pkgscript WHERE script_name = 'telines' AND script_order = 0;
DELETE FROM te.pkgscript WHERE script_name = 'tebilling' AND script_order = 0;
DELETE FROM te.pkgscript WHERE script_name = 'unpostedInvoices' AND script_order = 0;
DELETE FROM te.pkgscript WHERE script_name = 'copyItem' AND script_order = 0;
UPDATE pkghead SET pkghead_indev = false WHERE pkghead_name = 'te';