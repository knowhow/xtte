-- Function: te.approvesheet(integer)

-- DROP FUNCTION te.approvesheet(integer);

CREATE OR REPLACE FUNCTION te.approvesheet(integer)
  RETURNS integer AS
$BODY$
DECLARE
_headid int;
_t record;
pHeadID ALIAS FOR $1;

BEGIN

_headid := pHeadID;

        -- note that we are putting a very basic workflow in place here
        --  A is approved...if further approval is needed (mgr, etc) then the status should goto P

	--update the timestamp/user on both tables
        update te.tehead set tehead_billable_status = 'A',tehead_payable_status = 'A', tehead_lastupdated = ('now'::text)::timestamp(6) with time zone,tehead_username = current_user where tehead_id = pHeadID;
        update  te.teitem set teitem_billable_status = 'A',teitem_payable_status = 'A',teitem_lastupdated = ('now'::text)::timestamp(6) with time zone,teitem_username = current_user where teitem_tehead_id = pHeadID;

        --for each line, update each project/task with the hours/expenses
       -- loop thru all lines of the sheet
          for _t in select * from (
	     select sum(qty) as qty,sum(expense) as expense,taskid from
             (select teitem_linenumber,teitem_qty as qty,teitem_total as expense,teitem_prjtask_id as taskid
             from te.teitem
             where teitem_tehead_id = pHeadID
             and teitem_type = 'T'
             --and teitem_billable
	     union
             select teitem_linenumber,0 as qty,teitem_total as expense,teitem_prjtask_id as taskid
             from te.teitem
             where teitem_tehead_id = pHeadID
             and teitem_type = 'E'
             --and teitem_billable
             order by teitem_linenumber) foobar
             group by taskid
          ) foo

          LOOP
            -- update the te.teitem record with the invoice id AND C status
            update prjtask set prjtask_hours_actual = prjtask_hours_actual + _t.qty,
            prjtask_exp_actual = prjtask_exp_actual + _t.expense
            where prjtask_id = _t.taskid;
            
          END LOOP;

RETURN 1;
END;
$BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
ALTER FUNCTION te.approvesheet(integer) OWNER TO "admin";
