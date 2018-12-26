create or replace FUNCTION f_get_displayname 
(
  IN_ID IN NUMBER 
) RETURN VARCHAR2 AS 
v_name varchar2(1000);
BEGIN

  for i in  (select * from app_user where id = in_id) loop

    v_name := i.display_name;

  end loop;

  return v_name;

END;