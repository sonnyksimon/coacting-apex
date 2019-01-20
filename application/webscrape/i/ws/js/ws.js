/*global apex,$s*/
/*!
 Web Sheet main controller
 Copyright (c) 20011, 2014, Oracle and/or its affiliates. All rights reserved.
 */
apex.jQuery( document ).ready(function(){
	loadSectionControls();
	loadBreadCrumbs();
	loadMenuBar();
	loadControlPanel();
	loadWizardTrain();
	scrollTopLink();
	loadScrollingNavLinks();
	loadFormTable();
	loadCollapsableSidePane();
	initSearchField();
	$( '.helpTip' ).tooltip();
}); //End apex.jQuery Ready()

var reInitWS = function(){
	loadSectionControls();
	loadBreadCrumbs();
	scrollTopLink();
	loadScrollingNavLinks();
	loadFormTable();
};

var initSearchField = function(){
	apex.jQuery(".wsSearch span.right").click(function(){
		apex.jQuery("#P0_SEARCH").val("").focus();
	});

// Initialize Datagrid Search Fields
	apex.jQuery("div.searchField input").click(function(){
		placeholder = apex.jQuery(this).attr("placeholder");
		searchfield = apex.jQuery(this);
		if (searchfield.val() == placeholder) {
			searchfield.text("").val("").focus();
		} else {
			searchfield.select().focus();
		}
	}).blur(function(){
		placeholder = apex.jQuery(this).attr("placeholder");
		searchfield = apex.jQuery(this);
		if (searchfield.val() == "") {
			searchfield.text("").val(placeholder);
		}
	});

};

var loadSectionControls = function(){
	apex.jQuery("a.wsSectionControl").click(function(){
		link = apex.jQuery(this);
		content = link.closest("div").find("div.wsSectionContent");
		link.toggleClass("wsSectionCollapsed");
		if (content.css("display") == "block") {
			content.slideUp("fast","swing");
		} else {
			content.slideDown("fast","swing");
		}
	});
};

var loadBreadCrumbs = function(){
    apex.jQuery("#wsBreadcrumbMenu", apex.gPageContext$).menu({
        menubar: true
    });
};

var loadMenuBar = function() {
    var e = apex.jQuery("#websheets_menubar", apex.gPageContext$);
    if ( e.length && apex.actions ) {
        apex.actions.addFromMarkup( e );
    }
    e.menu({
        menubarShowSubMenuIcon: true,
        menubar: true
    });
};

var loadControlPanel = function(){
	apex.jQuery("a.wsControlPanel","#wsControlPanel").click(function(){
		controlPanelList = apex.jQuery("ul","#wsControlPanel");
		controlPanelHeading = apex.jQuery("h2","#wsControlPanel");
		controlPanelIcon = apex.jQuery("img#collapseAction","#wsControlPanel");
		if (controlPanelList.css("display") == "block") {
			controlPanelList.slideUp("fast","swing");
			controlPanelIcon.attr("class","expandIcon");
			controlPanelHeading.addClass("wsControlPanelCollapsed");
			
		} else {
			controlPanelList.slideDown("fast","swing");
			controlPanelIcon.attr("class","collapseIcon");
			controlPanelHeading.removeClass("wsControlPanelCollapsed")
		}
	});
};


var loadWizardTrain = function() {
	currentStep = apex.jQuery("li.currentStep","ul.ebaProgressWizard");
	if (currentStep.prev().length > 0) {
		currentStep.prevAll().addClass("completedStep");
	}
};

var text2html = function(str){
	return str
		.replace(/\&lt;/g, '<')
		.replace(/\&gt;/g, '>')
		.replace(/\&amp;/g, '&')
		.replace(/\&apos;/g, '\'')
		.replace(/\&quot;/g, '"');
};

var html2text = function(str) {
	return str
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/&/g, '&amp;')
		.replace(/'/g, '&apos;')
		.replace(/"/g, '&quot;');
};

var scrollTopLink = function(){
	apex.jQuery("a[href='#top']").click(function(){
		apex.jQuery("html,body").animate({scrollTop: 0},'fast');
		return false;
	});
};

var loadScrollingNavLinks = function(){
	apex.jQuery("a","#wsSectionNavigation").click(function(){
		apex.jQuery("html,body").animate({scrollTop: apex.jQuery(apex.jQuery(this).attr("href")).offset().top},'fast');
	});
};

var loadFormTable = function(){
	apex.jQuery("input, select, textarea","table.formlayout > tbody > tr > td").focusin(function(){
		apex.jQuery(this).closest("tr").addClass("rowHighlight");
	}).focusout(function(){
		apex.jQuery(this).closest("tr").removeClass("rowHighlight");
	});
};

// ===========================
// = Edit Section Navigation =
// ===========================

var applyAndGoToNextSection = function(current_page,next_section_page_id,next_section_item_name,next_section_id) {
	$s("P"+current_page+"_NEXT_SECTION_PAGE_ID",next_section_page_id);
	$s("P"+current_page+"_NEXT_SECTION_ITEM_NAME",next_section_item_name);
	$s("P"+current_page+"_NEXT_SECTION_ID",next_section_id);
	apex.submit('SAVEANDGOTONEXT');
};

var applyAndGoToNextPage = function(next_page_id) {
	$s("P53_NEXT_PAGE_ID",next_page_id);
	apex.submit('GET_NEXT_PAGE');
};

var loadCollapsableSidePane = function(){
	sideCol = apex.jQuery("#wsSideCol");
	apex.jQuery("#sideColControl").click(function(){
		apex.jQuery(this).find("img").toggleClass("hideIcon").toggleClass("showIcon");
		sideCol.toggleClass("wsSideColCollapsed","fast");
	});
};

var initHighContrastMode = function(){
	// Replace Images with ALT Text 
	apex.jQuery('a img[src$="spacer.gif"][alt!=""]').each(function(){
		image = apex.jQuery(this);
		image.parent("a").text(image.attr("alt"));
	});
};
