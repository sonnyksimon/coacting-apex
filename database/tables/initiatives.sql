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

ALTER TABLE  "INTIATIVES" ADD CONSTRAINT "INTIATIVES_FK1" FOREIGN KEY ("CAUSE_ID")
  REFERENCES  "ORGANIZATION_CAUSES" ("ID") ON DELETE CASCADE ENABLE;

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
