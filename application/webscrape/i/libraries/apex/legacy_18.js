/*!
 Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
*/
/*jshint nomen: false, evil: false, browser: true, eqeqeq: false, white: false, undef: false, indent: false */
/*
 * This file holds for legacy purpose all the old non-namespaced JavaScript functions of APEX.
 */
/* ================================================
 * Moved to legacy in 18.1
 * ================================================ */

/* tool tip section */

/** @ignore */
var tt_target;

/** @ignore */
var gToolTipGraphic = "arrow2.gif";

/** @ignore */
var gToolTip = false;

/** @ignore */
var gToopTipPointer = false;

/** @ignore */
var gToolTipContent = false;

/** @ignore */
function toolTip_init(){
    if (document && document.body) {
        gToolTipContent = $x('gToolTipContent');
        gToolTip = $x("dhtmltooltip");
        if (!gToolTip){
            gToolTip = $dom_AddTag(document.body,'DIV');
            gToolTip.id="dhtmltooltip";
            gToolTip.className="htmldbToolTip";
            gToolTip.style.position = "absolute";
            gToolTip.style.border="1px solid black";
            gToolTip.style.padding="2px";
            gToolTip.style.backgroundColor="";
            gToolTip.style.visibility="hidden";
            gToolTip.style.zIndex=10000;
        }
        gToopTipPointer=$x("dhtmlpointer");
        if (!gToopTipPointer) {
            gToopTipPointer = $dom_AddTag(document.body,'IMG');
            gToopTipPointer.id="dhtmlpointer";
            gToopTipPointer.src= htmldb_Img_Dir + gToolTipGraphic;
            gToopTipPointer.style.position = "absolute";
            gToopTipPointer.style.zIndex=10001;
        }
        return true;
    } else {
        return false;
    }
}

/** @ignore */
function toolTip_disable(){
    if(toolTip_init()){
        tt_target = null;
        gToolTip.style.visibility="hidden";
        gToolTip.style.backgroundColor='';
        gToolTip.style.width='';
        gToopTipPointer.style.visibility="hidden";
        if(gToolTipContent){gToolTipContent.innerHTML='';}
        else{gToolTip.innerHTML='';}
    }
}

/** @ignore */
function toolTip_enable(evt,obj,tip, width, color){
    evt=(evt)?evt:((window.event)?event:null);
    var target_x=evt.pageX?evt.pageX:evt.clientX+getScrollXY()[0];
    var target_y=evt.pageY?evt.pageY:evt.clientY+getScrollXY()[1];
    if(toolTip_init()){
        tt_target = obj;
        if(!tip){tip = obj.getAttribute("htmldb:tip");}
        if(gToolTipContent){gToolTipContent.innerHTML=tip;}else{gToolTip.innerHTML=tip;}
        if(!!width){gToolTip.style.width=width+"px";}
        if(!!color){gToolTip.style.backgroundColor=color;}else{gToolTip.style.backgroundColor="lightyellow";}
        gToopTipPointer.style.left = ( 10 + target_x ) +"px";
        gToopTipPointer.style.top  = (15 + target_y ) +"px";
        gToolTip.style.left = ( 7 + target_x ) +"px";
        gToolTip.style.top  = ( 28 + target_y ) +"px";
        gToolTip.style.visibility="visible";
        gToolTip.style.zIndex=10000;
        gToopTipPointer.style.zIndex=10001;
        gToopTipPointer.style.visibility="visible";
        try {obj.addEventListener("mouseout",toolTip_disable, false);}
        catch(e){obj.attachEvent('onmouseout',toolTip_disable);}
    }
    return false;
}

/** @ignore */
function toolTip_follow(evt,obj){
    evt=(evt)?evt:((window.event)?event:null);
    var target_x=evt.pageX?evt.pageX:evt.clientX+getScrollXY()[0];
    var target_y=evt.pageY?evt.pageY:evt.clientY+getScrollXY()[1];
    if (gToolTip) {
        gToolTip.style.left = ( 7 + target_x ) +"px";
        gToolTip.style.top  = ( 28 + target_y ) +"px";
        gToolTip.style.visibility="visible";
        gToolTip.style.zIndex=10000;
        gToopTipPointer.style.left = ( 10 + target_x ) +"px";
        gToopTipPointer.style.top  = (15 + target_y ) +"px";
        gToopTipPointer.style.zIndex=10001;
        gToopTipPointer.style.visibility="visible";
    }
    return false;
}

