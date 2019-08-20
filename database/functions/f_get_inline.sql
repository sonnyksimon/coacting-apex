create or replace function f_get_inline(p_app_id number,p_app_session number,p_id varchar2,p_type varchar2) return varchar2
as
v_count number;
begin

    begin
        select count(dbms_lob.getlength(logo_image)) into v_count
        from app_user
        where lower(email) = lower(p_id);
    exception when others then v_count := -1;
    end;

    if p_type = 'APP_USER' and v_count=0 then
        return f_get_config('DEFAULT_USER_IMG');
    else 
        return apex_util.prepare_url('f?p='||p_app_id||':inline:'||p_app_session||'::NO::FILE_ID,FILE_TYPE:'||p_id||','||p_type);
    end if;

end;
