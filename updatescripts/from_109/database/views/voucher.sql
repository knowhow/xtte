-- View: te.voucher

-- DROP VIEW te.voucher;

CREATE OR REPLACE VIEW te.voucher AS 
 SELECT vohead.vohead_number AS voucher_number, pohead.pohead_number AS po_number, vohead.vohead_docdate AS voucher_date, vohead.vohead_posted AS posted, vohead.vohead_duedate AS duedate, vohead.vohead_invcnumber AS invoice_number, vohead.vohead_amount AS voucher_amount, vohead.vohead_distdate AS distribution_date, vohead.vohead_reference AS reference, terms.terms_code AS terms, vend.vend_name AS vendor_name, curr.curr_abbr AS currency, COALESCE(taxzone.taxzone_code, 'None'::text) AS tax_zone, vohead.vohead_misc AS misc, vohead.vohead_notes AS notes
   FROM vohead
   LEFT JOIN pohead ON pohead.pohead_id = vohead.vohead_pohead_id
   LEFT JOIN terms ON terms.terms_id = vohead.vohead_terms_id
   LEFT JOIN vend ON vend.vend_id = vohead.vohead_vend_id
   LEFT JOIN curr_symbol curr ON curr.curr_id = vohead.vohead_curr_id
   LEFT JOIN taxzone ON taxzone.taxzone_id = vohead.vohead_taxzone_id;

ALTER TABLE te.voucher OWNER TO "admin";
GRANT ALL ON TABLE te.voucher TO "admin";
GRANT ALL ON TABLE te.voucher TO xtrole;
COMMENT ON VIEW te.voucher IS '
This view can be used as an interface to import Voucher Header data directly  
into the system.  Required fields will be checked and default values will be 
populated';


-- Rule: ""_RETURN" ON te.voucher"

-- DROP RULE "_RETURN" ON te.voucher;

CREATE OR REPLACE RULE "_RETURN" AS
    ON SELECT TO te.voucher DO INSTEAD  SELECT vohead.vohead_number AS voucher_number, pohead.pohead_number AS po_number, vohead.vohead_docdate AS voucher_date, vohead.vohead_posted AS posted, vohead.vohead_duedate AS duedate, vohead.vohead_invcnumber AS invoice_number, vohead.vohead_amount AS voucher_amount, vohead.vohead_distdate AS distribution_date, vohead.vohead_reference AS reference, terms.terms_code AS terms, vend.vend_name AS vendor_name, curr.curr_abbr AS currency, COALESCE(taxzone.taxzone_code, 'None'::text) AS tax_zone, vohead.vohead_misc AS misc, vohead.vohead_notes AS notes
   FROM vohead
   LEFT JOIN pohead ON pohead.pohead_id = vohead.vohead_pohead_id
   LEFT JOIN terms ON terms.terms_id = vohead.vohead_terms_id
   LEFT JOIN vend ON vend.vend_id = vohead.vohead_vend_id
   LEFT JOIN curr_symbol curr ON curr.curr_id = vohead.vohead_curr_id
   LEFT JOIN taxzone ON taxzone.taxzone_id = vohead.vohead_taxzone_id;