if ( apex.theme ) {
    /**
     * Display item help in a "classic" popup window.
     * This is typically no longer used directly.
     *
     * Theme requirements for the label Help Template:
     * It is best to follow the requirements for popupFieldHelp.
     * - A click handler or javascript href can invoke this function directly. For example:
     *     <button ... onclick="apex.theme.popupFieldHelpClasic('#CURRENT_ITEM_ID#','&SESSION.');" ...>Help</button>
     *
     * @param pItemId item id to display help for or an object with properties helpText, and title; in this case the other
     *                parameters are ignored.
     * @param pSessionId current session id
     * @param pUrl optional override to specify the URL to use to fetch the help content. It should not include
     *          the p_output_format param. This is an advanced parameter that is normally not needed.
     * @memberOf apex.theme
     */
    apex.theme.popupFieldHelpClassic = function ( pItemId, pSessionId, pUrl ) {
        var url, popup;

        function writeDocument() {
            popup.document.open();
            // Keep in sync with sever generated item help
            popup.document.write( "<!DOCTYPE html><html><head><title>" +
                pItemId.title +
                "</title><link type='text/css' href='" +
                apex_img_dir +
                "app_ui/css/Core.css' rel='stylesheet'><link type='text/css' href='" +
                apex_img_dir +
                "apex_ui/css/Core.css' rel='stylesheet'><link type='text/css' href='" +
                apex_img_dir +
                "apex_ui/css/Theme-Standard.css' rel='stylesheet'></head></html>" +
                "<body style='min-height: 0px; min-width: 0px;'><div class='a-Region-header'><div class='a-Region-headerItems'><h1 class='a-Region-title'><b>" +
                pItemId.title +
                "</b></h1></div><div class='a-Region-headerItems a-Region-headerItems--buttons'><button class='a-Button' onclick='window.close();' type='button'>" +
                lang.getMessage( "APEX.DIALOG.CLOSE" ) +
                "</button></div></div><div class='apex-help-dialog'>" +
                pItemId.helpText +
                "</div></body>" );
            popup.document.close();
        }

        if ( !$.isPlainObject( pItemId ) ) {
            if ( pUrl ) {
                url = pUrl;
            } else {
                url = "wwv_flow_item_help.show_help?p_item_id=" + pItemId + "&p_session=" + pSessionId;
            }
            url += "&p_output_format=HTML";
        }
        // else url undefined intentionally

        popup = navigation.popup ({
            url:    url,
            name:   "Help",
            width:  500,
            height: 350
        });
        if ( !url ) {
            writeDocument();
        }
    }; //popupFieldHelpClassic
}

/* begin htmldb_Get */
/**
 * @constructor
 * @param {Dom node | String} [obj] object to put in the partial page
 * @param {String} [flow] flow id
 * @param {String} [req] request value
 * @param {String} [page] page id
 * @param {String} [instance] instance
 * @param {String} [proc] process to call
 * @param {String} [queryString] hodler for quesry string
 *
 * */
function htmldb_Get(obj,flow,req,page,instance,proc,queryString) {
    /* setup variables */
    this.obj         = $x(obj);                              // object to put in the partial page
    this.proc        = (!!proc) ? proc : 'wwv_flow.show';    // proc to call
    this.flow        = (!!flow) ? flow : $v('pFlowId');      // flowid
    this.request     = (!!req)  ? req : '';                  // request
    this.page        = (!!page) ? page : '0';
    this.queryString = (!!queryString) ? queryString : null; // holder for passing in f? syntax

    this.params   = '';   // holder for params
    this.response = '';   // holder for the response
    this.base     = null; // holder fot the base url
    this.syncMode     = false;
    // declare methods
    this.addParam     = htmldb_Get_addParam;
    this.add          = htmldb_Get_addItem;
    this.getPartial   = htmldb_Get_trimPartialPage;
    /**
     * function return the full response
     * */
    this.getFull      = function(obj){
        var result;
        var node;
        if (obj){this.obj = $x(obj);}
        if (this.obj){
            if(this.obj.nodeName == 'INPUT'){
                this.obj.value = this.response;
            }else{
                if(document.all){
                    result = this.response;
                    node = this.obj;
                    setTimeout(function() {htmldb_get_WriteResult(node, result)},100);
                }else{
                    $s(this.obj,this.response);
                }
            }
        }
        return this.response;
    } ;

    /**
     * @param {Dom Node | String | Array | Dom Array | String id}[]
     * @return *
     * */
    this.get          = function(mode,startTag,endTag){
        var p;
        try {
            p = new XMLHttpRequest();
        } catch (e) {
            p = new ActiveXObject("Msxml2.XMLHTTP");
        }
        try {
            p.open("POST", this.base, this.syncMode);
            p.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
            p.send(this.queryString == null ? this.params : this.queryString );
            this.response = p.responseText;
            if (this.node){this.replaceNode(p.responseXML);}
            if ( mode == null || mode =='PPR' ) {
                return this.getPartial(startTag,endTag);
            } if ( mode == "XML" ) {
                return p.responseXML;
            } else {
                return this.getFull();
            }

        } catch (e) {
            return;
        }
    };

    this.url          = htmldb_Get_getUrl;
    this.escape       = htmldb_Get_escape;
    this.clear        = htmldb_Get_clear;
    this.sync         = htmldb_Get_sync;
    this.setNode      = setNode;
    this.replaceNode  = replaceNode;

    // setup the base url
    var u = (window.location.href.indexOf("?") > 0) ? window.location.href.substring(0,window.location.href.indexOf("?")) : window.location.href;
    this.base = u.substring(0,u.lastIndexOf("/"));

    if (!this.proc){this.proc = u.substring(u.lastIndexOf("/")+1);}

    this.base = this.base +"/" + this.proc;

    // grab the instance form the page form
    if(instance==null||instance==""){
        this.instance = $v('pInstance');
    }else{
        this.instance = instance;
    }

    // finish setiing up the base url and params
    if ( ! queryString ) {
        this.addParam('p_request',     this.request) ;
        this.addParam('p_instance',    this.instance);
        this.addParam('p_flow_id',     this.flow);
        this.addParam('p_flow_step_id',this.page);
    }

    function setNode(id) {
        this.node = $x(id);
    }
    function replaceNode(newNode){
        var i;
        for(i=this.node.childNodes.length-1;i>=0;i--){
            this.node.removeChild(this.node.childNodes[i]);
        }
        this.node.appendChild(newNode);
    }
}
function htmldb_Get_sync(s){
    this.syncMode=s;
}

