UPDATE pkghead SET pkghead_indev = true WHERE pkghead_name = 'te';
DELETE FROM te.pkgscript WHERE script_name IN ('te','tesheet','time_expense');
UPDATE pkghead SET pkghead_indev = false WHERE pkghead_name = 'te';