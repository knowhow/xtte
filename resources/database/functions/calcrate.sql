CREATE OR REPLACE FUNCTION te.calcrate(numeric, char(2)) RETURNS numeric AS $$
DECLARE
pAmount ALIAS FOR $1;
pPeriod ALIAS FOR $2;
_state integer;
_count integer;

BEGIN
  -- Convert amount to hourly rate
  IF (pPeriod = 'H') THEN  -- hourly
    RETURN round(pAmount,2);
  ELSIF (pPeriod = 'D') THEN -- daily
    RETURN round(pAmount / 8, 2);
  ELSIF (pPeriod = 'W') THEN  -- weekly
    RETURN round(pAmount / 40, 2);
  ELSIF (pPeriod = 'BW') THEN  -- bi-weekly
    RETURN round(pAmount / 80, 2);
  ELSIF (pPeriod = 'M') THEN -- monthly
    RETURN round(pAmount / 160, 2);
  ELSIF (pPeriod = 'Y') THEN -- annually 
    RETURN round(pAmount / 2080, 2);
  ELSE
    RAISE EXCEPTION 'Unknown period type passed: %', pPeriod;
  END IF;

END;
$$ LANGUAGE 'plpgsql';
