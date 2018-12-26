create or replace function blobtovarchar(B BLOB) 
return clob is 
  c clob;
  n number;
begin 
  if (b is null) then 
    return null;
  end if;
  if (length(b)=0) then
    return empty_clob(); 
  end if;
  dbms_lob.createtemporary(c,true);
  n:=1;
  while (n+32767<=length(b)) loop
    dbms_lob.writeappend(c,32767,utl_raw.cast_to_varchar2(dbms_lob.substr(b,32767,n)));
    n:=n+32767;
  end loop;
  dbms_lob.writeappend(c,length(b)-n+1,utl_raw.cast_to_varchar2(dbms_lob.substr(b,length(b)-n+1,n)));
  return c;
end;

