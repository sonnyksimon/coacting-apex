create or replace FUNCTION f_get_feedback_score
(
  IN_APP_USER_ID IN NUMBER 
) RETURN NUMBER AS 

v_score number;
BEGIN
  --select nvl(sum (experience_score),1) into v_score from app_user_feedback where app_user_id = IN_APP_USER_ID;

  return 0;
END f_get_feedback_score;


