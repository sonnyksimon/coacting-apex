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