function htmldb_Get_clear(val){
    this.addParam('p_clear_cache',val);
}

//
// return the queryString
//
function htmldb_Get_getUrl(){
    return this.queryString == null ? this.base +'?'+ this.params : this.queryString;
}

function htmldb_Get_escape(val){
    // force to be a string
    val = val + "";
    val = val.replace(/\%/g, "%25");
    val = val.replace(/\+/g, "%2B");
    val = val.replace(/\ /g, "%20");
    val = val.replace(/\./g, "%2E");
    val = val.replace(/\*/g, "%2A");
    val = val.replace(/\?/g, "%3F");
    val = val.replace(/\\/g, "%5C");
    val = val.replace(/\//g, "%2F");
    val = val.replace(/\>/g, "%3E");
    val = val.replace(/\</g, "%3C");
    val = val.replace(/\{/g, "%7B");
    val = val.replace(/\}/g, "%7D");
    val = val.replace(/\~/g, "%7E");
    val = val.replace(/\[/g, "%5B");
    val = val.replace(/\]/g, "%5D");
    val = val.replace(/\`/g, "%60");
    val = val.replace(/\;/g, "%3B");
    val = val.replace(/\?/g, "%3F");
    val = val.replace(/\@/g, "%40");
    val = val.replace(/\&/g, "%26");
    val = val.replace(/\#/g, "%23");
    val = val.replace(/\|/g, "%7C");
    val = val.replace(/\^/g, "%5E");
    val = val.replace(/\:/g, "%3A");
    val = val.replace(/\=/g, "%3D");
    val = val.replace(/\$/g, "%24");
    //val = val.replace(/\"/g, "%22");
    return val;
}
// Simple function to add name/value pairs to the url
function htmldb_Get_addParam(name,val){
    if ( this.params == '' ) {
        this.params =  name + '='+ ( val != null ? this.escape(val)  : '' );
    }
    else {
        this.params = this.params + '&'+ name + '='+ ( val != null ? this.escape(val)  : '' );
    }
}
/** Simple function to add name/value pairs to the url */
function htmldb_Get_addItem(name,value){
    this.addParam('p_arg_names',name);
    this.addParam('p_arg_values',value);
}
/** funtion strips out the PPR sections and returns that */
function htmldb_Get_trimPartialPage(startTag,endTag,obj) {
    if(obj) {this.obj = $x(obj);}
    if(!startTag){startTag = '<!--START-->'}
    if(!endTag){endTag  = '<!--END-->'}
    var start = this.response.indexOf(startTag);
    var result;
    var node;
    if(start>0){
        this.response  = this.response.substring(start+startTag.length);
        var end   = this.response.indexOf(endTag);
        this.response  = this.response.substring(0,end);
    }
    if(this.obj){
        if(document.all){
            result = this.response;
            node = this.obj;
            setTimeout(function() {htmldb_get_WriteResult(node, result)},100);
        }else{
            $s(this.obj,this.response);
        }
    }
    return this.response;
}

function htmldb_get_WriteResult(node, result){
    $s(node,result);
}


/**
 * Adds asynchronous AJAX to the {@link htmldb_Get} object.
 *
 * @param {function} pCallback Function that you want to call when the xmlhttp state changes
 *                             in the function specified by pCallback. The xmlhttp object can be referenced by declaring
 *                             a parameter, for example pResponse in your function.
 * @extends htmldb_Get
 */
htmldb_Get.prototype.GetAsync = function(pCallback){
    var lRequest;
    try{
        lRequest = new XMLHttpRequest();
    }catch(e){
        lRequest = new ActiveXObject("Msxml2.XMLHTTP");
    }
    try {
        lRequest.open("POST", this.base, true);
        if (lRequest) {
            lRequest.onreadystatechange = function(){
                // for backward compatibility we will also assign the request to the global variable p
                p = lRequest;
                pCallback(lRequest);
            };
            lRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
            lRequest.send(this.queryString == null ? this.params : this.queryString );
            return lRequest;
        }
    }catch(e){
        return false;
    }
};

htmldb_Get.prototype.AddArray=function(pArray,pFnumber){
    var lFName = 'f';
    pFnumber = $nvl(pFnumber,1);
    if(pFnumber<10){lFName+='0'+pFnumber}else{lFName+=pFnumber}
    for(var i=0,len=pArray.length;i<len;i++){this.addParam(lFName,pArray[i]);}
    return this;
};

htmldb_Get.prototype.AddArrayItems=function(pArray,pFnumber){
    var lFName = 'f';
    pFnumber = $nvl(pFnumber,1);
    if(pFnumber<10){lFName+='0'+pFnumber}else{lFName+=pFnumber}
    for(var i=0,len=pArray.length;i<len;i++){this.addParam(lFName,$nvl($v(pArray[i])),'');}
    return this;
};

htmldb_Get.prototype.AddNameValue=function(pName,pValue,pFnumber){
    var pFnumber2;
    var lFName = 'f';
    var lFName2 = 'f';
    pFnumber = $nvl(pFnumber,1);
    pFnumber2 = pFnumber + 1;
    if(pFnumber<10){
        lFName+='0'+pFnumber}
    else{
        lFName+=pFnumber}
    if(pFnumber2<10){
        lFName2+='0'+pFnumber2;}
    else{
        lFName2+=pFnumber2;}
    this.addParam(lFName,pName);
    this.addParam(lFName2,$nvl(pValue),'');
    return this;
};

htmldb_Get.prototype.AddArrayItems2=function(pArray,pFnumber,pKey){
    var i, len, lTest, pFnumber2;
    var lFName = 'f';
    var lFName2 = 'f';
    pFnumber = $nvl(pFnumber,1);
    pFnumber2 = pFnumber + 1;
    if(pFnumber<10){
        lFName+='0'+pFnumber
    }else{
        lFName+=pFnumber
    }
    if(pFnumber2<10){
        lFName2+='0'+pFnumber2;
    }else{
        lFName2+=pFnumber2;
    }

    for(i=0,len=pArray.length;i<len;i++){
        lTest = $x(pArray[i]);
        if(lTest && lTest.id.length != 0){
            if (pKey) {
                this.addParam(lFName, apex.jQuery(lTest).attr(pKey));
            } else {
                this.addParam(lFName, lTest.id);
            }
        }
    }
    for(i=0,len=pArray.length;i<len;i++){
        lTest = $x(pArray[i]);
        if(lTest && lTest.id.length != 0){
            this.addParam(lFName2,$nvl($v(lTest)),'');
        }
    }

    return this;
};

htmldb_Get.prototype.AddArrayClob=function(pText,pFnumber){
    var lArray = $s_Split(pText,4000);
    this.AddArray(lArray,pFnumber);
    return this;
};

htmldb_Get.prototype.AddPageItems = function(pArray){
    for(var i=0,len=pArray.length;i<len;i++){
        if($x(pArray[i])){this.add($x(pArray[i]).id,$v(pArray[i]));}
    }
};

htmldb_Get.prototype.AddGlobals=function(p_widget_mod,p_widget_action,p_widget_action_mod,p_widget_num_return,x01,x02,x03,x04,x05,x06,x07,x08,x09,x10){
    this.addParam('p_widget_mod',p_widget_mod);
    this.addParam('p_widget_action',p_widget_action);
    this.addParam('p_widget_action_mod',p_widget_action_mod);
    this.addParam('p_widget_num_return',p_widget_num_return);
    this.addParam('x01',x01);
    this.addParam('x02',x02);
    this.addParam('x03',x03);
    this.addParam('x04',x04);
    this.addParam('x05',x05);
    this.addParam('x06',x06);
    this.addParam('x07',x07);
    this.addParam('x08',x08);
    this.addParam('x09',x09);
    this.addParam('x10',x10);
    return this;
};

/**
 * @function
 * Post Large Strings
 * */
function $a_PostClob(pThis,pRequest,pPage,pReturnFunction){
    var get = new htmldb_Get(null,$v('pFlowId'),pRequest,pPage, null, 'wwv_flow.accept');
    get.AddArrayClob($x(pThis).value,1);
    get.GetAsync(pReturnFunction);
    get=null;
}

/**
 * @function
 * Get Large Strings
 * */
function $a_GetClob(pRequest,pPage,pReturnFunction){
    var get = new htmldb_Get(null,$v('pFlowId'),pRequest,pPage, null,'wwv_flow.accept');
    get.GetAsync(pReturnFunction);
}

/**
 * @ignore
 * */
function ob_PPR_TAB(l_URL){
    // This function is only for use in the SQL Workshop Object Browser!
    top.gLastTab = l_URL;
    var lBody = document.body;
    var http = new htmldb_Get(lBody,null,null,null,null,'f',l_URL.substring(2));
    http.get(null,'<body  style="padding:10px;">','</body>');
}

/* end htmldb_Get */

/**
 * Gets PDF src XML
 * */
function htmldb_ExternalPost(pThis,pRegion,pPostUrl){
    var pURL = 'f?p='+$x('pFlowId').value+':'+$x('pFlowStepId').value+':'+$x('pInstance').value+':FLOW_FOP_OUTPUT_R'+pRegion;
    document.body.innerHTML = document.body.innerHTML + '<div style="display:none;" id="dbaseSecondForm"><form id="xmlFormPost" action="' + pPostUrl + '?ie=.pdf" method="post" target="pdf"><textarea name="vXML" id="vXML" style="width:500px;height:500px;"></textarea></form></div>';
    var l_El = $x('vXML');
    var get = new htmldb_Get(l_El,null,null,null,null,'f',pURL.substring(2));
    get.get();
    get = null;
    setTimeout( function() {
        $x("xmlFormPost").submit();
    },10 );
}

/**
 * @namespace apex.ajax
 * @deprecated Use apex.server
 */
apex.ajax = {
    /**
     * @param {?} pReturn
     * */
    clob : function (pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,$x('pFlowId').value,'APXWGT',0);
        this.ajax.addParam('p_widget_name','apex_utility');
        this.ajax.addParam('x04','CLOB_CONTENT');
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;

        function _get(pValue){
            that.ajax.addParam('x05','GET');
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){
            that.ajax.addParam('x05','SET');
            that.ajax.AddArrayClob(pValue,1);
            that.ajax.GetAsync(that._return);
        }
        function _return() {
            if(p.readyState == 1){
            }else if(p.readyState == 2){
            }else if(p.readyState == 3){
            }else if(p.readyState == 4){
                return p;
            }else{return false;}
        }
    },
    /**
     * @param {?} pReturn
     * */
    test : function (pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,$x('pFlowId').value,'APXWGT',0);
        this.ajax.addParam('p_widget_name','apex_utility');
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;

        function _get(pValue){
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){}
        function _return(pValue){}
    },
    /**
     * @param {?} pWidget
     * @param {?} pReturn
     * */
    widget : function (pWidget,pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,$x('pFlowId').value,'APXWGT',0);
        this.ajax.addParam('p_widget_name',pWidget);
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;

        function _get(pValue){
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){}
        function _return(pValue){}
    },
    /**
     * @param {?} pWidget
     * @param {?} pReturn
     * @deprecated Use apex.server.process
     * */
    ondemand : function (pWidget,pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,$x('pFlowId').value,'APPLICATION_PROCESS='+pWidget,0);
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;

        function _get(pValue){
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){}
        function _return(pValue){}
    },
    /**
     * @param {?} pUrl
     * @param {?} pReturn
     * */
    url : function (pUrl,pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,null,null,null,null,'f',pUrl);
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;

        function _get(pValue){
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){}
        function _return(pValue){}
    }

};

/* begin legacy menu */

function item_menu(pThis,pColumn){
    $x_Style('item_menu','position','absolute');
    var lA = $x('item_menu').getElementsByTagName('a');
    for (var i=0,len=lA.length;i<len;i++){
        var lHref = lA[i].href;
        lHref=lHref.split(':');
        lHref[lHref.length-1] = pColumn;
        lA[i].href = $u_ArrayToString(lHref,':')
    }
    dhtml_ButtonDropDown(pThis,'item_menu');
    $x_Show('item_menu');
}

/*Begin DHTML Menus*/

/**
 * @ignore
 * */
var gCurrentAppMenu = false;

/** @ignore */
var gCurrentAppMenuImage = false;

/** @ignore */
var $gCurrentAnchorList = false;

/** @ignore */
var gSubMenuArray = [];

/** @ignore */
var g_Single_Menu = false;

/** @ignore */
var g_Single_Menu_Count = 0;



/** @ignore */
function dhtml_CloseAllSubMenus(pStart){
    var l_Start = null;
    if(!pStart){l_Start = 0;}
    else{l_Start = pStart;}

    for (var i=l_Start;i<=gSubMenuArray.length;i++){
        if(gSubMenuArray[i]){
            var l_Sm = $x_Hide(gSubMenuArray[i]);
            if(l_Sm){$x_Hide(l_Sm);}
        }
    }
    /*if you deleted starting from level do not null out array*/
    if(!pStart){gSubMenuArray.length = 0;}
    htmldb_IE_Select_Item_Fix(false);

    // reset global anchor list to main app menu
    $gCurrentAnchorList = apex.jQuery('#' + gCurrentAppMenu).children().children().filter('a[class!=eLink]');
}

/** @ignore */
function dhtml_CloseAllSubMenusL(pThis){
    var l_Start = parseInt($x_UpTill(pThis,'UL').getAttribute("htmldb:listlevel"),10)+1;
    dhtml_CloseAllSubMenus(l_Start);
}

/** @ignore */
var g_dhtmlMenu = "dhtmlMenu";

/** @ignore */
function app_AppMenuMultiClose(){
    if(gCurrentAppMenu){
        var lMenu = $x(gCurrentAppMenu);
        gCurrentAppMenuImage.className = g_dhtmlMenu;
        $x_Hide(lMenu);
        gCurrentAppMenu = false;
        gCurrentAppMenuImage = false;
        $gCurrentAnchorList = false;
    }
}

/** @ignore */
function dhtml_DocMenuCheck(e){
    var tPar = html_GetTarget(e);
    var l_Test = true;
    while(tPar.nodeName != 'BODY'){
        tPar = tPar.parentNode;
        if ($u_SubString(tPar.className,'dhtmlMenuLG')) { l_Test = !l_Test;}
    }
    if (l_Test) {
        app_AppMenuMultiClose();
        dhtml_CloseAllSubMenus();
        document.onclick = null;
    }
}

/** @ignore */
function dhtml_ButtonDropDown(pThis,pThat,pDir,pX,pY){
    dhtml_SingeMenuOpen(pThis,pThat,'Bottom',pX,pY);
}


function dhtml_KeyAction(pEvent, pEventNamespace) {
    var $lCurrentAnchor, lIndex;
    // set event target as the current anchor, could also be root
    $lCurrentAnchor = apex.jQuery(pEvent.target);
    // get the index of the current anchor, could be -1 if event target was not in the anchor list (like if
    // it was the root menu element (action button for actions menu in irr for example).
    lIndex = $gCurrentAnchorList.index($lCurrentAnchor);

    // switch on the key code
    switch (pEvent.which) {
        case 40:    // DOWN
            // set focus to next anchor in list
            $gCurrentAnchorList.eq(lIndex + 1).focus();
            break;
        case 38:    // UP
            // set focus to next anchor in list
            $gCurrentAnchorList.eq(lIndex - 1).focus();
            break;
        case 37:    // LEFT
            // get the parent menu item, only currently support 1 level of sub-menus
            var $lParent = apex.jQuery('#' + gCurrentAppMenu + ' a').filter( function() {return apex.jQuery(this).data('setParent') == true;});
            // only proceed if there is a parent
            if ($lParent.length > 0) {
                // close sub menu
                dhtml_CloseAllSubMenusL($lParent[0]);
                // set focus to parent and reset 'setParent' data value
                $lParent
                    .focus()
                    .data('setParent', false);
            }
            break;
        case 39:    // RIGHT
            // only proceed if the current anchor is the parent of a sub-menu, denoted by the presence of
            // the class 'dhtmlSubMenuN' or 'dhtmlSubMenuS'
            if ($lCurrentAnchor.parent().hasClass('dhtmlSubMenuN') || $lCurrentAnchor.parent().hasClass('dhtmlSubMenuS')) {
                // trigger mouseover event on anchor, contains call to dhtml_MenuOpen for relevant sub menu
                $lCurrentAnchor.trigger('mouseover');
                // set focus to first element in new anchor list
                $gCurrentAnchorList[0].focus();
                // set setParent flag so focus can be set back if the user clicks left from sub-menu
                $lCurrentAnchor.data('setParent', true);
            }
            break;
        case 13:    // ENTER
            // just return out of function, to avoid default prevention
            return;
            break;
    }
    // prevent default browser key handling for all, except when ENTER pressed, this returns early
    pEvent.preventDefault();
}

/** @ignore */
function dhtml_MenuOpen(pThis,pThat,pSub,pDir,pRoot){
    var lNamespace;
    if($x(pThat)) {
        // set event namespace name on 'menu_keys_' + [ID of the current menu]
        lNamespace = 'menu_keys_' + pThat;
        document.onclick = dhtml_DocMenuCheck;
        apex.jQuery(document).unbind('keydown.' + lNamespace + '_esc').bind('keydown.' + lNamespace + '_esc', function(event) {
            if (event.which === 27) {
                app_AppMenuMultiClose();
                dhtml_CloseAllSubMenus();
                document.onclick = null;
                if(pRoot){
                    apex.jQuery(pRoot).focus();
                }
            }
        });

        // if we're not opening a sub-menu, close all sub menus and set global for current menu to pThat (just an id)
        if(!pSub) {
            dhtml_CloseAllSubMenus();
            gCurrentAppMenu = pThat;
        }else{
            // get the level of the sub-menu to open
            var l_Level = parseInt($x(pThat).getAttribute("htmldb:listlevel"),10);
            // in case a sub-menu is already displayed, hide it
            var l_Temp = gSubMenuArray[l_Level];
            if(l_Temp) {
                $x_Hide(l_Temp);
            }
            // set global for sub menu to the sub-menu to open
            gSubMenuArray[l_Level] = $x(pThat);
        }
        $gCurrentAnchorList = apex.jQuery('#' + pThat).children().children().filter('a[class!=eLink]');

        // add event handlers for keystrokes
        apex.jQuery(document).unbind('keydown.' + lNamespace).bind('keydown.' + lNamespace, function(event){
            // setup key codes for specific keys supported (down, up, left, right, return)
            var lKeyCodes = [40,38,37,39,13];
            // check if the menu is visible and that the key pressed is one of the supported keys
            if (apex.jQuery('#' + pThat + ':visible').filter('ul')[0] && apex.jQuery.inArray(event.which, lKeyCodes) !== -1 ) {
                dhtml_KeyAction(event, lNamespace);
            }
        });

        // pThat stores ID of menu to open, store the DOM element of the main menu in local variable
        var lMenu = $x(pThat);
        // add the menu to the DOM
        document.body.appendChild(lMenu);
        if(!pDir || pDir == 'Right') {
            lMenu.style.position = "absolute";
            lMenu.style.top = (parseInt(findPosY(pThis),10)+"px");
            lMenu.style.left = (parseInt(findPosX(pThis),10)+"px");
        }else if(pDir == 'Bottom') {
            lMenu.style.position = "absolute";
            lMenu.style.top = (parseInt(findPosY(pThis),10) + parseInt(pThis.offsetHeight,10)+"px");
            lMenu.style.left = (parseInt(findPosX(pThis),10)+"px");
        }else if(pDir == 'BottomRight') {
            lMenu.style.position = "absolute";
            lMenu.style.top = (parseInt(findPosY(pThis),10) + parseInt(pThis.offsetHeight,10)+"px");
            lMenu.style.left = (parseInt(findPosX(pThis),10) - parseInt(pThis.offsetWidth,10)+"px");
        }else{
            lMenu.style.position = "absolute";
            lMenu.style.top = (parseInt(findPosY(pThis),10)+"px");
            lMenu.style.left = (parseInt(findPosX(pThis),10) + parseInt(pThis.offsetWidth,10)+"px");
        }
        // show the menu
        $x_Show(lMenu);
        dhtml_FixLeft(pThis, lMenu, pDir);
        htmldb_IE_Select_Item_Fix(lMenu);
    }
}

/** @ignore */
function dhtml_DocMenuSingleCheck(e,force){
    if(g_Single_Menu_Count > 0){
        var l_Test = true;
        if(e){
            var tPar = html_GetTarget(e);
            while(tPar.nodeName != 'BODY' && !force){
                tPar = tPar.parentNode;
                if(tPar == g_Single_Menu){l_Test = !l_Test;}
            }
        }
        if(l_Test || force){
            $x_Hide(g_Single_Menu);
            document.onclick = null;
        }else{}
    }else{
        g_Single_Menu_Count = 1;
    }
}

/** @ignore */
function dhtml_SingeMenuOpen(pThis,pThat,pDir,pX,pY){
    var lMenu = $x(pThat);
    var lThis = $x(pThis);
    lMenu.style.zIndex = 2001;
    document.body.appendChild(lMenu);
    if(!pDir || pDir == 'Right'){
        lMenu.style.position = "absolute";
        lMenu.style.top = (parseInt(findPosY(lThis),10)+"px");
        lMenu.style.left = (parseInt(findPosX(lThis),10)+"px");
    }else if(pDir == 'Bottom'){
        lMenu.style.position = "absolute";
        lMenu.style.top = (parseInt(findPosY(lThis),10) + parseInt(lThis.offsetHeight,10)+"px");
        lMenu.style.left = (parseInt(findPosX(lThis),10)+"px");
    }else if(pDir == 'BottomRight'){
        lMenu.style.position = "absolute";
        lMenu.style.top = (parseInt(findPosY(lThis),10) + parseInt(lThis.offsetHeight,10)+"px");
        lMenu.style.left = (parseInt(findPosX(lThis),10) - parseInt(lThis.offsetWidth,10)+"px");
    }else if(pDir == 'Set'){
        lMenu.style.position = "absolute";
        lMenu.style.top = (parseInt(pY,10)+"px");
        lMenu.style.left = (parseInt(pX,10)+"px");
    }else {
        lMenu.style.position = "absolute";
        lMenu.style.top = (parseInt(findPosY(lThis),10)+"px");
        lMenu.style.left = (parseInt(findPosX(lThis),10) + parseInt(lThis.offsetWidth,10)+"px");
    }

    $x_Show(lMenu);
    dhtml_FixLeft(lThis,lMenu,pDir);
    htmldb_IE_Select_Item_Fix(true);
    g_Single_Menu_Count = 0;
    g_Single_Menu = lMenu;
    document.onclick = dhtml_DocMenuSingleCheck;
}

/** @ignore */
function dhtml_FixLeft(pThis,pMenu,pDir){
    var l_Width;
    if (document.all) {
        l_Width = document.body.clientWidth;
    } else {
        l_Width = window.innerWidth;
    }
    if (pDir=='Bottom') {
        if(parseInt(l_Width,10) < parseInt(findPosX(pThis),10) + parseInt(pThis.offsetWidth,10) + parseInt(pMenu.offsetWidth,10)){
            pMenu.style.position = "absolute";
            pMenu.style.left = ((parseInt(findPosX(pThis),10) - parseInt(pMenu.offsetWidth,10))+parseInt(pThis.offsetWidth,10))+"px";
        }
    } else {
        if(parseInt(l_Width,10) < parseInt(findPosX(pThis),10) + parseInt(pMenu.offsetWidth,10)){
            pMenu.style.position = "absolute";
            pMenu.style.left = (parseInt(findPosX(pThis),10) - parseInt(pMenu.offsetWidth,10))+"px";
        }
    }
}

/** @ignore */
function htmldb_IE_Select_Item_Fix(pTest){
    /* only run in IE and only if there is a select in the page*/
    var lSel = document.getElementsByTagName('SELECT').length >= 1;
    if(document.all && pTest && lSel){
        if(pTest.firstChild && pTest.firstChild.nodeName != 'IFRAME'){
            pTest.innerHTML = '<iframe  src="'+htmldb_Img_Dir+'blank.html" width="'+pTest.offsetWidth+'" height="'+pTest.offsetHeight+'" style="z-index:-10;position: absolute;left: 0;top: 0;filter: progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0);" scrolling="no" frameborder="0"></iframe>' + pTest.innerHTML;
        }
    }
}

/** @ignore */
var g_dhtmlMenuOn = "dhtmlMenuOn";

/** @ignore */
function app_AppMenuMultiOpenBottom(pThis,pThat,pSub){
    if(pThis != gCurrentAppMenuImage){
        app_AppMenuMultiClose();
        var l_That = pThis.previousSibling.firstChild ;
        pThis.className = g_dhtmlMenuOn;
        dhtml_MenuOpen(l_That,pThat,false,'Bottom',pThis);
        gCurrentAppMenuImage = pThis;
    }else{
        dhtml_CloseAllSubMenus();
        app_AppMenuMultiClose();
    }
}

/** @ignore */
function app_AppMenuMultiOpenBottom2(pThis,pThat,pSub){
    if(pThis != gCurrentAppMenuImage){
        app_AppMenuMultiClose();
        var l_That = pThis.parentNode;
        pThis.className = g_dhtmlMenuOn;
        dhtml_MenuOpen(l_That,pThat,false,'Bottom',pThis);
        gCurrentAppMenuImage = pThis;
    }else{
        dhtml_CloseAllSubMenus();
        app_AppMenuMultiClose();
    }
}

/** @ignore */
function app_AppMenuMultiOpenBottom3(pThis,pThat,pMenu,pSub){
    if(pThis != gCurrentAppMenuImage){
        app_AppMenuMultiClose();
        var l_That = $x(pMenu);
        pThis.className = g_dhtmlMenuOn;
        dhtml_MenuOpen(l_That,pThat,false,'Bottom',pThis);
        gCurrentAppMenuImage = pThis;
    }else{
        dhtml_CloseAllSubMenus();
        app_AppMenuMultiClose();
    }
}