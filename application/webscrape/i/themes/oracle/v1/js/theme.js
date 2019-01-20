'article aside footer header hgroup nav section time'.replace(/\w+/g,function(n){document.createElement(n);});

function autoFadeSuccess(){
  setTimeout(function(){
    $("#uSuccessMessage").animate({
      height: 0, opacity: 0
    }, 1250, function(){
      $(this).remove();
    });
  },4000);
}
function fadeMessages(){
  $(".uCloseMessage").removeAttr('onclick').click(function(){
    $(this).parents("section.uMessageRegion").fadeOut();
  });
}

function loadHideShowRegions(){
  jQuery("a.uRegionControl").click(function(){
    var link = jQuery(this);
    var content = link.parents("div.uRegionHeading").next();
    link.toggleClass("uRegionCollapsed");
    if (content.css("display") === "block") {
      content.slideUp("fast","swing");
    } else {
      content.slideDown("fast","swing");
    }
  });
}

function detailedStatusListToolTip() {
 this.xOffset = 0; // x distance from mouse
 this.yOffset = 10; // y distance from mouse

 jQuery("ul.detailedStatusList > li[class!=detailedStatusListLegend]").hover(
   function(e) {
     var insideText = jQuery("section.detailedListTooltip",this).html();
     this.top = (e.pageY + yOffset); this.left = (e.pageX + xOffset);
     $('body').append('<div id="detailedStatusListToolTip">' + insideText + '</div>' );

     $('div#detailedStatusListToolTip').css("top", this.top+"px").css("left", this.left+"px").delay(500).fadeIn("fast");

   },
   function() {
     jQuery("div#detailedStatusListToolTip").fadeOut("false").remove();
   }
 ).mousemove(
   function(e) {
     this.top = (e.pageY + yOffset);
     this.left = (e.pageX + xOffset);
     jQuery("div#detailedStatusListToolTip").css("top", this.top+"px").css("left", this.left+"px");
   }
 );
}


// ========================
// = jQuery Modal Dialogs =
// ========================
// var gBackground;
// var gLightbox;

// function initLightbox() {
//   jQuery('body').append('<div id="modalBackground"></div>')
//   gBackground = jQuery('#modalBackground')
//   gBackground.click(function(){
//     gBackground.fadeOut(100);
//     closeModal()
//   });
// }

// function closeModal()
// {
//   if (gLightbox)
//   {
//     gLightbox.removeClass("modalOn").hide();
//     gLightbox = '';
//   }
//   gBackground.fadeOut(100);
// }


function closeModal() {
  $(".ui-dialog-content").dialog("close");
}

// function openModal(p_div_id)
// {
//  gBackground.fadeIn(100);
//  gLightbox = jQuery('#' + p_div_id);
//  gLightbox.addClass('modalOn').fadeIn(100);
// }

function openModal(pDialogId, pDialogTriggerId, pSetFocusId, pClear ) {
    var lDlg$,
        lClear = ( !pClear ) ? false : true;

    lDlg$ = $( '#' + pDialogId ).dialog( {
        draggable   : false,
        resizable   : false,
        modal       : true,
        autoOpen    : true,
        width       : '600px',
        title       : $( "h1.modal_title", $( '#' + pDialogId )).text(),
        beforeClose : function() {
            // Add leaving dialog message for screen reader users.
            $( "body" ).append( "<span class='visuallyhidden' role='alert' id='leavingDialogMsg'>Leaving Dialog</span>" );
        },
        close       : function() {
            if ( pDialogTriggerId ) {
                $( "#" + pDialogTriggerId ).focus();
            }
            // Remove the leaving message, after an arbitrary time. If this is done straight away, the alert does not
            // get announced by JAWS.
            setTimeout( function() {
                $( "#leavingDialogMsg").remove();
            }, 5000);

            // Clear all fields on close, can't do it on open, because of the case where the dialog is re-opened
            // after a validation has failed.
            if ( lClear ) {
                $( "input[type=text]").each(function(){
                    $s(this, "" );
                });
            }
        }
    });

    // Append dialog container to the form, so the form fields are POSTed
    lDlg$.parent().appendTo( "#" + pDialogId + "_parent" );

    // If custom focus has been passed to the function, use that to focus, otherwise fallback to default handling
    if ( pSetFocusId ) {
        $( "#" + pSetFocusId ).focus();
    } else {
        // The appendTo workaround causes focus to no longer be set in the right place,
        // so we have to explicitly set focus here also.
        // Set focus to first tabbable element in the dialog,
        // if there are no tabbable elements, set focus to the dialog itself.
        $( lDlg$.find( ":tabbable" ).get().concat(
            lDlg$.parent().get())).eq(0).focus();
    }

    // Prevent default browser behaviour
    $( "input[type=text],input[type=checkbox]", lDlg$ ).unbind( ".preventDefault" ).bind( "keydown.preventDefault", function( e ) {
        if ( e.which === 13 ) {
            e.preventDefault();
        }
    });

    //$( ".ui-widget-overlay" ).bind( "click", closeOverlayClick ); causes errors, check
}

