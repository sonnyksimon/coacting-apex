create or replace PROCEDURE alert (IN_MSG VARCHAR2) AS 
begin
  --RAISE_APPLICATION_ERROR(-20011,IN_MSG);
  apex_error.add_error (
    p_message          => IN_MSG,
    p_display_location => apex_error.c_inline_in_notification );
END alert;
