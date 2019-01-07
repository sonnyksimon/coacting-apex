create or replace function f_confidence_rating(p_post_id number) return number
as
  v_downs number := f_downs(p_post_id);
  v_ups number := f_ups(p_post_id);
  v_cr float := 0.0;
begin

  if v_ups + v_downs <= 0 then
    return 0;
  end if;

  v_cr := ((v_ups + 1.9208) / (v_ups + v_downs) -
                   1.96 * SQRT((v_ups * v_downs) / (v_ups + v_downs) + 0.9604) /
                          (v_ups + v_downs)) / (1 + 3.8416 / (v_ups + v_downs)) ;

  return nvl(v_cr,0);

end;
