create or replace function f_controversy_rating(p_post_id number) return number
as
  v_downs number := f_downs(p_post_id);
  v_ups number := f_ups(p_post_id);
  v_magnitude number := 0;
  v_balance float := 0.0;
begin
  if (v_downs <= 0 or v_ups <= 0) then
    return 0;
  end if;

  v_magnitude := v_ups + v_downs;
  v_balance := case when (v_ups > v_downs) then v_ups/v_downs else v_downs/v_ups end;

  return nvl(v_magnitude * v_balance, 0);
exception when others then return 0;
end;
