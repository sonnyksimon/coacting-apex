create or replace function f_hot_rating(p_post_id number) return number
as
  v_downs number := f_downs(p_post_id);
  v_ups number := f_ups(p_post_id);
  v_today date := sysdate;
  v_epoch number;
  v_score number;
  v_order number;
  v_sign number;
  v_seconds number;
begin
  v_epoch := f_epoch_sec(v_today);
  v_score := v_ups - v_downs;
  v_order := log(10, greatest(abs(v_score), 1));

  if v_score > 0 then
    v_sign := 1;
  elsif v_score < 0 then
    v_sign := -1;
  else
    v_sign := 0;
  end if;

  v_seconds := v_epoch - 1134028003;

  return nvl(round(v_sign * v_order + v_seconds, 7), 0);
end;
