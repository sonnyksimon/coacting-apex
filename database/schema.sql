CREATE TABLE  "ORGANIZATION" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"REGISTRATION_ID" NUMBER NOT NULL ENABLE, 
	"ADDRESS" VARCHAR2(4000) NOT NULL ENABLE, 
	"PHONE_NUMBER" VARCHAR2(255), 
	"EMAIL" VARCHAR2(255), 
	"CREATOR_ID" NUMBER, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	"TAGS" VARCHAR2(1024), 
	"LOGO_BLOB" BLOB, 
	"LOGO_MIME" VARCHAR2(100), 
	"LOGO_FILENAME" VARCHAR2(100), 
	 CONSTRAINT "ORGANIZATION_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "ORGANIZATION_TAGS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"ORGANIZATION_ID" NUMBER NOT NULL ENABLE, 
	"TAG_ID" NUMBER NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	 CONSTRAINT "ORGANIZATION_TAGS_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "POST" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"POST_NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"POST_DESCRIPTION" VARCHAR2(4000) NOT NULL ENABLE, 
	"POST_TYPE" VARCHAR2(60) DEFAULT 'ISSUE' NOT NULL ENABLE, 
	"POST_STATUS" VARCHAR2(60) DEFAULT 'OPEN' NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	"IMAGE_BLOB" BLOB, 
	"IMAGE_MIME" VARCHAR2(20), 
	"TAG" VARCHAR2(1024), 
	 CONSTRAINT "POST_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "CAUSES" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"DESCRIPTION" VARCHAR2(4000) NOT NULL ENABLE, 
	"SDG_ID" NUMBER NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	 CONSTRAINT "CAUSES_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "ORGANIZATION_CAUSES" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"ORGANIZATION_ID" NUMBER NOT NULL ENABLE, 
	"CAUSE_ID" NUMBER, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	"CAUSE_DESCRIPTION" VARCHAR2(500), 
	"PROBLEM_ID" NUMBER, 
	 CONSTRAINT "ORGANIZATION_CAUSE_ID_PK" PRIMARY KEY ("ID") ENABLE, 
	 CONSTRAINT "ORGANIZATION_CAUSES_UK" UNIQUE ("PROBLEM_ID") ENABLE
   ) ;
 CREATE TABLE  "INTIATIVES" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"CAUSE_ID" NUMBER NOT NULL ENABLE, 
	"DESCRIPTION" VARCHAR2(4000) NOT NULL ENABLE, 
	"START_DATE" DATE NOT NULL ENABLE, 
	"END_DATE" DATE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	 CONSTRAINT "INTIATIVES_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "TAG" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"TAG_NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	 CONSTRAINT "TAG_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "POST_TAGS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"POST_ID" NUMBER NOT NULL ENABLE, 
	"TAG_ID" NUMBER NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	 CONSTRAINT "POST_TAGS_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "POST_COMMENT" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"POST_ID" NUMBER NOT NULL ENABLE, 
	"COMMENT_DESCRIPTION" VARCHAR2(4000) NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	 CONSTRAINT "POST_COMMENT_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "POST_REACTION" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"POST_ID" NUMBER NOT NULL ENABLE, 
	"REACTION_TYPE" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	"REACTING_USER_ID" NUMBER NOT NULL ENABLE, 
	 CONSTRAINT "POST_REACTION_ID_PK" PRIMARY KEY ("ID") ENABLE, 
	 CONSTRAINT "POST_REACTION_CON" UNIQUE ("POST_ID", "CREATED_BY") ENABLE
   ) ;
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
 CREATE TABLE  "ORGANIZATION_USER" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"ORGANIZATION_ID" NUMBER NOT NULL ENABLE, 
	"USER_ID" NUMBER NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	 CONSTRAINT "ORGANIZATION_USER_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "SDGS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"DESCRIPTION" VARCHAR2(4000) NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	"ORGANIZATION_ID" NUMBER NOT NULL ENABLE, 
	 CONSTRAINT "SDGS_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "APP_CONFIG" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"CONFIG_NAME" VARCHAR2(255), 
	"CONFIG_VAL" VARCHAR2(4000), 
	 CONSTRAINT "APP_CONFIG_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 ALTER TABLE  "INTIATIVES" ADD CONSTRAINT "INTIATIVES_FK1" FOREIGN KEY ("CAUSE_ID")
	  REFERENCES  "ORGANIZATION_CAUSES" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "ORGANIZATION_CAUSES" ADD CONSTRAINT "ORGANIZATION_CAUSES_FK1" FOREIGN KEY ("ORGANIZATION_ID")
	  REFERENCES  "ORGANIZATION" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "ORGANIZATION_CAUSES" ADD CONSTRAINT "ORGANIZATION_CAUSES_FK2" FOREIGN KEY ("CAUSE_ID")
	  REFERENCES  "CAUSES" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "ORGANIZATION_CAUSES" ADD CONSTRAINT "ORGANIZATION_CAUSES_FK3" FOREIGN KEY ("PROBLEM_ID")
	  REFERENCES  "POST" ("ID") ENABLE;
 ALTER TABLE  "ORGANIZATION_TAGS" ADD CONSTRAINT "ORGANIZATION_TAGS_FK1" FOREIGN KEY ("ORGANIZATION_ID")
	  REFERENCES  "ORGANIZATION" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "POST_COMMENT" ADD CONSTRAINT "POST_COMMENT_FK1" FOREIGN KEY ("POST_ID")
	  REFERENCES  "POST" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "POST_TAGS" ADD CONSTRAINT "POST_TAGS_FK1" FOREIGN KEY ("POST_ID")
	  REFERENCES  "POST" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "POST_TAGS" ADD CONSTRAINT "POST_TAGS_FK2" FOREIGN KEY ("TAG_ID")
	  REFERENCES  "TAG" ("ID") ON DELETE CASCADE ENABLE;
  CREATE SEQUENCE   "ORGANIZATION_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE ;
  CREATE OR REPLACE TRIGGER  "TAG_BIU" 
    before insert or update 
    on tag
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end tag_biu;

