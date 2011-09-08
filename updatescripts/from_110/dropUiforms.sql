UPDATE pkghead SET pkghead_indev = true WHERE pkghead_name = 'te';
DELETE FROM te.pkguiform WHERE uiform_name = 'telines' AND uiform_order = 0;
DELETE FROM te.pkguiform WHERE uiform_name = 'tebillingemp' AND uiform_order = 0;
UPDATE pkghead SET pkghead_indev = false WHERE pkghead_name = 'te';