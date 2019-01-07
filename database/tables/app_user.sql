CREATE TABLE  "APP_USER"
  (	"ID" NUMBER NOT NULL ENABLE,
 "DISPLAY_NAME" VARCHAR2(255) NOT NULL ENABLE,
 "EMAIL" VARCHAR2(255) NOT NULL ENABLE,
 "PASSWORD" VARCHAR2(4000) NOT NULL ENABLE,
 "LOGO_IMAGE" BLOB,
 "CREATED_BY" VARCHAR2(100) NOT NULL ENABLE,
 "CREATED_ON" DATE NOT NULL ENABLE,
 "UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE,
 "UPDATED_ON" DATE NOT NULL ENABLE,
 "PASSWORD_CHANGED" VARCHAR2(10),
 "ACCOUNT_STATUS" VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL ENABLE,
 "VERIFIED_USER" VARCHAR2(100) DEFAULT 'N',
 "SESSION_ID" VARCHAR2(4000),
 "LOGO_MIME" VARCHAR2(200),
 "RESET_CODE" VARCHAR2(100),
 "ID_BLOB" BLOB,
 "ID_MIME" VARCHAR2(100),
 "ADDRESS_PROOF" BLOB,
 "ADDRESS_PROOF_MIME" VARCHAR2(100),
 "ID_FILENAME" VARCHAR2(255),
 "ADDRESS_PROOF_FILENAME" NUMBER,
  CONSTRAINT "APP_USER_ID_PK" PRIMARY KEY ("ID") ENABLE
  ) ;

  CREATE OR REPLACE TRIGGER  "APP_USER_BIU"
     before insert or update
     on app_user
     for each row
  begin
     if inserting then
         :new.password := security.hash_pw(:new.password,security.gen_salt);
         :new.created_by := user;
         :new.created_on := sysdate;
     end if;
     :new.updated_by := user;
     :new.updated_on := sysdate;

   if updating and :new.password <> :old.password then
     select security.hash_pw(:new.password,security.gen_salt) into :new.password from dual;
   end if;

   if dbms_lob.getlength(:new.LOGO_IMAGE) > f_get_config('MAX_IMAGE_SIZE_KB') * 1024 then
     apex_error.add_error (
     p_message          => 'Image size exceeds '||f_get_config('MAX_IMAGE_SIZE_KB')||'KB',
     p_display_location =>  apex_error.c_inline_with_field_and_notif,
     p_page_item_name   => 'P7_LOGO_IMAGE');
     --alert ('Image size exceeds 500KB');
   end if;
  end app_user_biu;
  /
  ALTER TRIGGER  "APP_USER_BIU" ENABLE;
