create or replace function f_get_vote_total (p_post_id number) return number as
  v_downvotes number := 0;
  v_upvotes number:= 0;
begin
  begin
    select count(1) into v_downvotes 
    from post_reaction 
    where post_id = p_post_id 
    and upper(reaction_type) = 'DOWNVOTE';
  exception when others then v_downvotes := 0;  
  end;

  begin
    select count(1) into v_upvotes
    from post_reaction
    where post_id = p_post_id
    and upper(reaction_type) = 'UPVOTE';
  exception when others then v_upvotes := 0;
  end;

  return v_upvotes - v_downvotes;

end;
