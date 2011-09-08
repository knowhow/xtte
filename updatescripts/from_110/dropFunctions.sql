UPDATE pkghead SET pkghead_indev = true WHERE pkghead_name = 'te';

CREATE FUNCTION dropInsMisc() RETURNS INTEGER AS $$
BEGIN
  IF (EXISTS(SELECT relname
               FROM pg_class, pg_namespace
              WHERE relname='voucher'
                AND relnamespace=pg_namespace.oid
                AND nspname='te')) THEN

    DROP FUNCTION te.insertmiscvoucher(te.voucher) CASCADE;
  END IF;

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT dropInsMisc();
DROP FUNCTION dropInsMisc();

SELECT dropIfExists('FUNCTION','addsheet(date, date, integer, integer, text, integer, double precision, double precision, double precision, integer, text, integer, integer, character, integer, boolean, boolean, text, text)','te');
SELECT dropIfExists('FUNCTION','addsheet(date, date, integer, integer, text, integer, double precision, double precision, double precision, integer, text, integer, integer, character, integer, boolean, boolean, text, text, integer)','te');
SELECT dropIfExists('FUNCTION','addsheet(date, date, integer, integer, text, integer, double precision, double precision, double precision, integer, text, integer, integer, character, integer, boolean, boolean, text)','te');
SELECT dropIfExists('FUNCTION','deleteline(integer, integer)','te');
SELECT dropIfExists('FUNCTION','deletesheet(integer)','te');
SELECT dropIfExists('FUNCTION','approvesheet(integer)','te');
SELECT dropIfExists('FUNCTION','resetSheetStatus(integer)','te');
SELECT dropIfExists('FUNCTION','setmetric(text, text)','te');
SELECT dropIfExists('FUNCTION','getsheetid(text)','te');
SELECT dropIfExists('FUNCTION','maxline(integer)','te');
SELECT dropIfExists('FUNCTION','minline(integer)','te');
SELECT dropIfExists('FUNCTION','addtecustrate(text, numeric)','te');
SELECT dropIfExists('FUNCTION','addteprj(integer, integer, numeric)','te');
SELECT dropIfExists('FUNCTION','addteprjtask(integer, text, integer, numeric, integer)','te');
SELECT dropIfExists('FUNCTION','addteemprate(integer, numeric)','te');
SELECT dropIfExists('FUNCTION','getprjcustid(text)','te');
SELECT dropIfExists('FUNCTION','getprjcustid(integer)','te');
SELECT dropIfExists('FUNCTION','invoicesheet(integer)','te');
SELECT dropIfExists('FUNCTION','consolidateinvoice(integer)','te');

UPDATE pkghead SET pkghead_indev = false WHERE pkghead_name = 'te';