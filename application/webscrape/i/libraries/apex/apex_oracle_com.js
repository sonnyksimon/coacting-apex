/*!
 Copyright (c) 2012, 2018, Oracle and/or its affiliates. All rights reserved.
*/
/*
Oracle Database Application Express, Release 4.2
*/
function getUpdateData(pData) {
  // perform the AJAX call
  apex.jQuery.ajax( "https://apex.oracle.com/pls/apex/APEX_REPOSITORY.remote.get_update_data?callback=?", {
    dataType: "jsonp",
    cache: true,
    data: pData,
    success: function(pResponse) {
      apex.jQuery('#updates').html(pResponse.data.replace('%SESSION%', $v('pInstance')));
    }
  });
}
