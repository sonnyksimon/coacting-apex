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

  ALTER TABLE  "POST_COMMENT" ADD CONSTRAINT "POST_COMMENT_FK1" FOREIGN KEY ("POST_ID")
  REFERENCES  "POST" ("ID") ON DELETE CASCADE ENABLE;

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
