

CREATE FUNCTION setupPrivs() RETURNS INTEGER AS $$
DECLARE
  _statement TEXT := '';
  _version   TEXT := '';
BEGIN


  IF (EXISTS(SELECT priv_name FROM priv WHERE priv_name  = 'allowInvoicing')) THEN
   --NEXT ACTION
   --raise notice 'found';
  ELSE
	_statement = 'INSERT INTO priv (priv_module, priv_name, priv_descrip) VALUES (''TE'', ''allowInvoicing'', ''Allowed to Invoice Time/Exp Sheets'');';
	EXECUTE _statement;
  END IF;

  _statement := '';

  IF (EXISTS(SELECT priv_name FROM priv WHERE priv_name  = 'allowVouchering')) THEN
   --NEXT ACTION
  -- raise notice 'found';
  ELSE
	_statement = 'INSERT INTO priv (priv_module, priv_name, priv_descrip) VALUES (''TE'', ''allowVouchering'', ''Allowed to Voucher Time/Exp Sheets'');';
	EXECUTE _statement;
  END IF;

  _statement := '';

  IF (EXISTS(SELECT priv_name FROM priv WHERE priv_name  = 'MaintainTimeExpenseOthers')) THEN
   --NEXT ACTION
  -- raise notice 'found';
  ELSE
	_statement = 'INSERT INTO priv (priv_module, priv_name, priv_descrip) VALUES (''TE'', ''MaintainTimeExpenseOthers'', ''Allowed to maintain Time/Exp Sheets for all users'');';
	EXECUTE _statement;
  END IF;

  _statement := '';

  IF (EXISTS(SELECT priv_name FROM priv WHERE priv_name  = 'MaintainTimeExpenseSelf')) THEN
   --NEXT ACTION
  -- raise notice 'found';
  ELSE
	_statement = 'INSERT INTO priv (priv_module, priv_name, priv_descrip) VALUES (''TE'', ''MaintainTimeExpenseSelf'', ''Allowed to maintain Time/Exp Sheets'');';
	EXECUTE _statement;
  END IF;

  _statement := '';

  IF (EXISTS(SELECT priv_name FROM priv WHERE priv_name  = 'MaintainTimeExpense')) THEN
   --NEXT ACTION
  -- raise notice 'found';
  ELSE
	_statement = 'INSERT INTO priv (priv_module, priv_name, priv_descrip) VALUES (''TE'', ''MaintainTimeExpense'', ''Allowed to maintain Time/Exp Sheets'');';
	EXECUTE _statement;
  END IF;

  _statement := '';

  IF (EXISTS(SELECT priv_name FROM priv WHERE priv_name  = 'CanViewRates')) THEN
   --NEXT ACTION
  -- raise notice 'found';
  ELSE
	_statement = 'INSERT INTO priv (priv_module, priv_name, priv_descrip) VALUES (''TE'', ''CanViewRates'', ''Allowed to view rates in the Time Entries'');';
	EXECUTE _statement;
  END IF;

  _statement := '';

  IF (EXISTS(SELECT priv_name FROM priv WHERE priv_name  = 'CanApprove')) THEN
   --NEXT ACTION
  -- raise notice 'found';
  ELSE
	_statement = 'INSERT INTO priv (priv_module, priv_name, priv_descrip) VALUES (''TE'', ''CanApprove'', ''Allowed to Approve Time/Exp Sheets'');';
	EXECUTE _statement;
  END IF;

  

  RETURN 0;
END;
$$ LANGUAGE 'plpgsql';

SELECT setupPrivs();
DROP FUNCTION setupPrivs();




