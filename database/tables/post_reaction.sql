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
