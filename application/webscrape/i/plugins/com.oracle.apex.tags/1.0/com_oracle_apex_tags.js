function com_oracle_apex_tags(pSelector, pOptions) {

  var gAutoComplete;

  // Clears the existing value
  function refresh() {
    // trigger the before refresh event
    gAutoComplete.trigger('apexbeforerefresh');

    // Clear the autocomplete field
    $s(gAutoComplete[0], "");

    // clear the auto complete select list
    gAutoComplete.flushCache();

    // trigger the after refresh event
    gAutoComplete.trigger('apexafterrefresh');
  }; // refresh

  // Returns the value which should be displayed and makes sure
  // that special characters are escaped
  function formatItem(pItem) {
    return apex.util.escapeHTML(pItem[0]);
  };

  // Reads the available tags based on the current entry
  function retrieveData(pParameter, pSuccess) {
    // map the parameters of the autocomplete plug-in to the APEX syntax
    // the native callback of the plugin can't be used, because it adds parameters
    // to the URL which APEX/mod_plsql isn't able to handle.
    var lData = { x01: pParameter.q,
                  x02: pParameter.timestamp,
                  p_request: "NATIVE="+pOptions.ajaxIdentifier,
                  p_flow_id: $v('pFlowId'),
                  p_flow_step_id: $v('pFlowStepId'),
                  p_instance: $v('pInstance')
                };

    // We only have to read data from the server if all our depending values are not null
    if (pOptions.optimizeRefresh) {
      var lNullFound = false;
      apex.jQuery(pOptions.dependingOnSelector+','+pOptions.pageItemsToSubmit).each(function(){
          if (apex.item(this).isEmpty()) {
            lNullFound = true;
            return false; // stop execution of the loop
          }
        });
      if (lNullFound) {
        return; // we are done
      }
    }

    // add all page items we are depending on and the one we always have to submit to the AJAX call
    apex.jQuery(pOptions.dependingOnSelector+','+pOptions.pageItemsToSubmit).each(function(){
      var lIdx;
      if (lData.p_arg_names===undefined) {
        lData.p_arg_names  = [];
        lData.p_arg_values = [];
        lIdx = 0;
      } else {
        lIdx = lData.p_arg_names.length;
      }
      lData.p_arg_names [lIdx] = this.id;
      lData.p_arg_values[lIdx] = $v(this);
    });

    apex.jQuery.ajax({
      // try to leverage ajaxQueue plugin to abort previous requests
      mode: "abort",
      // limit abortion to this input
      port: "tags"+pSelector,
      type: "post",
      url: "wwv_flow.show",
      traditional: true,
      data: lData,
      success: pSuccess });
  };

  // initialize the autocomplete plug-in
  gAutoComplete = apex.jQuery(pSelector).autocomplete(
                    retrieveData,
                    { autoFill:      false,
                      selectFirst:   false,
                      matchContains: true,
                      formatItem:    formatItem,
                      multiple:      true,
                      matchSubset:   false
                    });

  // if it's a cascading select list we have to register change events for our masters
  if (pOptions.dependingOn !== undefined) {
    apex.jQuery(pOptions.dependingOn).change(function(){gAutoComplete.trigger('apexrefresh');});
  }
  // register the refresh event which is triggered by triggerRefresh or a manual refresh
  gAutoComplete.bind("apexrefresh", refresh);

}; // tags
