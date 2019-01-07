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

  ALTER TABLE  "POST_TAGS" ADD CONSTRAINT "POST_TAGS_FK1" FOREIGN KEY ("POST_ID")
  REFERENCES  "POST" ("ID") ON DELETE CASCADE ENABLE;
  ALTER TABLE  "POST_TAGS" ADD CONSTRAINT "POST_TAGS_FK2" FOREIGN KEY ("TAG_ID")
  REFERENCES  "TAG" ("ID") ON DELETE CASCADE ENABLE;

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
