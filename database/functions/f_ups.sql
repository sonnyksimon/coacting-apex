create or replace function f_ups(p_post_id number) return number
as
v_count number;
begin
  select count(1) into v_count from post_reaction where post_id = p_post_id and lower(reaction_type) like '%up%';
  return nvl(v_count,0);
end;
