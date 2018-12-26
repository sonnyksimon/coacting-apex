create or replace function to_base64(t in varchar2) return varchar2 is
 begin
    return utl_raw.cast_to_varchar2(utl_encode.base64_encode(utl_raw.cast_to_raw(t)));
end to_base64;