/
ALTER TRIGGER  "TAG_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "SDGS_BIU" 
    before insert or update 
    on sdgs
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end sdgs_biu;

/
ALTER TRIGGER  "SDGS_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "POST_TAGS_BIU" 
    before insert or update 
    on post_tags
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end post_tags_biu;

/
ALTER TRIGGER  "POST_TAGS_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "POST_REACTION_BIU" 
    before insert or update 
    on post_reaction
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
    
    if f_get_vote_total(:new.post_id) > f_get_config('ISSUE2PROBLEM_THRESHOLD') then
      update post
      set post_type = 'PROBLEM'
      where id=:new.post_id;
    end if;
    
end post_reaction_biu;

/
ALTER TRIGGER  "POST_REACTION_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "POST_COMMENT_BIU" 
    before insert or update 
    on post_comment
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
    
    -- send alert
    dbms_alert.signal(0, 'alert sent at '||to_char(systimestamp, 'HH24:MI:SS FF6'));
end post_comment_biu;

/
ALTER TRIGGER  "POST_COMMENT_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "POST_BIU" 
    before insert or update 
    on post
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
        :new.post_type := nvl(:new.post_type,'PROBLEM');
        :new.post_status := nvl(:new.post_status,'ACTIVE');
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end post_biu;
/
ALTER TRIGGER  "POST_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "ORGANIZATION_USER_BIU" 
BEFORE
insert or update on "ORGANIZATION_USER"
for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end;

/
ALTER TRIGGER  "ORGANIZATION_USER_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "ORGANIZATION_TAGS_BIU" 
    before insert or update 
    on organization_tags
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end organization_tags_biu;

/
ALTER TRIGGER  "ORGANIZATION_TAGS_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "ORGANIZATION_CAUSES_BIU" 
    before insert or update 
    on organization_causes
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end organization_causes_biu;

/
ALTER TRIGGER  "ORGANIZATION_CAUSES_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "ORGANIZATION_BIU" 
  before insert or update on "ORGANIZATION"               
  for each row  
begin   
  if :NEW."ID" is null then 
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  end if; 
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end; 

/
ALTER TRIGGER  "ORGANIZATION_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "INTIATIVES_BIU" 
    before insert or update 
    on intiatives
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end intiatives_biu;

/
ALTER TRIGGER  "INTIATIVES_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "CAUSES_BIU" 
BEFORE
insert or update on "CAUSES"
for each row
begin

    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.created_by := lower(nvl(v('APP_USER'),user));
        :new.created_on := sysdate;
    end if;
    :new.updated_by := lower(nvl(v('APP_USER'),user));
    :new.updated_on := sysdate;
end;

/
ALTER TRIGGER  "CAUSES_BIU" ENABLE;
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
 CREATE OR REPLACE TRIGGER  "APP_CONFIG_BIU" 
    before insert or update 
    on app_config
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
end app_config_biu;

/
ALTER TRIGGER  "APP_CONFIG_BIU" ENABLE;
