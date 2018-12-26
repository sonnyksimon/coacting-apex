create or replace function f_get_config(in_config_name varchar2) return varchar2 as

begin

    for i in (select * from app_config where upper(config_name) = upper(in_config_name)) loop

        return i.config_val;
    end loop;

end;
