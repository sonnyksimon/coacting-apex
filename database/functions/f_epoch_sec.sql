create or replace function f_epoch_sec(p_date date) return number as
begin
return (p_date - to_date('19700101', 'YYYYMMDD')) * 24 * 60 * 60;
end;
