UPDATE pkghead SET pkghead_indev = true WHERE pkghead_name = 'te';
DELETE FROM te.pkgscript WHERE script_name='projects';
UPDATE pkghead SET pkghead_indev = false WHERE pkghead_name = 'te';