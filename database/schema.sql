CREATE TABLE  "ORGANIZATION" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"REGISTRATION_ID" NUMBER NOT NULL ENABLE, 
	"ADDRESS" VARCHAR2(4000) NOT NULL ENABLE, 
	"PHONE_NUMBER" VARCHAR2(255), 
	"EMAIL" VARCHAR2(255), 
	"CREATOR_ID" NUMBER, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	"TAGS" VARCHAR2(1024), 
	"LOGO_BLOB" BLOB, 
	"LOGO_MIME" VARCHAR2(100), 
	"LOGO_FILENAME" VARCHAR2(100), 
	 CONSTRAINT "ORGANIZATION_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
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
 CREATE TABLE  "CAUSES" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"DESCRIPTION" VARCHAR2(4000) NOT NULL ENABLE, 
	"SDG_ID" NUMBER NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	 CONSTRAINT "CAUSES_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "ORGANIZATION_CAUSES" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"ORGANIZATION_ID" NUMBER NOT NULL ENABLE, 
	"CAUSE_ID" NUMBER, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	"CAUSE_DESCRIPTION" VARCHAR2(500), 
	"PROBLEM_ID" NUMBER, 
	 CONSTRAINT "ORGANIZATION_CAUSE_ID_PK" PRIMARY KEY ("ID") ENABLE, 
	 CONSTRAINT "ORGANIZATION_CAUSES_UK" UNIQUE ("PROBLEM_ID") ENABLE
   ) ;
 CREATE TABLE  "DEMO_CUSTOMERS" 
   (	"CUSTOMER_ID" NUMBER NOT NULL ENABLE, 
	"CUST_FIRST_NAME" VARCHAR2(20) NOT NULL ENABLE, 
	"CUST_LAST_NAME" VARCHAR2(20) NOT NULL ENABLE, 
	"CUST_STREET_ADDRESS1" VARCHAR2(60), 
	"CUST_STREET_ADDRESS2" VARCHAR2(60), 
	"CUST_CITY" VARCHAR2(30), 
	"CUST_STATE" VARCHAR2(2), 
	"CUST_POSTAL_CODE" VARCHAR2(10), 
	"CUST_EMAIL" VARCHAR2(30), 
	"PHONE_NUMBER1" VARCHAR2(25), 
	"PHONE_NUMBER2" VARCHAR2(25), 
	"URL" VARCHAR2(100), 
	"CREDIT_LIMIT" NUMBER(9,2), 
	"TAGS" VARCHAR2(4000), 
	 CONSTRAINT "DEMO_CUST_CREDIT_LIMIT_MAX" CHECK (credit_limit <= 5000) ENABLE, 
	 CONSTRAINT "DEMO_CUSTOMERS_PK" PRIMARY KEY ("CUSTOMER_ID") ENABLE, 
	 CONSTRAINT "DEMO_CUSTOMERS_UK" UNIQUE ("CUST_FIRST_NAME", "CUST_LAST_NAME") ENABLE
   ) ;
 CREATE TABLE  "DEMO_ORDERS" 
   (	"ORDER_ID" NUMBER NOT NULL ENABLE, 
	"CUSTOMER_ID" NUMBER NOT NULL ENABLE, 
	"ORDER_TOTAL" NUMBER(8,2), 
	"ORDER_TIMESTAMP" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"USER_NAME" VARCHAR2(100), 
	"TAGS" VARCHAR2(4000), 
	 CONSTRAINT "DEMO_ORDER_TOTAL_MIN" CHECK (order_total >= 0) ENABLE, 
	 CONSTRAINT "DEMO_ORDER_PK" PRIMARY KEY ("ORDER_ID") ENABLE
   ) ;
 CREATE TABLE  "DEMO_PRODUCT_INFO" 
   (	"PRODUCT_ID" NUMBER NOT NULL ENABLE, 
	"PRODUCT_NAME" VARCHAR2(50), 
	"PRODUCT_DESCRIPTION" VARCHAR2(2000), 
	"CATEGORY" VARCHAR2(30), 
	"PRODUCT_AVAIL" VARCHAR2(1), 
	"LIST_PRICE" NUMBER(8,2), 
	"PRODUCT_IMAGE" BLOB, 
	"MIMETYPE" VARCHAR2(255), 
	"FILENAME" VARCHAR2(400), 
	"IMAGE_LAST_UPDATE" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"TAGS" VARCHAR2(4000), 
	 CONSTRAINT "DEMO_PRODUCT_INFO_PK" PRIMARY KEY ("PRODUCT_ID") ENABLE, 
	 CONSTRAINT "DEMO_PRODUCT_INFO_UK" UNIQUE ("PRODUCT_NAME") ENABLE
   ) ;
 CREATE TABLE  "DEMO_ORDER_ITEMS" 
   (	"ORDER_ITEM_ID" NUMBER(3,0) NOT NULL ENABLE, 
	"ORDER_ID" NUMBER NOT NULL ENABLE, 
	"PRODUCT_ID" NUMBER NOT NULL ENABLE, 
	"UNIT_PRICE" NUMBER(8,2) NOT NULL ENABLE, 
	"QUANTITY" NUMBER(8,0) NOT NULL ENABLE, 
	 CONSTRAINT "DEMO_ORDER_ITEMS_PK" PRIMARY KEY ("ORDER_ITEM_ID") ENABLE, 
	 CONSTRAINT "DEMO_ORDER_ITEMS_UK" UNIQUE ("ORDER_ID", "PRODUCT_ID") ENABLE
   ) ;
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
 CREATE TABLE  "EBA_DBTOOLS_SAVED_MODELS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"ROW_VERSION" NUMBER(*,0) NOT NULL ENABLE, 
	"NAME" VARCHAR2(255), 
	"IDENTIFIER" VARCHAR2(50), 
	"MODEL_VERSION" VARCHAR2(50), 
	"DESCRIPTION" VARCHAR2(4000), 
	"SETTINGS" VARCHAR2(4000), 
	"IS_PUBLIC_YN" VARCHAR2(1) DEFAULT 'N', 
	"MODEL" CLOB, 
	"CREATED" TIMESTAMP (6) WITH LOCAL TIME ZONE NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(255) NOT NULL ENABLE, 
	"UPDATED" TIMESTAMP (6) WITH LOCAL TIME ZONE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(255) NOT NULL ENABLE, 
	 PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_SAVED_WORKSHEETS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"MODEL_ID" NUMBER, 
	"COLLECTION_NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"SEQ_ID" NUMBER NOT NULL ENABLE, 
	"C001" VARCHAR2(4000), 
	"C002" VARCHAR2(4000), 
	"C003" VARCHAR2(4000), 
	"C004" VARCHAR2(4000), 
	"C005" VARCHAR2(4000), 
	"C006" VARCHAR2(4000), 
	"C007" VARCHAR2(4000), 
	"C008" VARCHAR2(4000), 
	"C009" VARCHAR2(4000), 
	"C010" VARCHAR2(4000), 
	"C011" VARCHAR2(4000), 
	"C012" VARCHAR2(4000), 
	"C013" VARCHAR2(4000), 
	"C014" VARCHAR2(4000), 
	"C015" VARCHAR2(4000), 
	"C016" VARCHAR2(4000), 
	"C017" VARCHAR2(4000), 
	"C018" VARCHAR2(4000), 
	"C019" VARCHAR2(4000), 
	"C020" VARCHAR2(4000), 
	"C021" VARCHAR2(4000), 
	"C022" VARCHAR2(4000), 
	"C023" VARCHAR2(4000), 
	"C024" VARCHAR2(4000), 
	"C025" VARCHAR2(4000), 
	"C026" VARCHAR2(4000), 
	"C027" VARCHAR2(4000), 
	"C028" VARCHAR2(4000), 
	"C029" VARCHAR2(4000), 
	"C030" VARCHAR2(4000), 
	"C031" VARCHAR2(4000), 
	"C032" VARCHAR2(4000), 
	"C033" VARCHAR2(4000), 
	"C034" VARCHAR2(4000), 
	"C035" VARCHAR2(4000), 
	"C036" VARCHAR2(4000), 
	"C037" VARCHAR2(4000), 
	"C038" VARCHAR2(4000), 
	"C039" VARCHAR2(4000), 
	"C040" VARCHAR2(4000), 
	"C041" VARCHAR2(4000), 
	"C042" VARCHAR2(4000), 
	"C043" VARCHAR2(4000), 
	"C044" VARCHAR2(4000), 
	"C045" VARCHAR2(4000), 
	"C046" VARCHAR2(4000), 
	"C047" VARCHAR2(4000), 
	"C048" VARCHAR2(4000), 
	"C049" VARCHAR2(4000), 
	"C050" VARCHAR2(4000), 
	 CONSTRAINT "EBA_DBTOOLS_SAVED_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "TAG" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"TAG_NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	 CONSTRAINT "TAG_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
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
 CREATE TABLE  "EBA_DBTOOLS_ACCESS_LEVELS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"ACCESS_LEVEL" VARCHAR2(30) NOT NULL ENABLE, 
	"ROW_VERSION" NUMBER, 
	 CONSTRAINT "EBA_MST_ACC_LVL_ACC_LVL_CK" CHECK (access_level in (
                                                    'Administrator',
                                                    'Contributor',
                                                    'Reader' )) ENABLE, 
	 CONSTRAINT "EBA_DBTOOLS_ACCESS_LEVELS_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_USERS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"USERNAME" VARCHAR2(255) NOT NULL ENABLE, 
	"ACCESS_LEVEL_ID" NUMBER NOT NULL ENABLE, 
	"ACCOUNT_LOCKED" VARCHAR2(1) NOT NULL ENABLE, 
	"ROW_VERSION" NUMBER, 
	"CREATED_BY" VARCHAR2(255) NOT NULL ENABLE, 
	"CREATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"UPDATED_BY" VARCHAR2(255), 
	"UPDATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	 CONSTRAINT "EBA_MST_USERS_USERNAME_CK" CHECK (upper(username)=username) ENABLE, 
	 CONSTRAINT "EBA_MST_USERS_ACC_LOCKED_CK" CHECK (account_locked in ('Y','N')) ENABLE, 
	 CONSTRAINT "EBA_DBTOOLS_USERS_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
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
 CREATE TABLE  "EBA_DBTOOLS_RANDOM_NAMES" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"SEQ" NUMBER(*,0), 
	"LANGUAGE" VARCHAR2(30) DEFAULT 'en', 
	"FIRST_NAME" VARCHAR2(255), 
	"LAST_NAME" VARCHAR2(255), 
	"FULL_NAME" VARCHAR2(255), 
	"EMAIL" VARCHAR2(255), 
	"PROFILE" VARCHAR2(4000), 
	"JOB" VARCHAR2(100), 
	"GUID" VARCHAR2(255), 
	"PHONE_NUMBER" VARCHAR2(30), 
	"NUM_1_100" NUMBER(*,0), 
	"NUM_1_10" NUMBER(*,0), 
	"WORDS_1" VARCHAR2(100), 
	"WORDS_2" VARCHAR2(100), 
	"WORDS_3" VARCHAR2(255), 
	"WORDS_4" VARCHAR2(255), 
	"WORDS_1_60" VARCHAR2(4000), 
	"WORDS_1_100" VARCHAR2(4000), 
	"PROJECT_NAME" VARCHAR2(100), 
	"DEPARTMENT_NAME" VARCHAR2(100), 
	"CITY" VARCHAR2(100), 
	"COUNTRY" VARCHAR2(50), 
	"TSWTZ" TIMESTAMP (6) WITH TIME ZONE, 
	"TSWLTZ" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"D" DATE, 
	"TAGS" VARCHAR2(4000), 
	 CONSTRAINT "EBA_DBTOOLS_RANDOM_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_ERROR_LOOKUP" 
   (	"CONSTRAINT_NAME" VARCHAR2(30) NOT NULL ENABLE, 
	"MESSAGE" VARCHAR2(4000) NOT NULL ENABLE, 
	"LANGUAGE_CODE" VARCHAR2(30) NOT NULL ENABLE, 
	 CONSTRAINT "EBA_DBTOOLS_ERROR_LOOKUP_PK" PRIMARY KEY ("CONSTRAINT_NAME") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_CLICKS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"VIEW_ID" NUMBER, 
	"APP_USERNAME" VARCHAR2(255), 
	"VIEW_TIMESTAMP" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"APP_SESSION" VARCHAR2(255), 
	 CONSTRAINT "EBA_DBTOOLS_CLICKS_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "APP_USER" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"DISPLAY_NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"EMAIL" VARCHAR2(255) NOT NULL ENABLE, 
	"PASSWORD" VARCHAR2(4000) NOT NULL ENABLE, 
	"LOGO_IMAGE" BLOB, 
	"CREATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"CREATED_ON" DATE NOT NULL ENABLE, 
	"UPDATED_BY" VARCHAR2(100) NOT NULL ENABLE, 
	"UPDATED_ON" DATE NOT NULL ENABLE, 
	"PASSWORD_CHANGED" VARCHAR2(10), 
	"ACCOUNT_STATUS" VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL ENABLE, 
	"VERIFIED_USER" VARCHAR2(100) DEFAULT 'N', 
	"SESSION_ID" VARCHAR2(4000), 
	"LOGO_MIME" VARCHAR2(200), 
	"RESET_CODE" VARCHAR2(100), 
	"ID_BLOB" BLOB, 
	"ID_MIME" VARCHAR2(100), 
	"ADDRESS_PROOF" BLOB, 
	"ADDRESS_PROOF_MIME" VARCHAR2(100), 
	"ID_FILENAME" VARCHAR2(255), 
	"ADDRESS_PROOF_FILENAME" NUMBER, 
	 CONSTRAINT "APP_USER_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_TZ_PREF" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"ROW_VERSION_NUMBER" NUMBER(*,0), 
	"USERID" VARCHAR2(255) NOT NULL ENABLE, 
	"TIMEZONE_PREFERENCE" VARCHAR2(255) NOT NULL ENABLE, 
	"CREATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"CREATED_BY" VARCHAR2(255), 
	"UPDATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"UPDATED_BY" VARCHAR2(255), 
	 CONSTRAINT "EBA_DBTOOLS_TZ_PREF_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_TAGS" 
   (	"ID" NUMBER, 
	"TAG" VARCHAR2(255) NOT NULL ENABLE, 
	"CONTENT_ID" NUMBER, 
	"CONTENT_TYPE" VARCHAR2(30), 
	"CREATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"CREATED_BY" VARCHAR2(255), 
	"UPDATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"UPDATED_BY" VARCHAR2(255), 
	 CONSTRAINT "EBA_DBTOOLS_TAGS_CK" CHECK (content_type in ('DECISION','NOTES','FILE')) ENABLE, 
	 PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_APP_LOG" 
   (	"ID" NUMBER, 
	"STATUS" VARCHAR2(4000), 
	"CONTEXT" VARCHAR2(4000), 
	"SQLERRM" VARCHAR2(4000), 
	"APP_USER" VARCHAR2(255), 
	"EVENT_TIMESTAMP" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	 PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_HISTORY" 
   (	"ID" NUMBER, 
	"ROW_VERSION_NUMBER" NUMBER, 
	"COMPONENT_ID" NUMBER, 
	"COMPONENT_ROWKEY" VARCHAR2(30), 
	"TABLE_NAME" VARCHAR2(60) NOT NULL ENABLE, 
	"COLUMN_NAME" VARCHAR2(60) NOT NULL ENABLE, 
	"OLD_VALUE" VARCHAR2(4000), 
	"NEW_VALUE" VARCHAR2(4000), 
	"CHANGE_DATE" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"CHANGED_BY" VARCHAR2(255), 
	 CONSTRAINT "EBA_DBTOOLS_HISTORY_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_NOTIFICATIONS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"ROW_VERSION_NUMBER" NUMBER, 
	"NOTIFICATION_NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"NOTIFICATION_DESCRIPTION" VARCHAR2(4000), 
	"NOTIFICATION_TYPE" VARCHAR2(30) NOT NULL ENABLE, 
	"DISPLAY_SEQUENCE" NUMBER, 
	"DISPLAY_FROM" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"DISPLAY_UNTIL" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"CREATED_BY" VARCHAR2(255) NOT NULL ENABLE, 
	"CREATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"UPDATED_BY" VARCHAR2(255) NOT NULL ENABLE, 
	"UPDATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	 CONSTRAINT "EBA_DBTOOLS_NOTE_TP_CC" CHECK (notification_type in ('RED','YELLOW')) ENABLE, 
	 CONSTRAINT "EBA_DBTOOLS_NOTE_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_PREFERENCES" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"PREFERENCE_NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"PREFERENCE_VALUE" VARCHAR2(255) NOT NULL ENABLE, 
	"CREATED_BY" VARCHAR2(255) NOT NULL ENABLE, 
	"CREATED_ON" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"UPDATED_BY" VARCHAR2(255), 
	"UPDATED_ON" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	 CONSTRAINT "EBA_MST_PREFS_PREFNAME_CK" CHECK (upper(preference_name)=preference_name) ENABLE, 
	 CONSTRAINT "EBA_DBTOOLS_PREFERENCES_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
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
 CREATE TABLE  "APEX$TEAM_DEV_FILES" 
   (	"ID" NUMBER, 
	"ROW_VERSION_NUMBER" NUMBER, 
	"COMPONENT_ID" NUMBER NOT NULL ENABLE, 
	"COMPONENT_TYPE" VARCHAR2(30) NOT NULL ENABLE, 
	"FILENAME" VARCHAR2(4000) NOT NULL ENABLE, 
	"FILE_MIMETYPE" VARCHAR2(512), 
	"FILE_CHARSET" VARCHAR2(512), 
	"FILE_BLOB" BLOB, 
	"FILE_COMMENTS" VARCHAR2(4000), 
	"TAGS" VARCHAR2(4000), 
	"CREATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"CREATED_BY" VARCHAR2(255), 
	"UPDATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"UPDATED_BY" VARCHAR2(255), 
	 CONSTRAINT "WWV_VALID_ATDF_COMP_TY" CHECK (component_type in ('MILESTONE','FEATURE','BUG','FEEDBACK','TODO')) ENABLE, 
	 PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "DEMO_TAGS_SUM" 
   (	"TAG" VARCHAR2(255), 
	"TAG_COUNT" NUMBER, 
	 CONSTRAINT "DEMO_TAGS_SUM_PK" PRIMARY KEY ("TAG") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_TAGS_SUM" 
   (	"TAG" VARCHAR2(255), 
	"TAG_COUNT" NUMBER, 
	 CONSTRAINT "EBA_DBTOOLS_TAGS_SUM_PK" PRIMARY KEY ("TAG") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_MODELS" 
   (	"ID" NUMBER, 
	"NAME" VARCHAR2(255) NOT NULL ENABLE, 
	"DESCRIPTION" VARCHAR2(4000), 
	"MODEL_TYPE" VARCHAR2(60), 
	"IDENTIFIER" VARCHAR2(255), 
	"QUICK_SQL" CLOB, 
	"GENERATED_SQL" CLOB, 
	"ERD" BLOB, 
	"ERD_FILENAME" VARCHAR2(512), 
	"ERD_MIMETYPE" VARCHAR2(512), 
	"ERD_CHARSET" VARCHAR2(512), 
	"ERD_LASTUPD" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"PUBLISHED_YN" VARCHAR2(1) DEFAULT 'N', 
	"CREATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"CREATED_BY" VARCHAR2(255), 
	"UPDATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"UPDATED_BY" VARCHAR2(255), 
	 PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "DEMO_TAGS" 
   (	"ID" NUMBER, 
	"TAG" VARCHAR2(255) NOT NULL ENABLE, 
	"CONTENT_ID" NUMBER, 
	"CONTENT_TYPE" VARCHAR2(30), 
	"CREATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"CREATED_BY" VARCHAR2(255), 
	"UPDATED" TIMESTAMP (6) WITH LOCAL TIME ZONE, 
	"UPDATED_BY" VARCHAR2(255), 
	 CONSTRAINT "DEMO_TAGS_CK" CHECK (content_type in ('CUSTOMER','ORDER','PRODUCT')) ENABLE, 
	 PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "APP_CONFIG" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"CONFIG_NAME" VARCHAR2(255), 
	"CONFIG_VAL" VARCHAR2(4000), 
	 CONSTRAINT "APP_CONFIG_ID_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 CREATE TABLE  "DEMO_TAGS_TYPE_SUM" 
   (	"TAG" VARCHAR2(255), 
	"CONTENT_TYPE" VARCHAR2(30), 
	"TAG_COUNT" NUMBER, 
	 CONSTRAINT "DEMO_TAGS_TYPE_SUM_PK" PRIMARY KEY ("TAG", "CONTENT_TYPE") ENABLE
   ) ;
 CREATE TABLE  "DEMO_CONSTRAINT_LOOKUP" 
   (	"CONSTRAINT_NAME" VARCHAR2(30), 
	"MESSAGE" VARCHAR2(4000) NOT NULL ENABLE, 
	 PRIMARY KEY ("CONSTRAINT_NAME") ENABLE
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_TAGS_TYPE_SUM" 
   (	"TAG" VARCHAR2(255), 
	"CONTENT_TYPE" VARCHAR2(30), 
	"TAG_COUNT" NUMBER, 
	 CONSTRAINT "EBA_DBTOOLS_TAGS_TYPE_SUM_PK" PRIMARY KEY ("TAG", "CONTENT_TYPE") ENABLE
   ) ;
 CREATE TABLE  "DEMO_STATES" 
   (	"ST" VARCHAR2(30), 
	"STATE_NAME" VARCHAR2(30)
   ) ;
 CREATE TABLE  "EBA_DBTOOLS_ERRORS" 
   (	"ID" NUMBER NOT NULL ENABLE, 
	"ERR_TIME" TIMESTAMP (6) WITH LOCAL TIME ZONE DEFAULT localtimestamp NOT NULL ENABLE, 
	"APP_ID" NUMBER, 
	"APP_PAGE_ID" NUMBER, 
	"APP_USER" VARCHAR2(512), 
	"USER_AGENT" VARCHAR2(4000), 
	"IP_ADDRESS" VARCHAR2(512), 
	"IP_ADDRESS2" VARCHAR2(512), 
	"MESSAGE" VARCHAR2(4000), 
	"PAGE_ITEM_NAME" VARCHAR2(255), 
	"REGION_ID" NUMBER, 
	"COLUMN_ALIAS" VARCHAR2(255), 
	"ROW_NUM" NUMBER, 
	"APEX_ERROR_CODE" VARCHAR2(255), 
	"ORA_SQLCODE" NUMBER, 
	"ORA_SQLERRM" VARCHAR2(4000), 
	"ERROR_BACKTRACE" VARCHAR2(4000), 
	 CONSTRAINT "EBA_DBTOOLS_ERRORS_PK" PRIMARY KEY ("ID") ENABLE
   ) ;
 ALTER TABLE  "DEMO_ORDERS" ADD CONSTRAINT "DEMO_ORDERS_CUSTOMER_ID_FK" FOREIGN KEY ("CUSTOMER_ID")
	  REFERENCES  "DEMO_CUSTOMERS" ("CUSTOMER_ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "DEMO_ORDER_ITEMS" ADD CONSTRAINT "DEMO_ORDER_ITEMS_FK" FOREIGN KEY ("ORDER_ID")
	  REFERENCES  "DEMO_ORDERS" ("ORDER_ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "DEMO_ORDER_ITEMS" ADD CONSTRAINT "DEMO_ORDER_ITEMS_PRODUCT_ID_FK" FOREIGN KEY ("PRODUCT_ID")
	  REFERENCES  "DEMO_PRODUCT_INFO" ("PRODUCT_ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "EBA_DBTOOLS_SAVED_WORKSHEETS" ADD CONSTRAINT "EBA_DBTOOLS_SAVED_MODEL_ID_FK" FOREIGN KEY ("MODEL_ID")
	  REFERENCES  "EBA_DBTOOLS_SAVED_MODELS" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "EBA_DBTOOLS_USERS" ADD CONSTRAINT "EBA_MST_USERS_ACC_LEVEL_FK" FOREIGN KEY ("ACCESS_LEVEL_ID")
	  REFERENCES  "EBA_DBTOOLS_ACCESS_LEVELS" ("ID") ENABLE;
 ALTER TABLE  "INTIATIVES" ADD CONSTRAINT "INTIATIVES_FK1" FOREIGN KEY ("CAUSE_ID")
	  REFERENCES  "ORGANIZATION_CAUSES" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "ORGANIZATION_CAUSES" ADD CONSTRAINT "ORGANIZATION_CAUSES_FK1" FOREIGN KEY ("ORGANIZATION_ID")
	  REFERENCES  "ORGANIZATION" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "ORGANIZATION_CAUSES" ADD CONSTRAINT "ORGANIZATION_CAUSES_FK2" FOREIGN KEY ("CAUSE_ID")
	  REFERENCES  "CAUSES" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "ORGANIZATION_CAUSES" ADD CONSTRAINT "ORGANIZATION_CAUSES_FK3" FOREIGN KEY ("PROBLEM_ID")
	  REFERENCES  "POST" ("ID") ENABLE;
 ALTER TABLE  "ORGANIZATION_TAGS" ADD CONSTRAINT "ORGANIZATION_TAGS_FK1" FOREIGN KEY ("ORGANIZATION_ID")
	  REFERENCES  "ORGANIZATION" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "POST_COMMENT" ADD CONSTRAINT "POST_COMMENT_FK1" FOREIGN KEY ("POST_ID")
	  REFERENCES  "POST" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "POST_TAGS" ADD CONSTRAINT "POST_TAGS_FK1" FOREIGN KEY ("POST_ID")
	  REFERENCES  "POST" ("ID") ON DELETE CASCADE ENABLE;
 ALTER TABLE  "POST_TAGS" ADD CONSTRAINT "POST_TAGS_FK2" FOREIGN KEY ("TAG_ID")
	  REFERENCES  "TAG" ("ID") ON DELETE CASCADE ENABLE;
 CREATE INDEX  "DEMO_CUST_NAME_IX" ON  "DEMO_CUSTOMERS" ("CUST_LAST_NAME", "CUST_FIRST_NAME") 
  ;
 CREATE INDEX  "DEMO_ORD_CUSTOMER_IX" ON  "DEMO_ORDERS" ("CUSTOMER_ID") 
  ;
 CREATE UNIQUE INDEX  "EBA_DBTOOLS_ACCESS_LEVELS_UK" ON  "EBA_DBTOOLS_ACCESS_LEVELS" ("ACCESS_LEVEL") 
  ;
 CREATE INDEX  "EBA_DBTOOLS_CLICKS_IDX1" ON  "EBA_DBTOOLS_CLICKS" ("VIEW_ID") 
  ;
 CREATE INDEX  "EBA_DBTOOLS_CLICKS_IDX2" ON  "EBA_DBTOOLS_CLICKS" ("VIEW_TIMESTAMP") 
  ;
 CREATE INDEX  "EBA_DBTOOLS_ERRORS_I1" ON  "EBA_DBTOOLS_ERRORS" ("ERR_TIME") 
  ;
 CREATE UNIQUE INDEX  "EBA_DBTOOLS_ERROR_LOOKUP_UK" ON  "EBA_DBTOOLS_ERROR_LOOKUP" ("CONSTRAINT_NAME", "LANGUAGE_CODE") 
  ;
 CREATE INDEX  "EBA_DBTOOLS_HISTORY_I1" ON  "EBA_DBTOOLS_HISTORY" ("COMPONENT_ID") 
  ;
 CREATE UNIQUE INDEX  "EBA_DBTOOLS_MODELS_I1" ON  "EBA_DBTOOLS_MODELS" ("IDENTIFIER") 
  ;
 CREATE UNIQUE INDEX  "EBA_DBTOOLS_SAVED_MODELS_I1" ON  "EBA_DBTOOLS_SAVED_MODELS" ("IDENTIFIER") 
  ;
 CREATE INDEX  "EBA_DBTOOLS_SAVED_WORKSHEET_I1" ON  "EBA_DBTOOLS_SAVED_WORKSHEETS" ("MODEL_ID") 
  ;
 CREATE UNIQUE INDEX  "EBA_DBTOOLS_USERS_UK" ON  "EBA_DBTOOLS_USERS" ("USERNAME") 
  ;
 CREATE UNIQUE INDEX  "EBA_MST_PREFERENCES_UK" ON  "EBA_DBTOOLS_PREFERENCES" ("PREFERENCE_NAME") 
  ;
 CREATE INDEX  "EBA_MST_USERS_ACC_LVL_IDX" ON  "EBA_DBTOOLS_USERS" ("ACCESS_LEVEL_ID") 
  ;
  CREATE SEQUENCE   "ORGANIZATION_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE ;
  CREATE SEQUENCE   "EMP_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 8000 CACHE 20 NOORDER  NOCYCLE ;
  CREATE SEQUENCE   "EBA_DBTOOLS_SEQ"  MINVALUE 1000 MAXVALUE 999999999999999999999999999 INCREMENT BY 1 START WITH 1240 CACHE 20 NOORDER  NOCYCLE ;
  CREATE SEQUENCE   "EBA_DBTOOLS_RANDOM_NAMES_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 2821 CACHE 20 NOORDER  NOCYCLE ;
  CREATE SEQUENCE   "DEPT_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 50 CACHE 20 NOORDER  NOCYCLE ;
  CREATE SEQUENCE   "DEMO_PROD_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 100 CACHE 20 NOORDER  NOCYCLE ;
  CREATE SEQUENCE   "DEMO_ORD_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 11 CACHE 20 NOORDER  NOCYCLE ;
  CREATE SEQUENCE   "DEMO_ORDER_ITEMS_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 160 CACHE 20 NOORDER  NOCYCLE ;
  CREATE SEQUENCE   "DEMO_CUST_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 100 CACHE 20 NOORDER  NOCYCLE ;
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
 CREATE OR REPLACE TRIGGER  "ORGANIZATION_CAUSES_BIU" 
    before insert or update 
    on organization_causes
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
end organization_causes_biu;

/
ALTER TRIGGER  "ORGANIZATION_CAUSES_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "ORGANIZATION_BIU" 
  before insert or update on "ORGANIZATION"               
  for each row  
begin   
  if :NEW."ID" is null then 
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
ALTER TRIGGER  "ORGANIZATION_BIU" ENABLE;
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
 CREATE OR REPLACE TRIGGER  "EBA_DBTOOLS_USERS_BIU" 
    before insert or update on eba_dbtools_users
    for each row
begin
    if inserting then
        if :new.id is null then
            :new.id := eba_dbtools.gen_id();
        end if;
        :new.created_by         := nvl(v('APP_USER'), USER);
        :new.created            := localtimestamp;
        :new.row_version        := 1;
        if :new.account_locked is null then
            :new.account_locked := 'N';    
        end if;
    end if;
    if updating then
        :new.updated_by         := nvl(v('APP_USER'), USER);
        :new.updated            := localtimestamp;
        :new.row_version        := nvl(:old.row_version,1) + 1;
    end if;
    -- Always store username as upper case
    :new.username := upper(:new.username);
end;

/
ALTER TRIGGER  "EBA_DBTOOLS_USERS_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "EBA_DBTOOLS_USERS_BD" 
    before delete on eba_dbtools_users
    for each row
declare
    pragma autonomous_transaction;
begin
    -- Disallow deletes to a user's own record unless last one.
    if v('APP_USER') = upper(:old.username) then
       for c1 in (
          select count(*) cnt
            from eba_dbtools_users
           where id != :old.id )
       loop
          if c1.cnt > 0 then
             raise_application_error(-20002, 'Delete disallowed, you cannot delete your own access control details.');
          end if;
       end loop;
    end if;    
end;

/
ALTER TRIGGER  "EBA_DBTOOLS_USERS_BD" ENABLE;
 CREATE OR REPLACE TRIGGER  "EBA_DBTOOLS_S_WORKSHEET_BIU" 
    before insert or update 
    on EBA_DBTOOLS_SAVED_WORKSHEETS
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
end;

/
ALTER TRIGGER  "EBA_DBTOOLS_S_WORKSHEET_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "EBA_DBTOOLS_SAVED_MODELS_BIU" 
    before insert or update 
    on EBA_DBTOOLS_SAVED_MODELS
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.ROW_VERSION := 1;
    elsif updating then
        :new.ROW_VERSION := NVL(:old.ROW_VERSION,0) + 1;
    end if;
    if inserting then
        :new.created := LOCALTIMESTAMP;
        :new.created_by := NVL(SYS_CONTEXT('APEX$SESSION','APP_USER'),user);
    end if;
    :new.updated := LOCALTIMESTAMP;
    :new.updated_by := NVL(SYS_CONTEXT('APEX$SESSION','APP_USER'),user);
end;

/
ALTER TRIGGER  "EBA_DBTOOLS_SAVED_MODELS_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "EBA_DBTOOLS_RANDOM_NAMES_BIU" 
    before insert or update 
    on EBA_DBTOOLS_RANDOM_NAMES
    for each row
declare
   i              integer := 0;
   l_email        varchar2(255) := null;
   l_phone_number varchar2(30)  := null;
   l_num_1_100    integer;
   l_num_1_10     integer;  
   r              number;
   l_guid         varchar2(100) := null;
   l_profile      varchar(4000) := null;
   x              number;
   
   function eba_dbtools_rand_text (
       p_language in varchar2 default 'en',
       p_words in number default 10)
       return varchar2
   is
   begin
       return eba_dbtools_data.get_random_text(p_language=>NVL(p_language,'en'), p_words=>p_words);
   end eba_dbtools_rand_text;
   function compress_int (n in integer ) return varchar2
   as
      ret       varchar2(30);
      quotient  integer;
      remainder integer;
      digit     char(1);
   begin
      ret := null; quotient := n;
      while quotient > 0
      loop
          remainder := mod(quotient, 10 + 26);
          quotient := floor(quotient  / (10 + 26));
          if remainder < 26 then
              digit := chr(ascii('A') + remainder);
          else
              digit := chr(ascii('0') + remainder - 26);
          end if;
          ret := digit || ret;
      end loop ;
      if length(ret) < 5 then ret := lpad(ret, 4, 'A'); end if ;
      return upper(ret);
   end compress_int;
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
       if :new.first_name is null then :new.first_name := substr(:new.full_name,1,instr(:new.full_name,' ')-1); end if;
       if :new.last_name  is null then :new.last_name  := substr(:new.full_name,instr(:new.full_name,' ')+1); end if; 
       l_email         := lower(:new.first_name||'.'||replace(:new.last_name,' ','_')||'@'||compress_int(EBA_DBTOOLS_RANDOM_NAMES_SEQ.nextval)||'.com');
       if :new.email is null then :new.email := l_email; end if;
       r               := DBMS_RANDOM.value(low => 1, high => 9999999999);
       l_phone_number  := rpad(replace(to_char(r),'.',null),10,'000000000000');
       l_phone_number  := substr(l_phone_number,1,3)||'-'||substr(l_phone_number,4,3)||'-'||substr(l_phone_number,7);
       if :new.phone_number is null then :new.phone_number := l_phone_number; end if;
       l_num_1_100     := DBMS_RANDOM.value(low => 1, high => 100);
       l_num_1_10      := DBMS_RANDOM.value(low => 1, high => 10);
       :new.project_name := eba_dbtools_data.get_random_project(p_language => :new.language);
       :new.job := eba_dbtools_data.get_random_job(p_language => :new.language);
       :new.department_name := eba_dbtools_data.get_random_dept_name(p_language => :new.language);
       :new.tags := eba_dbtools_data.get_random_tags(p_language => :new.language);
       --
       --
       if :new.tswtz is null then :new.tswtz := SYSTIMESTAMP; end if;
       if :new.tswltz is null then :new.tswltz := LOCALTIMESTAMP; end if;
       if :new.d is null then :new.d := sysdate; end if;
       :new.num_1_100  := l_num_1_100;
       :new.num_1_10   := l_num_1_10;
       :new.words_1    := initcap(replace(replace(eba_dbtools_rand_text(:new.language,2),'.',null),',',null));
       :new.words_2    := initcap(replace(replace(eba_dbtools_rand_text(:new.language,3),'.',null),',',null));
       :new.words_3    := initcap(replace(replace(eba_dbtools_rand_text(:new.language,4),'.',null),',',null));
       :new.words_4    := initcap(replace(replace(eba_dbtools_rand_text(:new.language,5),'.',null),',',null));
       :new.words_1_60  := substr(eba_dbtools_rand_text(:new.language,trunc(DBMS_RANDOM.value(low => 2, high => 60 ))),1,4000);
       :new.words_1_100 := substr(eba_dbtools_rand_text(:new.language,trunc(DBMS_RANDOM.value(low => 2, high => 100))),1,4000);
       l_guid          := sys_guid();
       :new.guid       := l_guid;
       l_profile       := substr(eba_dbtools_rand_text(:new.language,60),1,4000);
       :new.profile    := l_profile;
       if :new.seq is null then :new.seq := EBA_DBTOOLS_RANDOM_NAMES_SEQ.nextval; end if;
    end if;
end;

/
ALTER TRIGGER  "EBA_DBTOOLS_RANDOM_NAMES_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "EBA_DBTOOLS_PREFERENCES_BIU" 
before insert or update on eba_dbtools_preferences
    for each row
begin
    if inserting and :new.id is null then
        :new.id := eba_dbtools.gen_id();
    end if;
    if inserting then
        :new.created_by := nvl(v('APP_USER'),USER);
        :new.created_on := localtimestamp;
    end if;
    if updating then
        :new.updated_by := nvl(v('APP_USER'),USER);
        :new.updated_on := localtimestamp;
    end if;
    :new.preference_name := upper(:new.preference_name);
end;

/
ALTER TRIGGER  "EBA_DBTOOLS_PREFERENCES_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "EBA_DBTOOLS_NOTE_BIU" 
before insert or update on eba_dbtools_notifications
    for each row
begin
    if inserting and :new.id is null then
        :new.id := eba_dbtools.gen_id();
    end if;
    if inserting then
        :new.created_by := nvl(v('APP_USER'),USER);
        :new.created := localtimestamp;
        :new.updated_by := nvl(v('APP_USER'),USER);
        :new.updated := localtimestamp;
        :new.row_version_number := 1;
    end if;
    if updating then
        :new.row_version_number := nvl(:old.row_version_number,1) + 1;
        :new.updated_by := nvl(v('APP_USER'),USER);
        :new.updated    := localtimestamp;
    end if;
    if :new.notification_type is null then
       :new.notification_type := 'MANUAL';
    end if;
    if :new.display_sequence is null then
       :new.display_sequence := 10;
    end if;
end;

/
ALTER TRIGGER  "EBA_DBTOOLS_NOTE_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "EBA_DBTOOLS_CLICKS_BIU" 
    before insert on eba_dbtools_clicks
    for each row
begin
     if :new.id is null then
         :new.id := eba_dbtools_seq.nextval;
     end if;
     :new.view_timestamp := localtimestamp;
     :new.app_username := nvl(v('APP_USER'),user);
     :new.app_session := v('APP_SESSION');
end;

/
ALTER TRIGGER  "EBA_DBTOOLS_CLICKS_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "EBA_DBTOOLS_APP_LOG_BIU" 
    before insert or update 
    on EBA_DBTOOLS_APP_LOG
    for each row
begin
    if :new.id is null then
        :new.id := to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    end if;
    if inserting then
        :new.event_timestamp := LOCALTIMESTAMP;
        if :new.app_user is null then
           :new.app_user := NVL(SYS_CONTEXT('APEX$SESSION','APP_USER'),user);
        end if;
    end if;
end;

/
ALTER TRIGGER  "EBA_DBTOOLS_APP_LOG_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_TAGS_BIU" 
   before insert or update on demo_tags
   for each row
   begin
      if inserting then
         if :NEW.ID is null then
           select to_number(sys_guid(),'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
           into :new.id
           from dual;
         end if;
         :NEW.CREATED := localtimestamp;
         :NEW.CREATED_BY := nvl(v('APP_USER'),USER);
      end if;
      if updating then
         :NEW.UPDATED := localtimestamp;
         :NEW.UPDATED_BY := nvl(v('APP_USER'),USER);
      end if;
end;

/
ALTER TRIGGER  "DEMO_TAGS_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_PRODUCT_INFO_BIU" 
  before insert or update ON demo_product_info FOR EACH ROW
DECLARE
  prod_id number;
BEGIN
  if inserting then  
    if :new.product_id is null then
      select demo_prod_seq.nextval
        into prod_id
        from dual;
      :new.product_id := prod_id;
    end if;
    if :new.tags is not null then
          :new.tags := sample_pkg.demo_tags_cleaner(:new.tags);
    end if;
  end if;
  sample_pkg.demo_tag_sync(
    p_new_tags      => :new.tags,
    p_old_tags      => :old.tags,
    p_content_type  => 'PRODUCT',
    p_content_id    => :new.product_id );
END;

/
ALTER TRIGGER  "DEMO_PRODUCT_INFO_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_PRODUCT_INFO_BD" 
    before delete on demo_product_info
    for each row
begin
    sample_pkg.demo_tag_sync(
        p_new_tags      => null,
        p_old_tags      => :old.tags,
        p_content_type  => 'PRODUCT',
        p_content_id    => :old.product_id );
end;

/
ALTER TRIGGER  "DEMO_PRODUCT_INFO_BD" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_ORDER_ITEMS_BIU_GET_PRICE" 
  before insert or update on demo_order_items for each row
declare
  l_list_price number;
begin
  if :new.unit_price is null then
    -- First, we need to get the current list price of the order line item
    select list_price
    into l_list_price
    from demo_product_info
    where product_id = :new.product_id;
    -- Once we have the correct price, we will update the order line with the correct price
    :new.unit_price := l_list_price;
  end if;
end;

/
ALTER TRIGGER  "DEMO_ORDER_ITEMS_BIU_GET_PRICE" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_ORDER_ITEMS_BI" 
  BEFORE insert on "DEMO_ORDER_ITEMS" for each row
declare
  order_item_id number;
begin
  if :new.order_item_id is null then
    select demo_order_items_seq.nextval 
      into order_item_id 
      from dual;
    :new.order_item_id := order_item_id;
  end if;
end;

/
ALTER TRIGGER  "DEMO_ORDER_ITEMS_BI" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_ORDER_ITEMS_AIUD_TOTAL" 
  after insert or update or delete on demo_order_items
begin
  -- Update the Order Total when any order item is changed
  update demo_orders set order_total =
  (select sum(unit_price*quantity) from demo_order_items
    where demo_order_items.order_id = demo_orders.order_id);
end;

/
ALTER TRIGGER  "DEMO_ORDER_ITEMS_AIUD_TOTAL" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_ORDERS_BIU" 
  before insert or update ON demo_orders FOR EACH ROW
DECLARE
  order_id number;
BEGIN
  if inserting then  
    if :new.order_id is null then
      select demo_ord_seq.nextval
        INTO order_id
        FROM dual;
      :new.order_id := order_id;
    end if;
    if :new.tags is not null then
       :new.tags := sample_pkg.demo_tags_cleaner(:new.tags);
    end if;
  end if;
  
  sample_pkg.demo_tag_sync(
    p_new_tags      => :new.tags,
    p_old_tags      => :old.tags,
    p_content_type  => 'ORDER',
    p_content_id    => :new.order_id );
END;

/
ALTER TRIGGER  "DEMO_ORDERS_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_ORDERS_BD" 
    before delete on demo_orders
    for each row
begin
    sample_pkg.demo_tag_sync(
        p_new_tags      => null,
        p_old_tags      => :old.tags,
        p_content_type  => 'ORDER',
        p_content_id    => :old.order_id );
end;

/
ALTER TRIGGER  "DEMO_ORDERS_BD" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_CUSTOMERS_BIU" 
  before insert or update ON demo_customers FOR EACH ROW
DECLARE
  cust_id number;
BEGIN
  if inserting then  
    if :new.customer_id is null then
      select demo_cust_seq.nextval
        into cust_id
        from dual;
      :new.customer_id := cust_id;
    end if;
    if :new.tags is not null then
          :new.tags := sample_pkg.demo_tags_cleaner(:new.tags);
    end if;
  end if;
  sample_pkg.demo_tag_sync(
     p_new_tags      => :new.tags,
     p_old_tags      => :old.tags,
     p_content_type  => 'CUSTOMER',
     p_content_id    => :new.customer_id );
END;

/
ALTER TRIGGER  "DEMO_CUSTOMERS_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "DEMO_CUSTOMERS_BD" 
    before delete on demo_customers
    for each row
begin
    sample_pkg.demo_tag_sync(
        p_new_tags      => null,
        p_old_tags      => :old.tags,
        p_content_type  => 'CUSTOMER',
        p_content_id    => :old.customer_id );
end;

/
ALTER TRIGGER  "DEMO_CUSTOMERS_BD" ENABLE;
 CREATE OR REPLACE TRIGGER  "CAUSES_BIU" 
BEFORE
insert or update on "CAUSES"
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
ALTER TRIGGER  "CAUSES_BIU" ENABLE;
 CREATE OR REPLACE TRIGGER  "BI_EBA_DBTOOLS_ERRORS" 
    before insert or update on eba_dbtools_errors
    for each row
begin
    if :new.id is null then
        select to_number(sys_guid(),'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') into :new.id from dual;
    end if;
end;

/
ALTER TRIGGER  "BI_EBA_DBTOOLS_ERRORS" ENABLE;
 CREATE OR REPLACE TRIGGER  "BIU_EBA_DBTOOLS_TZ_PREF" 
   before insert or update on eba_dbtools_tz_pref
   for each row
begin
    if :new."ID" is null then
        :new.id := eba_dbtools.gen_id();
    end if;
    if inserting then
        :new.created := localtimestamp;
        :new.created_by := NVL(SYS_CONTEXT('APEX$SESSION','APP_USER'),user);
        :new.updated := localtimestamp;
        :new.updated_by := NVL(SYS_CONTEXT('APEX$SESSION','APP_USER'),user);
        :new.row_version_number := 1;
    elsif updating then
        :new.row_version_number := nvl(:old.row_version_number,1) + 1;
    end if;
    if inserting or updating then
        :new.updated := localtimestamp;
        :new.updated_by := NVL(SYS_CONTEXT('APEX$SESSION','APP_USER'),user);
    end if;
    if :new.TIMEZONE_PREFERENCE is null then
        :new.timezone_preference := 'UTC';
    end if;
end;

/
ALTER TRIGGER  "BIU_EBA_DBTOOLS_TZ_PREF" ENABLE;
 CREATE OR REPLACE TRIGGER  "BIU_EBA_DBTOOLS_TAGS" 
before insert or update on eba_dbtools_tags
for each row
begin
    if inserting then 
        if :new.id is null then 
            :new.id := eba_dbtools.gen_id(); 
        end if; 
        :new.created_by         := nvl(v('APP_USER'), USER); 
        :new.created            := localtimestamp; 
    end if; 
    :NEW.UPDATED := localtimestamp;
    :NEW.UPDATED_BY := nvl(v('APP_USER'),USER);
end;

/
ALTER TRIGGER  "BIU_EBA_DBTOOLS_TAGS" ENABLE;
 CREATE OR REPLACE TRIGGER  "BIU_EBA_DBTOOLS_MODELS" 
before insert or update on eba_dbtools_models
for each row
begin
    if inserting then 
        if :new.id is null then 
            :new.id := eba_dbtools.gen_id(); 
        end if; 
        :new.created_by         := nvl(v('APP_USER'), USER); 
        :new.created            := localtimestamp; 
    end if; 
    :new.identifier := lower(:new.identifier);
    :NEW.UPDATED := localtimestamp;
    :NEW.UPDATED_BY := nvl(v('APP_USER'),USER);
    if :new.published_yn is null then
       :new.published_yn := 'N';
    end if;
end;

/
ALTER TRIGGER  "BIU_EBA_DBTOOLS_MODELS" ENABLE;
 CREATE OR REPLACE TRIGGER  "BIU_EBA_DBTOOLS_HISTORY" 
    before insert or update on eba_dbtools_history
    for each row
begin
    if :new.id is null then
        :new.id := eba_dbtools.gen_id();
    end if;
    if inserting then
        :new.change_date := localtimestamp;
        :new.changed_by := NVL(SYS_CONTEXT('APEX$SESSION','APP_USER'),user);
        :new.row_version_number := 1;
    elsif updating then
        :new.row_version_number := :new.row_version_number + 1;
    end if;
end;

/
ALTER TRIGGER  "BIU_EBA_DBTOOLS_HISTORY" ENABLE;
 CREATE OR REPLACE TRIGGER  "APP_USER_BIU" 
    before insert or update 
    on app_user
    for each row
begin
    if inserting then
        :new.password := security.hash_pw(:new.password,security.gen_salt);
        :new.created_by := user;
        :new.created_on := sysdate;
    end if;
    :new.updated_by := user;
    :new.updated_on := sysdate;
  
  if updating and :new.password <> :old.password then
    select security.hash_pw(:new.password,security.gen_salt) into :new.password from dual;
  end if;
  
  if dbms_lob.getlength(:new.LOGO_IMAGE) > f_get_config('MAX_IMAGE_SIZE_KB') * 1024 then
    apex_error.add_error (
    p_message          => 'Image size exceeds '||f_get_config('MAX_IMAGE_SIZE_KB')||'KB',
    p_display_location =>  apex_error.c_inline_with_field_and_notif,
    p_page_item_name   => 'P7_LOGO_IMAGE');
    --alert ('Image size exceeds 500KB');
  end if;
end app_user_biu;
/
ALTER TRIGGER  "APP_USER_BIU" ENABLE;
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
 CREATE OR REPLACE TRIGGER  "APEX$TEAM_DEV_FILES_BIU" 
          before insert or update on apex$team_dev_files
          for each row
        declare
           l_filesize_quota number := 15728640;
           l_filesize_mb    number;
        begin
          for c1 in
          (
              select
                  team_dev_fs_limit
              from
                  apex_workspaces
              where
                  workspace_id = v( 'APP_SECURITY_GROUP_ID' )
          )
          loop
            l_filesize_quota := c1.team_dev_fs_limit;
            l_filesize_mb    := l_filesize_quota/1048576;
          end loop;
          if :new."ID" is null then
            select to_number(sys_guid(),'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') into :new.id from sys.dual;
          end if;
          if inserting then
           :new.created := localtimestamp;
           :new.created_by := nvl(wwv_flow.g_user,user);
           :new.updated := localtimestamp;
           :new.updated_by := nvl(wwv_flow.g_user,user);
           :new.row_version_number := 1;
         elsif updating then
           :new.row_version_number := nvl(:old.row_version_number,1) + 1;
         end if;
         if (inserting or updating) and nvl(sys.dbms_lob.getlength(:new.file_blob),0) > l_filesize_quota then
           raise_application_error(-20000, wwv_flow_lang.system_message('FILE_TOO_LARGE', trunc(l_filesize_mb)));
         end if;
         if inserting or updating then
           :new.updated := localtimestamp;
           :new.updated_by := nvl(wwv_flow.g_user,user);
         end if;
        end;
        
/
ALTER TRIGGER  "APEX$TEAM_DEV_FILES_BIU" ENABLE;
 
