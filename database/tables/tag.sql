CREATE TABLE  "TAG"
  (	"ID" NUMBER NOT NULL ENABLE,
 "TAG_NAME" VARCHAR2(255) NOT NULL ENABLE,
 "CREATED_BY" VARCHAR2(100) NOT NULL ENABLE,
 "CREATED_ON" DATE NOT NULL ENABLE,
 "UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE,
 "UPDATED_ON" DATE NOT NULL ENABLE,
  CONSTRAINT "TAG_ID_PK" PRIMARY KEY ("ID") ENABLE
  ) ;

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
