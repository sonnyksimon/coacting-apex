create or replace PACKAGE BODY security AS

  function hash_pw (in_pass varchar2, in_salt varchar2) return varchar2 as
    begin
      return sha256.hashpw(in_pass, in_salt);
    end hash_pw;

  function gen_salt return varchar2 as
    begin
      return sha256.gensalt;
    end gen_salt;

  function check_pw (in_pass varchar2, in_hashed varchar2) return boolean as
    begin
      return sha256.checkpw(in_pass, in_hashed);
    end check_pw;

    function authenticate (p_username varchar2, p_password varchar2) return boolean 
    as
        v_username varchar2(100);
        v_password varchar2(255);

    begin

        begin
            select email, password
            into v_username, v_password
            from app_user
            where upper(email) = upper(p_username);
        exception when no_Data_found then
            return false;
        end;

        if security.check_pw(p_password,v_password) <> false then
            return true;
        else
            return false;
        end if; 

    end authenticate;

--------------------------------------------------------------------------------
  procedure p_reset_password (in_username varchar2, in_new_password varchar2 default 'password') as

    V_PASSWORD VARCHAR2(4000);
    BEGIN
      UPDATE APP_USER SET 
      PASSWORD_CHANGED=case when in_new_password = 'password' then 'N' else 'Y' end, 
      PASSWORD = in_new_password,reset_code=''
      where upper(email) = upper(IN_USERNAME);

    end p_reset_password;
--------------------------------------------------------------------------------
      procedure p_change_password (in_username varchar2, in_old_password varchar2, in_new_password varchar2) as
        v_password varchar2(200);
      begin

        if in_new_password = 'password' then
            alert ('New Password cannot be set to password');
        end if;
        begin
            select password
            into v_password
            from app_user
            where upper(email) = upper(in_username);
        exception when no_Data_found then
            alert ('User account not found.');
        end;

        if security.check_pw(in_old_password,v_password) <> false then
            security.p_reset_password (in_username, in_new_password);
        else
            alert ('Your current password is incorrect.');            
        end if; 
      end;
--------------------------------------------------------------------------------

    procedure p_reset_account (IN_EMAIL VARCHAR2) as

    v_reset_code varchar2(200);
    v_message varchar2(1000);
    v_mail_id number;
    begin

    for i in (select * from app_user where upper(email) = trim(upper(in_email))) loop

      v_reset_code:=dbms_random.string('A', 30);

      update app_user set reset_code = v_reset_code where id = i.id;

          v_message := 'A password reset request has been received.<br />
                        Your Username is '||i.email||'<br /><br />
                        Click the link below to reset your password.<br /><br />
                        Your password will be set to <b>"password"</b> (without quotes) after you click the link.<br /><br />

                        After you click the link use:<br /><br />

                        Username: '||i.email||'<br />
                        Password: password<br /><br />
                        <a href="'||f_get_config('BASE_URL')||'f?p=146:login:99999999999999::NO::P13_CODE:'||v_reset_code||'">Reset Account</a>';

          APEX_MAIL.SEND(
            p_to        => ''||lower(i.email)||'',
            p_from      => 'bot@coacting.org',
            p_subj      => 'coacting.org - Password Reset' ,
            p_body      => ' ',
            p_body_html => v_message);

            APEX_MAIL.PUSH_QUEUE;

    end loop;

  end p_reset_account;

  function get_user_id (in_email varchar2) return number as
  v_id number;
  begin

    begin
    select id into v_id from app_user where upper(email) = upper(in_email);
    exception when no_data_found then
        return null;
    end;

    return v_id;
  end;

END security;
