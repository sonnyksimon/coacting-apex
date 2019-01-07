CREATE TABLE  "APP_CONFIG"
  (	"ID" NUMBER NOT NULL ENABLE,
 "CONFIG_NAME" VARCHAR2(255),
 "CONFIG_VAL" VARCHAR2(4000),
  CONSTRAINT "APP_CONFIG_ID_PK" PRIMARY KEY ("ID") ENABLE
  ) ;

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
