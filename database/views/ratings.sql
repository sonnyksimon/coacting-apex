CREATE OR REPLACE FORCE VIEW "RATINGS" ("POST_ID", "UPS", "DOWNS", "HOT", "CONTROVERSY", "CONFIDENCE", "POST_NAME", "POST_DESCRIPTION", "POST_TYPE", "POST_STATUS", "CREATED_BY", "CREATED") AS 
  select
  p.id post_id,
  f_ups(p.id) ups,
  f_downs(p.id) downs,
  f_hot_rating(p.id) hot,
  f_controversy_rating(p.id) controversy,
  f_confidence_rating(p.id) confidence,
  p.post_name,
  p.post_description,
  p.post_type,
  p.post_status,
  p.created_by,
  apex_util.get_since(p.created_on) created
from post p
order by confidence desc

;
 