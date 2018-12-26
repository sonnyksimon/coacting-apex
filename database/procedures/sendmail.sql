create or replace PROCEDURE sendmail ( rcptTo     IN     VARCHAR2, messageSubject     IN     VARCHAR2, messageBody     IN     VARCHAR2) as  
    conn utl_smtp.connection;
    BOUNDARY  VARCHAR2 (256) := '-----090303020209010600070908';
    i         pls_integer;
    len       pls_integer;
    buff_size pls_integer := 57;
    l_raw     raw(57);
    p_image blob;
    mailFrom            VARCHAR2(50) := f_get_config('SMTP_EMAIL');
    MailServer          VARCHAR2(50) := f_get_config('SMTP_SERVER');
    smtpPort            VARCHAR2(50) := f_get_config('SMTP_PORT');    
    l_message           VARCHAR2(32767) :='<html><body>'||messageBody||'</body></html>';
    l_encoded_password varchar2(100);                                        
    l_encoded_username varchar2(100);                                    
begin

    l_encoded_username := UTL_RAW.cast_to_varchar2(UTL_ENCODE.base64_encode(UTL_RAW.cast_to_raw(mailFrom)));  
    l_encoded_password := UTL_RAW.cast_to_varchar2(UTL_ENCODE.base64_encode(UTL_RAW.cast_to_raw(f_get_config('SMTP_PASSWORD'))));  
    conn := UTL_SMTP.open_connection(MailServer, smtpPort);  
    UTL_SMTP.ehlo(conn, MailServer);--DO NOT USE HELO  
    UTL_SMTP.command(conn, 'AUTH', 'LOGIN');  
    UTL_SMTP.command(conn, l_encoded_username);  
    UTL_SMTP.command(conn, l_encoded_password);
    --prepare headers  
      UTL_SMTP.mail(conn, mailFrom);  
      UTL_SMTP.rcpt(conn, rcptTo);  

      --start multi line message  
      UTL_SMTP.open_data(conn);  

      --prepare mail header  
      /*DO NOT USE MON instead of MM in the date pattern if you run the script on machines with different locales as it will be misunderstood  
      and the mail date will appear as 01/01/1970*/  
      UTL_SMTP.write_data(conn, 'MIME-version: 1.0' || UTL_TCP.crlf); 
      UTL_SMTP.write_data(conn, 'Date: ' || TO_CHAR(SYSDATE, 'DD-MM-YYYY HH24:MI:SS') || UTL_TCP.crlf);  
      UTL_SMTP.write_data(conn, 'From: ' || mailFrom || UTL_TCP.crlf);
      UTL_SMTP.write_data(conn, 'Subject: ' || messageSubject || UTL_TCP.crlf || UTL_TCP.crlf);
      UTL_SMTP.write_data(conn, 'To: ' || rcptTo || UTL_TCP.crlf);  
      --UTL_SMTP.write_data(conn, 'Cc: ' || l_ccs || UTL_TCP.crlf);  

      --include the message body  
    UTL_SMTP.write_data (conn, 'Content-Type: multipart/mixed; boundary="' || BOUNDARY || '"' || UTL_TCP.CRLF);
    UTL_SMTP.write_data (conn, UTL_TCP.CRLF);
    UTL_SMTP.write_data (conn,  '--' || BOUNDARY || UTL_TCP.CRLF );
    UTL_SMTP.write_data (conn,  'Content-Type: text/html; charset=US-ASCII'|| UTL_TCP.CRLF );
    UTL_SMTP.write_data (conn, UTL_TCP.CRLF);

    i   := 1;
    len := DBMS_LOB.getLength(l_message);
    WHILE (i < len) LOOP
        utl_smtp.write_raw_data(conn, utl_raw.cast_to_raw(DBMS_LOB.SubStr(l_message,buff_size, i)));
        i := i + buff_size;
    END LOOP;
    --utl_smtp.write_raw_data(l_mail_conn, utl_raw.cast_to_raw('</body></html>'));
    utl_smtp.write_data(conn,  UTL_TCP.CRLF || UTL_TCP.CRLF);

    --UTL_SMTP.write_data (conn, l_message);
    UTL_SMTP.write_data (conn, UTL_TCP.CRLF);
    UTL_SMTP.write_data (conn,  '--' || BOUNDARY || UTL_TCP.CRLF );
    UTL_SMTP.write_data (conn, UTL_TCP.CRLF);  

      --send the email  
      UTL_SMTP.close_data(conn);  
      UTL_SMTP.quit(conn);
end;