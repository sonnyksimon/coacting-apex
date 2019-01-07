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
