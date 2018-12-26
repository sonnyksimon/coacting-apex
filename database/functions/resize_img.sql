create or replace FUNCTION resize_img (img in BLOB) 
   RETURN blob
IS
   v_img ORDSYS.ORDImage;
   v_small_photo  BLOB := empty_Blob();
BEGIN
   dbms_lob.createTemporary(v_small_photo ,false);
   v_img := ORDSYS.ORDImage(img,1);
   ordsys.ordimage.processCopy(img, 'maxScale=75 75', v_small_photo);
   return  v_small_photo;
End resize_img;
