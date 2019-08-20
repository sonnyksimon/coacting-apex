create or replace procedure blob2inline (p_table varchar2, p_blob varchar2, p_name varchar2, p_mimetype varchar2, p_key varchar2, p_id varchar2)
is
v_blob blob;
v_name varchar2(64);
v_mimetype varchar2(64);
v_length number;
begin
    begin
        execute immediate 'select '||p_blob||','||p_name||','||p_mimetype||',dbms_lob.getlength('||p_blob||') from '||p_table||' where '||p_key||'='''||p_id||'''' into v_blob,v_name,v_mimetype,v_length;
    exception when no_data_found then
        raise_application_error(-20010,'Oops. Something went wrong');
    end;
    if v_length > 0 then
        sys.htp.init();
        sys.owa_util.mime_header(
            nvl(v_mimetype, 'application/octet'),
            false
        );
        sys.htp.p('Cache-Control: max-age=36000');
        sys.htp.p('Content-Length: ' || v_length);
        sys.htp.p('Content-Disposition: inline; filename="'||apex_escape.html(v_name)||'"; filename*=UTF-8'''''||apex_escape.html(v_name));
        sys.owa_util.http_header_close();
        sys.wpg_docload.download_file(v_blob);
        apex_application.stop_apex_engine;
    else
        apex_util.redirect_url('https://raw.githubusercontent.com/sonnyksimon/coacting-apex/master/application/webscrape/r/nexus_hacksolve/146/files/static/v6/user.png');
    end if;
end blob2inline;
