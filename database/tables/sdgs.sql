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
