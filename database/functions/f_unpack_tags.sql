create or replace function f_unpack_tags(p_string varchar2) return varchar2 as
  v_string varchar2(1024) := '';
  v_arr apex_application_global.vc_arr2;
  v_temp varchar2(1024) := '';
begin
  v_arr := apex_util.string_to_table(p_string,':');

  for i in 1 .. v_arr.count loop
    select tag_name into v_temp from tag where id=v_arr(i);
    v_string := v_string || ',' || v_temp;
  end loop;
 
  return  substr(v_string,2);
exception when others then return '';
end;
