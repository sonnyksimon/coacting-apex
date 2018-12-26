create or replace PACKAGE security AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */ 
  function hash_pw (in_pass varchar2, in_salt varchar2) return varchar2;
  function gen_salt return varchar2;
  function check_pw (in_pass varchar2, in_hashed varchar2) return boolean;
  function authenticate (p_username varchar2, p_password varchar2) return boolean;
  procedure p_reset_password (in_username varchar2, in_new_password varchar2 default 'password');
  procedure p_change_password (in_username varchar2, in_old_password varchar2, in_new_password varchar2);
  procedure p_reset_account (in_email varchar2);
  function get_user_id (in_email varchar2) return number;
END security;
