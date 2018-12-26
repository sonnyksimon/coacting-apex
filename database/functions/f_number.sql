create or replace FUNCTION f_number 
(
  IN_MONEY IN NUMBER 
) RETURN VARCHAR2 AS 
BEGIN
  RETURN to_char(in_money,'999G999G999G999G990');
END f_number;
