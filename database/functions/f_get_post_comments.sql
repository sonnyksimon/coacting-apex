create or replace function f_get_post_comments(p_in_post_id number) return number as
  v_retval number;
begin

  begin
    select count(1) into v_retval
    from post_comment
    where post_id = p_in_post_id;
  exception when others then v_retval := 0;
  end;

  return nvl(v_retval,0);

end;