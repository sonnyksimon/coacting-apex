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

  ALTER TABLE  "ORGANIZATION_TAGS" ADD CONSTRAINT "ORGANIZATION_TAGS_FK1" FOREIGN KEY ("ORGANIZATION_ID")
  REFERENCES  "ORGANIZATION" ("ID") ON DELETE CASCADE ENABLE;

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