// =========================
// = Content Frame SubTabs =
// =========================
function expandSection(sid) {
  var section = sid;
  $('#sub_'+sid).addClass('active');
  $(".showAllLink").removeClass('active');
  
  var all_sections = $('div.uFrameMain section.uHideShowRegion');

  all_sections.each(function(){
    var current = $(this);
    if (current.attr('id') === section) {
      // SHOW
      current.find('div.uRegionContent').show();
      current.find('a.uRegionControl').removeClass('uRegionCollapsed');
    } else {
      //HIDE
      current.find('div.uRegionContent').hide();
      current.find('a.uRegionControl').addClass('uRegionCollapsed');
    }
  });
}

function expandAllSections() {
  $('div.uFrameMain section.uHideShowRegion').each(function(){
    var current = $(this);
    current.find('div.uRegionContent').show();
    current.find('a.uRegionControl').removeClass('uRegionCollapsed');
  });
}
 function initContentFrameTabs(){
  $('div.uFrameRegionSelector > ul li a').click(function(e){
    e.preventDefault();
    var link = $(this);
    var subregions = link.parents('.uFrameMain').find('section.uHideShowRegion');
    link.parents("ul").find('li a').removeClass('active');
    if (link.hasClass('showAllLink')) {
    expandAllSections();
      // subregions.show();
      link.addClass('active');
    } else {
    expandSection(link.attr('id').substr(4));
      // subregions.hide();
      // $('#'+link.attr('id').substr(4)).show();
      // link.addClass('active');
    }
  });

  // read hashtag and see if it is a region that can be expanded, if so, expand the region
}

jQuery(window).ready(function(){
  loadHideShowRegions();

  // initialize globals
  // initLightbox();
  initContentFrameTabs();
  fadeMessages();
  autoFadeSuccess();
  if (window.location.hash) {
    // var regiontoshow = window.location.hash;
    expandSection(window.location.hash.substr(1));

  }
});

// Dropdown Menu
function aShowMenu(pMenu) {
  var lMenuID = pMenu;
  var lMenu = $('#'+lMenuID);
  var lSubMenu = $('#'+lMenuID+'_sub');
  var lActiveMenu = $(".aMenuActive");
  var lMenuItems = lSubMenu.find('li');

  function closeMenu(pMenu) {
    var closeMenuObj = pMenu;
    var closeMenuSub = closeMenuObj.find('#'+closeMenuObj.attr('id')+'_sub');
    closeMenuObj.removeClass('aMenuActive');
    closeMenuSub.hide();
    closeMenuObj.find(".aDM-topLink").focus();
    $(document).unbind('keydown.scroll click.menuoff');
  }

  function openMenu() {
    lSubMenu.unbind('keydown.nav');
    $('body').unbind('click');
    lMenu.addClass('aMenuActive');
    lMenuItems.removeClass('focused');
    lSubMenu.show();
    lSubMenu.css('top',lMenu.height());
    lSubMenu.find('li').first().addClass('focused').find('a').focus();
    lSubMenu
      .bind('keydown.nav',function(e){
        var focused = lMenuItems.filter(".focused");
        var current;

        lMenuItems.removeClass('focused');
        var keyPress = e.keyCode;
        if (keyPress === 40) {
          if (!focused.length || focused.is(':last-child')) {
            current = lMenuItems.first();
          } else {
            current = focused.next();
          }
        } else if (keyPress === 38) {
          if (!focused.length || focused.is(':first-child')) {
            current = lMenuItems.last();
          } else {
            current = focused.prev();
          }
        } else if (keyPress === 27) {
          closeMenu(lMenu);
        } else if (keyPress === 9) {
          closeMenu(lMenu);
          lMenu.next().focus();
        }
        if (current) {
          current.addClass('focused').find('a').focus();
        }
      });
    $(document).bind('keydown.scroll',function(e){
      var keyPress = e.which;
      if (keyPress === 38 || keyPress === 40) {
        e.preventDefault();
        return false;
      }
      return true;
    }).bind('click.menuoff',function(e){
      if ($(e.target).parents('.aDropMenu').size()<1) {
        closeMenu(lMenu);
      }
    });
    lMenuItems.hover(function(){
      lMenuItems.removeClass('focused');
      $(this).addClass('focused').find('a').focus();
    }).click(function(){
      closeMenu(lMenu);
    });
  }

  if (lActiveMenu.size() > 0) {
    if (lActiveMenu.attr('id') === lMenuID) {
      closeMenu(lMenu);
    } else {
      closeMenu(lActiveMenu);
      openMenu();
    }
  } else {
    openMenu();
  }
}