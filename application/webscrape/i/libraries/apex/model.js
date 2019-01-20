/*!
 Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/*global apex*/
/**
 * @namespace apex.model
 * @since 5.1
 * @desc
 * <p>The apex.model namespace contains methods used to manage client side Application Express data models. These models
 * store data for display by UI components. They correspond to the view-model in the Model-View-ViewModel (MVVM) pattern.
 * See {@link model} for details.</p>
 * <p>This namespace contains functions to manage the lifecycle of a model:</p>
 * <ul>
 * <li>Use {@link apex.model.create} to create a model.</li>
 * <li>Use {@link apex.model.list} to list all the existing models.</li>
 * <li>Use {@link apex.model.get} to return an existing model.</li>
 * <li>Use {@link apex.model.release} to release a model once you are done with it.</li>
 * </ul>
 * <p>Models are reference counted so for every call to <code class="prettyprint">get</code> or
 * <code class="prettyprint">create</code> you must call <code class="prettyprint">release</code>. Failure to do so can
 * result in unused models taking up memory. Typically the APEX region associated with the model will manage
 * its life cycle.
 * </p>
 * <p>Models typically act as an intermediary between data persisted on the server and one or more views on the client.
 * The <code class="prettyprint">regionId</code> option associates the model with an APEX region for the purpose of
 * fetching and saving data. Models can be created without a <code class="prettyprint">regionId</code>. These are
 * known as local models and they cannot fetch data from or save data to the server.
 * </p>
 * <p>There are also methods such as {@link apex.model.save}, {@link apex.model.anyChanges}, and {@link apex.model.anyErrors}
 * that operate on multiple models.
 * </p>
 * <h3 id="master-detail">Master Detail
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#master-detail"></a>
 * </h3>
 * <p>Models can be arranged in a master detail configuration. This is done by providing the
 * <code class="prettyprint">parentModel</code> and <code class="prettyprint">parentRecordId</code>
 * options when creating the detail models. A single master model can have multiple kinds of detail models. For example
 * projects can have tasks and members as details. Each kind of detail model has one or more model instances; each related
 * to a record in the master model. Detail instance models share the same name and field configuration but each
 * has a distinct instance id and different data. A model is uniquely identified by a {@link model.ModelId}, which in the case
 * of a detail model contains the detail name and instance id. Detail models are cached so that data doesn't have to be
 * fetched from the server unnecessarily. The view layer typically shows a view of the detail instance model that is
 * associated with the current record of the master view. As the current record of the master changes the view layer
 * changes the detail model instance the detail view is showing. The view layer will get a cached instance model if
 * there is one and if not will create the instance model. The maximum number of detail instances to cache is controlled
 * with the {@link apex.model.getMaxCachedModels} and {@link apex.model.setMaxCachedModels} functions. It is the least
 * recently used model that is kicked out of the cache. Models that have changes are not destroyed unless
 * {@link apex.model.destroy} is called.</p>
 * <p>A detail model can be a master to its own set of sub-detail models. This relationship can be nested to any depth.</p>
 */

/**
 * @interface model
 * @since 5.1
 * @classdesc
 * <p>A model holds data in memory for use by the UI layer. It corresponds to the view-model in the Model-View-ViewModel
 * (MVVM) pattern. The UI can both read and write the data.
 * A model can notify interested parties (subscribers) when the data changes. The data comes (is fetched) from
 * the server and updates can be written back (saved) to the server.</p>
 *
 * <p>Models are created and managed with functions of the {@link apex.model} namespace.
 * A model is uniquely identified by a {@link model.ModelId}, which is a string name and optional string instance id.</p>
 *
 * <p>A model can hold data of different shapes. They are:</p>
 * <ul>
 * <li>table: The data is an ordered collection of records. In database or UI terms the record might be called a row.
 *    See {@link model.Record}.</li>
 * <li>tree: The data is a single root record and each record including the root can have an ordered collection of
 *    any number of child records. When dealing with trees it is common to call the records nodes. See {@link model.Node}.</li>
 * <li>record: The data is a single record. In some cases this is treated as a collection of one.</li>
 * </ul>
 *
 * <p>Each record can have any number of named fields. See {@link model.Record}. All records in the collection must have
 * the same set of fields although the value of some fields may be null. In database or UI terms the fields
 * might be called columns. The actual storage of a record could be an object or an array. If records are objects then the
 * fields of the record are the properties of the object. If the records are arrays the fields of the record are
 * elements of the array and the {@link model.FieldMeta} <code class="prettyprint">index</code> property is used to
 * map from the field name to the record array index.</p>
 *
 * <p>The model has very few restrictions on the values of fields and doesn't know the data type of the field.
 * However typically when the model data is backing APEX items or HTML form controls the values will all be strings.
 * The model optionally uses the following fields for specific purposes:</p>
 * <ul>
 * <li>identity: A string value that uniquely identifies the record. There can be multiple identity fields.
 *      Required for editable models. See {@link apex.model.create} option <code class="prettyprint">identityField</code>.</li>
 * <li>meta: An object with additional metadata about the record. See {@link apex.model.create} option <code class="prettyprint">metaField</code>.</li>
 * <li>children: (tree shape only) An array of the child records (nodes). See {@link apex.model.create} option <code class="prettyprint">childrenField</code>.</li>
 * <li>parent identity: (tree shape only) A string value that identifies the parent record (node) of this record (node).
 *      Required for editable tree shaped models. See {@link apex.model.create} option <code class="prettyprint">parentIdentityField</code>.</li>
 * </ul>
 *
 * <p>Another special case is for field values that have a display value in addition to their intrinsic value. These
 * composite values have the form: <code class="prettyprint">{ d: "<i>display value</i>", v: <i>value</i> }</code>
 * When comparing values during {@link model#setValue} only the value is considered not the display value.
 * Also when the changes are saved to the server just the value is included without being wrapped
 * in an object. Other special fields such as identity or parent etc. cannot have this structure.</p>
 *
 * <h3>Aggregations:</h3>
 * <p>Aggregations are just rows that the server includes in order among all the other rows marked with meta data
 * property <code class="prettyprint">agg: true</code>. The aggregate record has most fields empty except for the
 * aggregate fields that contain the aggregate value.</p>
 *
 * @example <caption>Models are typically used by advanced widgets to display, interact with, and edit data.
 * The following is a high level sketch of how a widget might use a table shape model. Much of the work in
 * interfacing with a model is handled by {@link tableModelViewBase} so deriving a widget from that
 * base widget can save time and effort.</caption>
 * // The widget can create the model during widget initialization
 * this.model = apex.model.create( modelName, options, initialData, ... );
 *
 * // Or it can be configured with the name of a model that already exists and get a reference to it
 * this.model = apex.model.get( modelName );
 *
 * // In either case subscribe to model notifications
 * this.modelViewId = this.model.subscribe( {
 *     onChange: modelNotificationFunction,
 * } );
 *
 * // During create or when the widget is refreshed it should render data from the model
 * // this.pageOffset starts a 0. When the user changes pages or additional page data is needed run this code again
 * // the model fetches more data from the server as needed.
 * var count = 0;
 * this.model.forEachInPage( this.pageOffset, pageSize, function( record, index, id ) {
 *     if ( record ) {
 *         // render the row record
 *         count += 1;
 *     }
 *     if ( count === pageSize || !record ) {
 *         // done rendering this page of records
 *     }
 * } );
 *
 * // When settings change that affect the data such as changing the sort order or applying a filter
 * // the new sort order or filter information can be communicated to the server in the model fetchData or
 * // regionData option or it can be sent in a separate Ajax request.
 * this.model.clearData();
 *
 * // Clearing the data will result in a refresh notification. The modelNotificationFunction should
 * this.pageOffset = 0;
 * // call the above forEachInPage code to fetch and render the new data.
 *
 * // When the widget is destroyed it needs to release the model
 * this.model.unSubscribe( this.modelViewId );
 * this.model.release( modelName );
 */
/*
 * TODO
 * add these to above list once ready
 * <li>type: a string value that identifies the type of record for the purpose of making decisions such as if the
 *      record can be edited or deleted etc. The type is used to access additional metadata about the record based on
 *      its type. See the types model option.</li>
 * <li>sequence: a number value that determines the order of a record in the collection (lower numbers first).
 *      If the collection is a tree then it is the sequence among its siblings. Only required for editable models that
 *      support reordering.</li>
 */
/*
 * Future
 * - Consider local data for offline usage
 *
 * Depends:
 *    core.js
 *    debug.js
 *    util.js
 *    server.js
 */

apex.model = {};

(function( model, server, debug, $ ) {
    "use strict";

    var DEFAULT_MAX_MODELS = 10;

    var gModels = {}, // A place to keep track of all the models by name
        gModelsLRU = [], // least recently used list
        gNextViewId = 100,
        gMaxCachedModels = DEFAULT_MAX_MODELS;

    var extend = $.extend,
        isArray = $.isArray,
        isPlainObject = $.isPlainObject,
        isFunction = $.isFunction,
        makeDeferred = $.Deferred;

    function makeModelId( id ) {
        if ( typeof id === "string" ) {
            return [ id, null ];
        } if ( isArray (id) && id.length === 2 && typeof id[0] === "string" && ( id[1] === null || typeof id[1] === "string" )) {
            return id;
        }
        throw new Error("Invalid model id");
    }

    function pageOffset( offset, pageSize ) {
        return Math.floor( offset / pageSize ) * pageSize;
    }

    function copyItem( item ) {
        var i, a;
        if ( isArray( item ) ) {
            a = [];
            for ( i = 0; i < item.length; i++ ) {
                a.push( copyItem( item[i] ) );
            }
            return a;
        } else if ( isPlainObject( item ) ) {
            return extend( true, {}, item );
        } // else
        return item;
    }

    function copyRecord( record ) {
        var i, copy;
        if (isArray(record)) {
            copy = [];
            for ( i = 0; i < record.length; i ++) {
                copy[i] = copyItem( record[i] );
            }
        } else {
            copy = {};
            for ( i in record ) {
                if ( record.hasOwnProperty( i ) ) {
                    copy[i] = copyItem( record[i] );
                }
            }
        }
        return copy;
    }

    function notifyChange( model, changeType, change ) {
        var i,
            listeners = model._listeners;

        for ( i = 0; i < listeners.length; i++ ) {
            listeners[i].onChange( changeType, change );
        }
    }

    function callForEachCallback(thisArg, callback, record, index, id) {
        if ( thisArg ) {
            callback.call( thisArg, record, index, id );
        } else {
            callback( record, index, id );
        }
    }

    function makeIdentityIndex( recordIdentity ) {
        if ( typeof recordIdentity === "string" ) {
            return recordIdentity;
        } else if ( isArray( recordIdentity ) ) {
            if ( recordIdentity.length === 1 ) {
                return "" + recordIdentity[0];
            }
            return JSON.stringify(recordIdentity);
        }
        // really shouldn't get here
        return recordIdentity.toString();
    }

    function makeLoadingIndicatorFunction( model ) {
        var i, pv$,
            listeners = model._listeners,
            progressViews = [],
            progressOptions = [];

        for ( i = 0; i < listeners.length; i++ ) {
            pv$ = listeners[i].progressView;
            // if there is a progress view that is visible
            if ( pv$ && pv$[0].offsetWidth && pv$[0].offsetHeight ) {
                progressViews.push( pv$ );
                progressOptions.push( listeners[i].progressOptions || null );
            }
        }

        if ( progressViews.length === 0 ) {
            return null;
        } // else
        return function() {
            var i,
                spinner$,
                toRemove$ = $();

            for ( i = 0; i < progressViews.length; i++ ) {
                spinner$ = apex.util.showSpinner( progressViews[i], progressOptions[i] );
                toRemove$ = toRemove$.add( spinner$ );
            }
            return function() {
                toRemove$.remove();
            };
        };
    }

    function makeAjaxError( message, jqXHR, textStatus, errorThrown ) {
        var e, text;

        // todo think about what is useful for the error
        text = message;
        if ( errorThrown ) {
            text += " Server status: " + errorThrown;
        }
        e = new Error( text );
        if ( jqXHR.status >= 0 ) {
            e.status = jqXHR.status;
        }
        return e;
    }

    function clearRecordChanges( iNode, errorsOnly ) {
        var fieldName, fieldMeta;

        // clear out any field changes or errors
        delete iNode.error;
        delete iNode.warning;
        delete iNode.message;
        for ( fieldName in iNode.fields ) {
            if ( iNode.fields.hasOwnProperty( fieldName ) ) {
                fieldMeta = iNode.fields[fieldName];
                if ( !errorsOnly ) {
                    delete fieldMeta.changed;
                }
                delete fieldMeta.error;
                delete fieldMeta.warning;
                delete fieldMeta.message;
            }
        }
    }

    function getSequence( sequenceStep, beginSeq, endSeq, count, index ) {
        var range;
        if ( beginSeq === -1 ) {
            beginSeq = 0;
        }
        if ( endSeq === -1 ) {
            endSeq = beginSeq + ( sequenceStep * count );
        }
        range = endSeq - beginSeq;
        return beginSeq + ( range / ( count + 1 ) ) * index;
    }

    function invalidShapeError( method ) {
        return new Error( "Model has invalid shape for the " + method + " method" );
    }

    /**
     * @lends model.prototype
     */
    var modelPrototype = {

        /**
         * Return the model id for this model.
         *
         * @return {model.ModelId}
         */
        modelId: function() {
            if ( this.instance === null ) {
                return this.name;
            }
            return [this.name, this.instance];
        },

        /**
         * <p>Retrieve model data from the server. Data is requested starting at the given offset (or 0 if offset is
         * not given). Data is fetched in model option <code class="prettyprint">pageSize</code> chunks.
         * Can use either the callback argument or the returned promise to determine when the request is complete.</p>
         *
         * @param {integer=} pOffset Zero based offset of the data to fetch. Only applies to table shape
         *                           models. This is rarely needed because table data is automatically fetched as
         *                           needed when requested via the {@link model#forEachInPage} method.
         *                           Omit this param when not needed.
         * @param {function} [pCallback] A function to call when the request is complete. The callback is passed an
         *                           Error argument only if there is an error.
         * @param {boolean=} pNoProgress Set to true to not show progress during the fetch.
         * @return {promise} A promise if the fetch is initiated, null if there is already a fetch in progress,
         * and false if <code class="prettyprint">pOffset</code> is beyond the end of the data or master record is
         * inserted or deleted. If and only if a promise is returned, <code class="prettyprint">pCallback</code> will be called.
         * It receives no arguments when resolved and an <code class="prettyprint">Error</code> argument when rejected.
         * @fires model#event:addData
         */
        fetch: function( pOffset, pCallback, pNoProgress ) {
            var p, promiseRet, requestData, requestOptions, request, thisRegion, count, srvRecOffset, pageStart,
                self = this,
                o = this._options,
                deferred = makeDeferred();

            function findFreeOffset( offset ) {
                var i, a = self._data;

                if ( offset === 0 ) {
                    return 0;
                }
                for ( i = offset; i < a.length; i++ ) {
                    if ( a[i] === undefined ) {
                        break;
                    }
                }
                return i;
            }

            if ( typeof pOffset !== "number" ) {
                pNoProgress = pCallback;
                pCallback = pOffset;
                pOffset = 0;
            }

            if ( o.shape === "table" ) {
                pageStart = pageOffset( pOffset, o.pageSize );
                pOffset = findFreeOffset( pageStart ); // because of aggregate records may be greater than pageStart
                if ( ( this._haveAllData && pOffset >= this._data.length ) || this._masterRecordIsInserted || this._masterRecordIsDeleted ) {
                    return false;
                }

                srvRecOffset = this._getServerOffset( pOffset );

                // the offset may not be on a page boundary
                // round up count of records so that at least one page size is requested if it fits
                count = pageStart + o.pageSize - pOffset;
                if ( count < o.pageSize && this._data[pageStart + o.pageSize] === undefined ) {
                    count += o.pageSize;
                }
                request = {
                    version: o.version,
                    firstRow: srvRecOffset + 1,
                    maxRows: count
                };
            } else {
                request = {
                    version: o.version
                };
            }

            // Check if there is an outstanding request
            if ( this._requestsInProgress.fetch ) {
                return null;
            }

            thisRegion = extend( {}, o.regionData, {
                id: o.regionId,
                ajaxIdentifier: o.ajaxIdentifier,
                fetchData: extend( {}, o.fetchData, request )
            } );
            requestData = {
                regions: [ thisRegion ]
            };
            if ( o.pageItemsToSubmit ) {
                requestData.pageItems = o.pageItemsToSubmit;
            }
            this._addParentItems( requestData.regions[0] );

            requestOptions = {};
            if ( !pNoProgress ) {
                requestOptions.loadingIndicator = makeLoadingIndicatorFunction( this );
            }
            this._requestsInProgress.fetch = true;
            p = this._callServer( requestData, requestOptions );
            p.done( function( responseData ) {
                var regionData,
                    data = null,
                    total = null,
                    srvRecOffset = null,
                    moreData = null,
                    dataOverflow = null;

                delete self._requestsInProgress.fetch; // must be gone before processing the data
                if ( self._requestsInProgress.abortFetch ) {
                    delete self._requestsInProgress.abortFetch;
                    deferred.reject( makeAjaxError( "Error: Aborted when model cleared", {status:0}, "abort" ) ); // todo i18n???
                } else {
                    // only expect to get response data for this model/region so it is in first and only region
                    regionData = responseData.regions[0].fetchedData;
                    if ( o.shape === "table" ) {
                        data = regionData.values;
                        total = regionData.totalRows;
                        srvRecOffset = regionData.firstRow - 1;
                        moreData = regionData.moreData;
                        dataOverflow = regionData.dataOverflow;
                    } else if ( o.shape === "tree" ) {
                        data = regionData.root;
                    } else if ( o.shape === "record" ) {
                        data = regionData.value;
                    }
                    self._addData( pOffset, srvRecOffset, data, total, moreData, dataOverflow );
                    deferred.resolve();
                }
            } ).fail( function( jqXHR, textStatus, errorThrown ) {
                delete self._requestsInProgress.fetch;
                deferred.reject( makeAjaxError( "Error retrieving data.", jqXHR, textStatus, errorThrown ) ); // todo i18n???
            });

            promiseRet = deferred.promise();
            if ( pCallback ) {
                promiseRet.always( pCallback );
            }
            promiseRet.always( function( err ) {
                self._drainWaiters( err );
            } );
            return promiseRet;
        },

        /**
         * <p>Fetch all the data from the server into the model. This repeatedly calls {@link model#fetch} until the server reports
         * there is no more data. This is only for table shape models.
         * Data is fetched in model option <code class="prettyprint">pageSize</code> chunks.</p>
         * <p>Use with caution. Loading too much data onto the client can take a long time and cause the browser to
         * become unresponsive.</p>
         *
         * @param {function} pCallback function that is called after each fetch completes. It receives an object with properties:
         * <ul>
         *   <li>offset: the current offset in the model that was just added</li>
         *   <li>total: total records in the model (see {@link model#getTotalRecords})</li>
         *   <li>done: true if all the data is fetched false otherwise. When true this is the last time the callback is called.</li>
         * </ul>
         * @example <caption>This example fetches all the data before using {@link model#forEach} to loop over the records.</caption>
         * model.fetchAll( function( status ) {
         *     if ( status.done } {
         *         model.forEach( function( record, index, id ) {
         *             // do something with each record
         *         }
         *     }
         * } );
         */
        fetchAll: function( pCallback ) {
            var self = this,
                offset = 0,
                o = this._options,
                count = o.pageSize;

            if ( o.shape !== "table" ) {
                throw invalidShapeError( "fetchAll" );
            }

            // todo make more efficient by knowing where the holes are or at least the end of starting contiguous rows
            while ( this._data[offset] ) {
                offset += 1;
            }

            function load() {
                var r = self.fetch( offset, function( err ) {
                    if (err) {
                        pCallback({
                            error: err
                        });
                    } else {
                        pCallback({
                            offset: offset,
                            total: self.getTotalRecords(),
                            done: false
                        });
                        offset += count;
                        load();
                    }
                }, true );
                if ( r === null ) {
                    // request in progress wait and try again
                    setTimeout( function() {
                        load();
                    }, 500 );
                } else if ( r === false ) {
                    // done
                    pCallback({
                        offset: offset,
                        total: self.getTotalRecords(),
                        done: true
                    })
                }
            }
            load();
        },

        /**
         * <p>Fetches fresh data from the server for the given records. The existing records in the model are replaced
         * with the new returned record from the server. The model must have a <code class="prettyprint">identityField</code>
         * option defined for this to work.
         * Can use either the callback argument or the returned promise to determine when the request is complete.</p>
         *
         * @param {model.Record} pRecords Array of records to be fetched.
         * @param {function} [pCallback] A function to call when the request is complete. The callback is passed an
         *  Error argument only if there is an error.
         * @return {promise} A promise that receives no arguments when resolved and an Error argument when rejected.
         *  If there are no records to fetch then null is returned and <code class="prettyprint">pCallback</code> is not called.
         * @fires model#event:refreshRecords
         * @example <caption>This example fetches the selected records from interactive grid with static id "emp".
         * There is often no need know when the Ajax request completes because the view is updated from model
         * notifications.</caption>
         * var model = apex.region( "emp" ).call( "getCurrentView" );
         * model.fetchRecords( apex.region( "emp" ).call( "getSelectedRecords" );
         */
        fetchRecords: function( pRecords, pCallback ) {
            var i, p, id, iNode, promiseRet, requestData, requestOptions, thisRegion,
                self = this,
                o = this._options,
                keys = [],
                deferred = makeDeferred();

            if ( o.shape === "record" ) {
                throw invalidShapeError( "fetchRecords" );
            }
            if ( this._identityKeys === undefined ) {
                throw new Error( "Model must have identityField defined" );
            }

            for ( i = 0; i < pRecords.length; i++ ) {
                id = this._getIdentity( pRecords[i] );
                iNode = this.getRecordMetadata( id );
                if ( iNode && !iNode.inserted ) {
                    keys.push( { recordId: id, pk: this._getPrimaryKey( pRecords[i] ) } );
                }
            }

            if ( keys.length === 0 )  {
                return null;
            }

            thisRegion = extend( {}, o.regionData, {
                id: o.regionId,
                ajaxIdentifier: o.ajaxIdentifier,
                fetchData: extend( {}, o.fetchData, {
                    version: o.version,
                    primaryKeys: keys
                })
            } );
            requestData = {
                regions: [ thisRegion ]
            };
            if ( o.pageItemsToSubmit ) {
                requestData.pageItems = o.pageItemsToSubmit;
            }
            this._addParentItems( requestData.regions[0] );

            requestOptions = {
                loadingIndicator: makeLoadingIndicatorFunction( this )
            };
            p = this._callServer( requestData, requestOptions );
            p.done( function( responseData ) {
                var regionData, data;

                // only expect to get response data for this model/region so it is in first and only region
                regionData = responseData.regions[0].fetchedData;
                data = regionData.values;
                // the response should include a record for each one we asked for. If it doesn't exist (within the SQL where clause) it is marked not found
                // todo is this different for trees?
                self._updateData( data );
                deferred.resolve();
            } ).fail( function( jqXHR, textStatus, errorThrown ) {
                deferred.reject( makeAjaxError( "Error retrieving data.", jqXHR, textStatus, errorThrown ) ); // todo i18n???
            });

            promiseRet = deferred.promise();
            if ( pCallback ) {
                promiseRet.always( pCallback );
            }
            return promiseRet;
        },

        /**
         * <p>Save all changed model data to the server. The current changes are copied to the save request except
         * that volatile fields are not included (they are omitted/deleted i.e. not null or undefined) and the metadata
         * has the <code class="prettyprint">op</code> property added with value "d" if the record was deleted,
         * "i" if the record was inserted, and "u" if the record was updated.
         * If the record has no metadata field defined then one is added. For array
         * records it is the last element, for object records it is property <code class="prettyprint">_meta</code>.</p>
         *
         * <p>It is possible to continue making changes to the model while a save is in progress.
         * Can use either the callback argument or the returned promise to determine when the request is complete.</p>
         *
         * <p>See also {@link apex.model.save}.</p>
         *
         * @param {function} [pCallback] A function to call when the save request is complete.
         *                           callback( error, responseData );
         *                           The callback is passed an Error argument or array of server errors only
         *                           if there is an error. Otherwise error is null.
         * @return {promise} A promise if the save is initiated and null otherwise (there is already a save in progress or
         * there is nothing to save). If and only if a promise is returned, pCallback will be called. The promise receives no
         * arguments when resolved and an Error argument when rejected.
         */
        // todo improve doc of save error format and response data.
        save: function( pCallback ) {
            var p, cb, promiseRet,  requestData, requestOptions,
                deferred = makeDeferred();

            requestOptions = {
                loadingIndicator: makeLoadingIndicatorFunction( this )
            };

            requestData = {};
            cb = this.addChangesToSaveRequest( requestData );
            if ( !cb ) {
                return null;
            }
            p = this._callServer( requestData, requestOptions );
            cb( p );
            p.done( function( responseData ) {
                if ( responseData.errors ) {
                    deferred.reject( responseData.errors );
                } else {
                    deferred.resolve( null, responseData );
                }
            } ).fail( function( jqXHR, textStatus, errorThrown ) {
                deferred.reject( makeAjaxError( "Error saving data.", jqXHR, textStatus, errorThrown ) ); // todo i18n???
            });
            promiseRet = deferred.promise();
            if ( pCallback ) {
                promiseRet.always( pCallback );
            }
            return promiseRet;
        },

        /**
         * Determine if a save operation is in progress
         *
         * @ignore
         * @return {boolean} true if currently saving the model, false otherwise
         */
        // todo consider if this method is needed
        saveInProgress: function() {
            return !!this._requestsInProgress.save;
        },

        /**
         * Rarely needed. Only useful if making your own call to the server.
         * See {@link model#save}, {@link apex.model.addChangesToSaveRequest}, and {@link apex.model.save}.
         *
         * @param {object} pRequestData An empty or partially filled in object to which changes for this model will be added.
         */
        addChangesToSaveRequest: function( pRequestData ) {
            var i, field, key, pageItems, myPageItems, iNode, regions, region, models, modelSaveData,
                self = this,
                o = this._options,
                metaDestKey = this._metaKey, // only correct when record is an object see below where it is fixed
                toDelete = [],
                saveFields = [],
                saveFieldsMap = {}, // map fieldKey -> field name
                saveData = [],
                totalFields = 0;

            function changesNotSaved() {
                delete self._requestsInProgress.save;
                // if the save fails then all the pending changes didn't get saved so they are still changes again
                // todo but what if there are conflicts with changes done during the save?
                self._changes = self._pendingChanges.concat(self._changes);
            }

            function copyRecord( iNode ) {
                var i, copy, value, key, op, idIsGenerated, fieldName,
                    record = iNode.record;

                // if the node is inserted and there is no originalId it means that the user never edited any identity fields so the ids must be generated
                idIsGenerated = iNode.inserted && !iNode.originalId;

                if ( o.recordIsArray ) {
                    copy = [];
                } else {
                    copy = {};
                }
                for ( i = 0; i < saveFields.length; i++ ) {
                    key = saveFields[i];
                    value = record[key];
                    if ( value !== null && typeof value === "object" && value.hasOwnProperty("v") ) {
                        value = value.v;
                    }
                    // APEX has well established but somewhat non-standard behavior related to disabled fields
                    // A disabled field is not submitted, which in other frameworks typically means no change on the server,
                    // but because of the way APEX maps request parameters to PL/SQL procedure parameters something
                    // not submitted is null and that is the same as an empty string. So by disabling something on
                    // submit you have set it to null/empty string on the server. The model preserves this behavior.
                    fieldName = saveFieldsMap[key];
                    if ( iNode.fields && iNode.fields[fieldName] && iNode.fields[fieldName].disabled ) {
                        value = ""; // disabled values are empty
                    }
                    // never send a generated id to the server as part of the record
                    if ( idIsGenerated && self.isIdentityField(fieldName) && ( !iNode.original || value === iNode.original[key] ) ) {
                        value = "";
                    }
                    if ( o.recordIsArray ) {
                        copy.push( copyItem( value ) );
                    } else {
                        copy[key] = copyItem( value );
                    }
                }
                // todo the copy will just have the initial metadata; could be out of date?
                op = null;
                if ( iNode.deleted ) {
                    op = "d";
                } else if ( iNode.inserted ) {
                    op = "i";
                } else if ( iNode.updated ) {
                    op = "u";
                }
                if ( !copy[metaDestKey] ) {
                    copy[metaDestKey] = {};
                }
                if ( op ) {
                    copy[metaDestKey].op = op;
                }
                copy[metaDestKey].recordId = self._getIdentity( record );
                if ( iNode.originalId ) {
                    copy[metaDestKey].originalId = iNode.originalId;
                }
                if ( o.saveSelection ) {
                    copy[metaDestKey].sel = iNode.sel ? "Y" : "N";
                }

                saveData.push( copy );
            }

            // add page items to submit if we have any
            if ( o.pageItemsToSubmit ) {
                pageItems = pRequestData.pageItems;
                if ( !pageItems ) {
                    pageItems = [];
                    pRequestData.pageItems = pageItems;
                }
                // if pageItems is not an array it means that page items have already been processed and it
                // should be a full page request which means that all page items are included.
                if ( isArray( pageItems ) ) {
                    myPageItems = o.pageItemsToSubmit;
                    if ( !isArray( myPageItems ) ) {
                        // turn list of page item id selectors into an array for easy union
                        myPageItems = myPageItems.replace( /#/g, "" ).split( /\s*,\s*/ );
                    }
                    for ( i = 0; i < myPageItems.length; i++ ) {
                        if ( pageItems.indexOf( myPageItems[i] ) < 0 ) {
                            pageItems.push( myPageItems[i] );
                        }
                    }
                }
            }

            // if there are no changes or a save on this model is in progress then do nothing
            if ( this._requestsInProgress.save || ( this._changes.length === 0 && !o.saveSelection ) ) {
                return null;
            }

            // todo could do this just once
            for ( i in o.fields ) {
                if ( o.fields.hasOwnProperty( i ) ) {
                    field = o.fields[i];
                    if ( !field.virtual ) {
                        totalFields += 1;
                    }
                    if ( !field.volatile && !field.virtual ) {
                        key = o.recordIsArray ? field.index : i;
                        saveFields.push( key );
                        saveFieldsMap[key] = i;

                        if ( o.recordIsArray && field.index === this._metaKey ) {
                            metaDestKey = saveFields.length - 1;
                        }
                    }
                }
            }
            if ( o.recordIsArray ) {
                saveFields.sort( function(a,b) {
                    return a - b;
                } );
            }
            // if the records don't have a metadata field then add one.
            if ( !metaDestKey ) {
                if ( o.recordIsArray ) {
                    metaDestKey = saveFields.length;
                } else {
                    metaDestKey = "_meta";
                }
            }

            // see if there are any auto inserted records that shouldn't be saved.
            for ( i = 0; i < this._changes.length; i++ ) {
                iNode = this._changes[i];
                if ( iNode.autoInserted && !iNode.updated ) {
                    // skip records that were auto inserted and never updated.
                    // Note in theory this can result in nothing to save but using isChanged first will tell you if there is nothing to save
                    toDelete.push( iNode.record );
                }
            }
            if ( toDelete.length ) {
                this.deleteRecords( toDelete );
            }

            // copy all the changes
            for ( i = 0; i < this._changes.length; i++ ) {
                iNode = this._changes[i];
                copyRecord( iNode );
            }
            this._pendingChanges = this._changes;
            this._changes = [];

            if ( o.saveSelection ) {
                for ( i in this._selection ) {
                    if ( this._selection.hasOwnProperty( i ) ) {
                        iNode = this._selection[i];
                        // don't copy if it was already copied because it is changed
                        if ( !( iNode.inserted || iNode.deleted || iNode.updated ) ) {
                            copyRecord( iNode );
                        }
                    }
                }
            }

            // find region to add changes to
            regions = pRequestData.regions;
            if ( !regions ) {
                pRequestData.regions = regions = [];
            }
            for ( i = 0; i < regions.length; i++ ) {
                region = regions[i];
                if ( region.id === o.regionId ) {
                    break;
                }
                region = null;
            }
            // if no existing region found add one
            if ( !region ) {
                region = extend( {}, o.regionData, {
                    id: o.regionId,
                    ajaxIdentifier: o.ajaxIdentifier,
                    saveData: {
                        models: []
                    }
                } );
                regions.push( region );
            }
            models = region.saveData.models;
            modelSaveData = extend( {}, o.saveData, {
                instance: this.instance,
                version: o.version,
                values: saveData
            } );
            this._addParentItems( modelSaveData );
            models.push( modelSaveData );

            this._requestsInProgress.save = true;
            // return a function that will be called right away after the save request is started so
            // that callbacks can be added to the save request promise.
            return function( promise ) {
                promise.done( function( responseData ) {
                    var i, j, regionData, models, data, error,
                        metaKey; // intentionally undefined

                    if ( self._requestsInProgress.abortSave ) {
                        delete self._requestsInProgress.abortSave;
                        changesNotSaved();
                    } else if ( responseData.errors ) {
                        // go through all the errors
                        for ( i = 0; i < responseData.errors.length; i++ ) {
                            error = responseData.errors[i];
                            // if the region id matches and the error pertains to a record and has a matching instance then it is for this model
                            // xxx todo Model used to check if error.regionStaticId === o.regionId and it worked now it fails
                            if ( error.regionStaticId === o.regionStaticId && error.recordId && error.instance == self.instance ) { // using == on purpose because server omits nulls
                                self.setValidity( "error", error.recordId, error.columnName || null, error.message );
                            }
                        }
                        changesNotSaved();
                    } else if ( responseData.regions ) {
                        // find our region and instance
                        data = null;
                        for ( i = 0; i < responseData.regions.length; i++ ) {
                            regionData = responseData.regions[i];
                            if ( regionData.id === o.regionId ) {
                                models = regionData.fetchedData.models;
                                for ( j = 0; j < models.length; j++ ) {
                                    // The == test is intentional because when instance is null the server may not return a property at all
                                    if ( models[j].instance == self.instance ) {
                                        data = models[j].values;
                                        // if there is no metadata key defined there may still be record metadata because of inserts
                                        if ( !self._metaKey ) {
                                            if ( o.recordIsArray ) {
                                                metaKey = totalFields;
                                            } else {
                                                metaKey = "_meta";
                                            }
                                        }

                                        self._updateData( data, metaKey );
                                        break;
                                    }
                                }
                                break;
                            }
                            regionData = null;
                        }
                        self._clearChanges( "_pendingChanges" );
                    }
                    delete self._requestsInProgress.save;
                } ).fail( function( jqXHR, textStatus, errorThrown ) {
                    // todo some kind of notification about the error is needed?
                    changesNotSaved();
                });

            };
        },

        /**
         * <p>Give the model data. This is used in cases where the model doesn't get data from the server or at least
         * not using the built in mechanisms.</p>
         *
         * @param {array} pData Model data to set.
         * @param {integer} [pOffset] Offset at which to add the data.
         * @fires model#event:refresh
         * @fires model#event:addData
         */
        setData: function( pData, pOffset ) {
            pOffset = pOffset || 0;
            // offset 0 will result in _clear being called
            // note: by using pOffset for both the model offset and the server's recordOffset this assumes there are no aggregate records
            this._addData( pOffset, pOffset, pData, pData ? pData.length : null, false, false );
            notifyChange( this, "refresh", {} );
        },

        /**
         * <p>Remove all data from the model.</p>
         *
         * @fires model#event:refresh
         */
        clearData: function() {
            this._clear();
            notifyChange( this, "refresh", {} );
        },

        /**
         * <p>Returns the total number of records in the model collection or -1 if unknown.</p>
         *
         * <p>For table shape models the total number of records may not be known or it may be an estimate.
         * If the pagination type is "none" then the total records is known and it is the same as what is in the collection.
         * If the pagination type is "progressive" and the model has paged to the end (all pages
         * have been received and the server has said there is no more) then the total records is known and it
         * is the same as what is in the collection (which could be different from what is actually on the server).
         * If the server has told the model how many records it has then that is returned. This is an estimate of what
         * the client model may eventually hold. This value may change as new pages are fetched.
         * If the server has not told the model how many records it has then the total is unknown.
         * </p>
         * <p>For tree shape models the total number of records is not often needed.
         * It is also not readily available so the nodes must be counted. The total doesn't include nodes that
         * have not yet been fetched and never returns -1 (unknown) even if there are nodes that haven't been fetched.
         * </p>
         * <p>For record shape the number is always 1.</p>
         *
         * <p>Note: Includes records that are marked for delete in the count.
         * Also includes aggregate records if any in the count.</p>
         *
         * @return {integer} The number of records or -1 if unknown.
         */
        getTotalRecords: function() {
            var i, count,
                o = this._options;

            if ( o.shape === "table" ) {
                if ( this._haveAllData || o.paginationType === "none" ) {
                    return this._data.length;
                } // else
                if ( this._totalRecords < 0 ) {
                    return this._totalRecords; // unknown
                } // else
                return Math.max( this._data.length, this._totalRecords ); // estimate based on what the server has reported
            } else if ( o.shape === "record" ) {
                return 1;
            } else if ( o.shape === "tree" ) {
                count = 0;
                for ( i in this._index ) {
                    if ( this._index.hasOwnProperty( i )) {
                        count += 1;
                    }
                }
                return count;
            }
        },

        /**
         * <p>Returns the total number of records from the server's perspective or -1 if unknown.</p>
         *
         * <p>For table shape models the server provides the total but for editable grids the number of inserted records
         * is added and the number of deleted records subtracted. This is so the number reflects what is likely
         * to be on the server after changes are saved.</p>
         *
         * <p>For tree shape models this is not supported; returns -1.</p>
         *
         * <p>For record shape models the number is always 1.</p>
         *
         * <p>Note: Aggregate records are never included.</p>
         *
         * @return {number} The number of records or -1 if unknown.
         */
        getServerTotalRecords: function() {
            var o = this._options;

            if ( o.shape === "table" ) {
                if ( this._totalRecords < 0 ) {
                    return this._totalRecords; // unknown
                }
                return this._totalRecords + this._numInsertedRecords - this._numDeletedRecords;
            } else if ( o.shape === "record" ) {
                return 1;
            } else if ( o.shape === "tree" ) {
                // todo consider if the server could specify the total like it does for tables
                return -1;
            }
        },

        /**
         * <p>Return true if the number of records in the data set on the server exceeds some configured maximum.</p>
         *
         * @ignore
         * @return {boolean}
         */
        getDataOverflow: function() {
            return !!this.dataOverflow;
        },

        /**
         * This callback is used by the {@link model#forEach} and {@link model#forEachInPage} methods.
         *
         * @callback model.IteratorCallback
         * @param {model.record} pRecord The current record.
         * @param {number} pIndex The zero based index within the model collection of the current record.
         * @param {string} pId The identity of the current record if the model
         *   <code class="prettyprint">identityField</code> option is given. If there is no identity then this is
         *   undefined for tree models and is the <code class="prettyprint">pIndex</code> as a string for table models.
         */

        /**
         * <p>Iterate over the model collection. Calls <code class="prettyprint">pCallback</code> for each record in the model.
         * Similar to <code class="prettyprint">Array.prototype.forEach</code>. The model shape must be table or tree.
         * This will never fetch new data. This includes aggregate records if any.
         * For shape tree see also {@link model#walkTree}.</p>
         *
         * <p>The callback receives the record, the zero based index of the record, and the identity (recordId)
         * of the record.</p>
         *
         * @param {model.IteratorCallback} pCallback Function called for each record in the model collection.
         *     The function is given the current record, index, and id.
         * @param {*} [pThisArg] Value to use as <code class="prettyprint">this</code>
         *     when calling <code class="prettyprint">pCallback</code>.
         * @example <caption>This example calculates the total of field SALARY for all the records that are
         * currently in the model. Deleted and aggregate records are skipped.</caption>
         * var total = 0;
         * model.forEach( function( record, index, id ) {
         *     var salary = parseFloat( model.getValue( record, "SALARY" ) ),
         *         meta = model.getRecordMetadata( id );
         *
         *     if ( !isNaN( salary ) && !meta.deleted && !meta.agg ) {
         *         total += salary;
         *     }
         * } );
         * // do something with total
         */
        forEach: function( pCallback, pThisArg ) {
            var i, rec, len,
                self = this,
                o = this._options,
                a = this._data;

            if ( o.shape === "record" ) {
                throw invalidShapeError( "forEach" );
            } else if ( o.shape === "tree") {
                i = 0;
                if ( a ) {
                    this.walkTree(a, {
                        node: function( node ) {
                            callForEachCallback( pThisArg, pCallback, node, i, self._getIdentity( node ) );
                            i += 1;
                        }
                    });
                }
            } else {
                len = a.length;
                // todo THINK in the virtual paging case this is very inefficient
                for ( i = 0; i < len; i++ ) {
                    rec = a[i];
                    if (rec) {
                        callForEachCallback( pThisArg, pCallback, rec, i, this._getIdentity( rec, i ) );
                    }
                }
            }
        },

        /**
         * <p>Transform a copy of the table shape model data into another data structure according to the provided template rules.
         * The transformed output data structure is returned.</p>
         *
         * @param {Object} pOptions An object with properties that define how the model data is to be transformed.
         *     All properties are optional except for template.
         * @param {Object[]} pOptions.template An array of rule objects each one describing where and how to create an array
         *                           in the output data. Each rule object can have these properties:
         * @param {string} pOptions.template.path A "/" separated list of property names or indexed fields. The path specifies
         *      where in the output object structure to create an (or use existing) array to
         *      add items to. For example a path of "a/b" will result in output:
         *  <pre class="prettyprint"><code>
         *  {
         *      a: {
         *          b: [&lt;items go here>]
         *      }
         *  }
         *  </code></pre>
         *      <p>An indexed field is the name of a record field wrapped in square brackets.
         *      This creates an array for each unique value of the field. For example a path
         *      of "a/[ENABLED]/b" where the field ENABLED can have values of "yes" and "no" results in output:</p>
         *  <pre class="prettyprint"><code>
         *  {
         *      a: [
         *          {
         *              b: [&lt;items for records with enabled = yes go here>]
         *          },
         *          {
         *              b: [&lt;items for records with enabled = no go here>]
         *          }
         *      ]
         *  }
         *  </code></pre>
         * @param {function} pOptions.template.filter Filter function( model, record, index, id) return true to
         *     include and return false to skip the given record.
         * @param {string} pOptions.template.uniqueIndexField The name of a record field. If given an item will be added
         *     to the array only for the first record with a unique value of this field.
         * @param {Object|Array|string|function} pOptions.template.item An object, string, array or function that
         *     serves as a template for the elements/items of the output array the resulting value depends on the type:
         *     <ul>
         *         <li>string: A string is the name of a record field and the resulting value is the value of that field or
         *           if it begins and ends with a single quote then the value is the text inside the single quotes or
         *           if it begins with ( and ends with ) the string inside the parens is the
         *           name of a record field and the resulting value is the raw value of that field not the display value
         *           or <code class="prettyprint">showNullAs</code> value.</li>
         *         <li>function: The resulting value is the return value of the function
         *           f(pContext, self, record, index, id)</li>
         *         <li>object: the resulting value is a new object where the properties of the new object
         *           are the same as the properties of this template object and the value of
         *           the properties support the same options as item.</li>
         *         <li>array: The resulting value is a new array where the value items in the new array
         *           come from the template items in this array. The template items support the same
         *           options as item.</li>
         *     </ul>
         * @param {string} pOptions.template.sort A function suitable as the argument to
         *     <code class="prettyprint">Array.prototype.sort</code> that will sort the output array after all
         *     records are processed.
         * @param {function} pOptions.filter Filter function( model, record, index, id) return true to include and
         *     return false to skip the given record.
         * @param {string} pOptions.showNullAs A string to substitute for null field values.
         * @param {boolean} pOptions.includeAggregates If true aggregate records are included otherwise they are
         *     skipped this is done before the <code class="prettyprint">filter</code> function is called.
         * @param {number} pOptions.offset Offset index of first record to process defaults to 0.
         * @param {number} pOptions.count Count of records starting at <code class="prettyprint">offset</code>
         *    to process. Defaults to all the data currently in the model.
         * @param {Object} [pContext] This is the output object to return with data arrays filled in based on the
         *    template rules. If pContext is not given an empty object is used as a starting point. All functions
         *    are called in the context of this object. Note: if the template rule(s) don't
         *    have a path then pContext can be an array.
         * @return {Object} The output data structure. Same object as <code class="prettyprint">pContext</code> if it was given.
         *
         * @example <caption>The following example generates groups and series data for a jet Bar chart from a model
         * created from:<br>
         *     select job, deptno, avg(sal) as avg_sal from emp group by job, deptno</caption>
         *
         * var data = mymodel.transform( {
         *              template: [ {
         *                      path: "groups",
         *                      uniqueIndexField: "DEPTNO",
         *                      item: { name: "DEPTNO" }
         *                  }, {
         *                      path: "series",
         *                      uniqueIndexField: "JOB",
         *                      item: { name: "JOB" }
         *                  }, {
         *                      path: "series/[JOB]/items",
         *                      item: { label: "'AVG_SAL'",
         *                              value: "AVG_SAL",
         *                              name: "DEPTNO"
         *                          }
         *                  } ]
         *              });
         */
        /*
         * TODO doc fetchData option when ready
         * @param {number} pOptions.count Count of records starting at offset to process. If fetchData is false defaults
         *                          to all the data currently in the model. If fetchData is true defaults to the models
         *                          pageSize option. If fetchData is true and count is -1 then all the data will be fetched
         *                          in pageSize chunks. todo this is async
         * @param {boolean} pOptions.fetchData: If true allow more data to be fetched as needed by using forEachInPage otherwise
         *                          forEach is used to loop over the records that are currently in the model.
         * @param {function} pOptions.done: function( data ) todo to support async
         */
        transform: function( pOptions, pContext ) {
            var i, t, a, offset, count,
                indexedPathStepRE = /^\[\W*([^ \t\/]+)\W*\]$/,
                template = pOptions.template,
                showNullAs = pOptions.showNullAs,
                tLen = template.length,
                arrays = [], // info about output arrays; there is one of these for each element of template
                indexes = {}, // indexName -> { array: [], values: {} -> index }
                self = this;

            function getIndex( indexes, name ) {
                var index;
                index = indexes[name];
                if ( !index ) {
                    index = { values: {}, paths: [] };
                    indexes[name] = index;
                }
                return index;
            }

            function processPath( pathSrc, templateIndex, indexName, objContext, arrays, indexes ) {
                var i, m, p, array, path, obj, index, lastObj, lastProp;

                if ( pathSrc ) {
                    path = pathSrc.split("/");
                    obj = objContext;
                    lastObj = null;
                    lastProp = null;
                    p = null;
                    for ( i = 0; i < path.length; i++ ) {
                        p = path[i];
                        m = indexedPathStepRE.exec( p );
                        if ( m ) {
                            index = getIndex( indexes, m[1] );
                            index.paths[templateIndex] = path.slice( i + 1 ).join( "/" );
                            break;
                        } else {
                            lastObj = obj;
                            lastProp = p;
                            if ( !obj.hasOwnProperty(p) ) {
                                obj[p] = {}; // assume for now it is an object
                            }
                            obj = obj[p];
                        }
                    }
                    if ( lastObj ) {
                        if ( isArray( lastObj[lastProp] ) ) {
                            array = lastObj[lastProp];
                            array.length = 0; // any array that will be populated as part of the transform must first be truncated
                        } else {
                            array = [];
                        }
                        lastObj[lastProp] = array;
                    } else {
                        array = objContext;
                    }
                    arrays[ templateIndex ] = array;
                } else {
                    // objContext must be an array
                    if ( isArray( objContext ) ) {
                        arrays[ templateIndex ] = objContext;
                    } else {
                        throw new Error("Context must be an array when there is no path");
                    }
                }
                if ( indexName ) {
                    index = getIndex( indexes, indexName );
                }
            }

            // implicit input: pContext, template; implicit output arrays, indexes
            function buildArrays( ) {
                var i, t;

                for( i = 0; i < template.length; i++ ) {
                    t = template[i];
                    processPath( t.path, i, t.uniqueIndexField, pContext, arrays, indexes );
                }
            }

            function getObject( srcObj, dstObj, record, index, id ) {
                var propName, prop, value;

                for ( propName in srcObj ) {
                    if ( srcObj.hasOwnProperty( propName ) ) {
                        prop = srcObj[propName];
                        value = getValue( prop, record, index, id );
                        if ( value !== undefined ) {
                            dstObj[propName] = value;
                        }

                    }
                }
                return dstObj;
            }

            function getArray( srcArr, dstArr, record, index, id ) {
                var i, prop, value;

                for ( i = 0; i < srcArr.length; i++ ) {
                    prop = srcArr[i];
                    value = getValue( prop, record, index, id );
                    if ( value !== undefined ) {
                        dstArr[i] = value;
                    }
                }
                return dstArr;
            }

            function getValue( prop, record, index, id ) {
                var len, value, firstCh, lastCh,
                    raw = false;

                // todo consider prop syntax that allows access to properties of an object value. Work around is to use a function
                if ( typeof prop === "string" ) {
                    len = prop.length;
                    firstCh = prop.charAt( 0 );
                    lastCh = prop.charAt( len - 1 );

                    if ( firstCh === "'" && lastCh === "'" ) { // is it a constant?
                        return prop.substring( 1, len - 1 );
                    } else if ( firstCh === "(" && lastCh === ")" ) { // is it a raw property value
                        prop = prop.substring( 1, len - 1 );
                        raw = true;
                    } // else it comes from a data model named record field
                    value = self.getValue( record, prop );
                    // handle special case where field has a display value. Assume it is the display value of interest.
                    if ( value !== null && typeof value === "object" && value.hasOwnProperty( "d" ) ) {
                        if ( raw ) {
                            value = value.v;
                        } else {
                            value = value.d;
                        }
                    }
                    if ( !raw && showNullAs && ( value === null || value === "" ) ) {
                        value = showNullAs;
                    }
                    return value;
                } else if ( isFunction( prop ) ) {
                    return prop.call( pContext, self, record, index, id );
                } else if ( prop === null ) {
                    return prop;
                } else if ( isArray( prop ) ) {
                    return getArray( prop, [], record, index, id );
                } else if ( typeof prop === "object" ) {
                    return getObject( prop, {}, record, index, id );
                }
                // return undefined
            }

            function getKeys( path, record, index, id ) {
                var i, p, m,
                    keys = [];

                if ( path ) {
                    path = path.split("/");
                    for ( i = 0; i < path.length; i++ ) {
                        p = path[i];
                        m = indexedPathStepRE.exec( p );
                        if ( m ) {
                            keys.push( {
                                key: m[1],
                                value: getValue( m[1], record, index, id )
                            } );
                        }
                    }
                }
                return keys;
            }

            function processRecord( record, index, id ) {
                var i, k, t, array, value, outputIndex, outputIndexValue, keys, indexedValue, obj, curIndexes;

                // skip records that are not in the range of interest given by offset and count
                if ( index < offset || ( count > 0 && index >= offset + count ) ) {
                    return;
                }

                // skip aggregate records unless option includeAggregates is true
                if ( !pOptions.includeAggregates && self._metaKey && record[self._metaKey].agg ) {
                    return;
                }

                // skip records that don't pass the global filter if there is one
                if ( pOptions.filter && !pOptions.filter.call( pContext, self, record, index, id ) ) {
                    return;
                }

                for( i = 0; i < tLen; i++ ) {
                    outputIndex = null;
                    t = template[i];
                    array = arrays[i];
                    // skip templates that don't pass the template specific filter
                    if ( !t.filter || t.filter.call( pContext, self, record, index, id ) ) {
                        if ( t.uniqueIndexField ) {
                            outputIndex = indexes[t.uniqueIndexField];
                            outputIndexValue = getValue( t.uniqueIndexField, record, index, id );
                            if ( outputIndex.values[outputIndexValue] !== undefined ) {
                                // there has already been an element added for this value so skip this record
                                continue;
                            }
                        }
                        value = getValue( t.item, record, index, id );
                        if ( value !== undefined ) {
                            if ( outputIndex ) {
                                // remember the index where this value is stored
                                outputIndex.values[outputIndexValue] = { index: array.length, arrays: [], indexes: {} };
                            } else {
                                // see if there are any indexed properties in the path
                                keys = getKeys( t.path, record, index, id );
                                curIndexes = indexes;
                                for ( k = 0; k < keys.length; k++ ) {
                                    outputIndex = getIndex(curIndexes, keys[k].key);
                                    indexedValue = outputIndex.values[keys[k].value];
                                    if ( indexedValue === undefined ) {
                                        indexedValue = {
                                            index: array.length,
                                            arrays: [],
                                            indexes: {}
                                        };
                                        // add new object (or array) to array
                                        obj = outputIndex.paths[i] === "" ? [] : {};
                                        array.push( obj );
                                        outputIndex.values[keys[k].value] = indexedValue;
                                    }
                                    obj = array[indexedValue.index];
                                    if ( !indexedValue.arrays[i] ) {
                                        processPath( outputIndex.paths[i], i, null, obj, indexedValue.arrays, indexedValue.indexes );
                                    }
                                    array = indexedValue.arrays[i];
                                    curIndexes = indexedValue.indexes;
                                }

                            }
                            array.push( value );
                        }
                    }
                }
                // todo call to get more from server if needed. Consider using fetchAll first
            }

            if ( pContext === null || typeof pContext !== "object" ) {
                pContext = {};
            }

            buildArrays();

            offset = 0;
            if ( pOptions.offset >= 0 ) {
                offset = pOptions.offset;
            }
            count = pOptions.fetchData ? this._options.pageSize : null;
            if ( pOptions.count > 0 ) {
                count = pOptions.count;
            }
            if ( pOptions.fetchData ) {
                this.forEachInPage( offset, count, processRecord );
            } else {
                this.forEach( processRecord );
            }

            for( i = 0; i < tLen; i++ ) {
                t = template[i];
                a = arrays[i];
                if ( t.sort ) {
                    a.array.sort( t.sort );
                }
            }

            return pContext;
        },

        /**
         * <p>Iterate over a range (page) of the model collection. This is only valid for table shape models.
         * Calls <code class="prettyprint">pCallback</code> for <code class="prettyprint">pCount</code>
         * records in the collection starting at <code class="prettyprint">pOffset</code>.
         * If the model doesn't yet contain the requested records they will be fetched from the server
         * by calling {@link model#fetch}. If the collection has fewer records than requested or if there is an error
         * fetching data from the server then <code class="prettyprint">pCallback</code> is called with a null record.</p>
         *
         * <p>The callback receives the record, the zero based index of the record, and the identity (recordId)
         * of the record.</p>
         *
         * @param {integer} pOffset Zero based index to begin iterating.
         * @param {integer} pCount The number of records to call <code class="prettyprint">pCallback</code> for.
         * @param {model.IteratorCallback} pCallback Function called for each record in the model collection.
         *     The function is given the current record, index, and id.
         * @param {*} [pThisArg] Value to use as <code class="prettyprint">this</code> when calling
         *     <code class="prettyprint">pCallback</code>.
         * @example <caption>This example renders a <code class="prettyprint">pageSize</code> page of records
         *   starting at offset <code class="prettyprint">currentPageOffset</code>.</caption>
         * var count = 0,
         *     pageOffset = currentPageOffset;
         * model.forEachInPage( pageOffset, pageSize, function( record, index, id ) {
         *     if ( record ) {
         *         // render the record
         *         count += 1;
         *     }
         *     if ( count === pageSize || !record ) {
         *         // done rendering this page of records
         *     }
         * } );
         */
        forEachInPage: function( pOffset, pCount, pCallback, pThisArg ) {
            var i, end, rec, index,
                dataOffset = pOffset, // pOffset is in logical collection, dataOffset is in model collection (_data)
                self = this,
                o = this._options,
                a = this._data;

            function getMore( offset ) {
                var next, p,
                    count = pCount - ( offset - pOffset );

                debug.trace( "Model: " + self.modelId() + ". forEachInPage fetching more data starting at: ", offset );
                self._waitingPages.push( {
                    offset: offset,
                    callback: pCallback,
                    thisArg: pThisArg,
                    next: function() {
                        self.forEachInPage( offset, count, pCallback, pThisArg );
                    }
                } );
                if ( !self._requestsInProgress.fetch ) {
                    p = self.fetch( offset, function( err ) {
                        if ( !err ) {
                            setTimeout(function() {
                                // do this after the requests in progress flag is cleared
                                if ( self._waitingPages.length > 0 ) {
                                    next = self._waitingPages.shift();
                                    next.next();
                                }
                            }, 1);
                        }
                    } );
                    if ( !p ) {
                        self._waitingPages.pop();
                        // there is no more data to get. null record means no more
                        callForEachCallback( pThisArg, pCallback, null, -1, null );
                    }
                }
            }

            if ( o.shape !== "table") {
                throw invalidShapeError( "forEachInPage" );
            }

            // if caller asks for more than a page size of records at once then we need a bigger page size
            if ( pCount > o.pageSize ) {
                // but round up to the next multiple of 10
                o.pageSize = Math.floor( ( pCount + 9 ) / 10 ) * 10;
            }

            if ( o.paginationType === "one" ) {
                // in this case the model always only holds one page of data
                // so the offset must be adjusted
                dataOffset = pOffset - this._offset;
            }
            // typically can run off the end of the data but in the case where only hold one page can
            // also ask for data before the page that the model holds
            if ( dataOffset < 0 || dataOffset >= a.length ) {
                if ( this._haveAllData ) {
                    // there is no more data to get. null record means no more
                    callForEachCallback( pThisArg, pCallback, null, -1, null );
                    this._drainWaiters();
                } else {
                    // need to fetch more data then start again
                    getMore( pOffset );
                }
                return;
            }

            end = dataOffset + pCount;
            index = pOffset; // the record index reported to the caller is always in terms if the logical collection
            for ( i = dataOffset; i < end; i++ ) {
                rec = a[i];
                if ( rec === undefined ) {
                    if ( this._haveAllData && i >= a.length ) {
                        // there is no more data to get. null record means no more
                        callForEachCallback( pThisArg, pCallback, null, -1, null );
                        this._drainWaiters();
                    } else {
                        // fetch more data and continue where left off; adjust for page boundary
                        getMore( i + this._offset );
                    }
                    return;
                }
                if ( rec ) {
                    callForEachCallback( pThisArg, pCallback, rec, index, this._getIdentity( rec, i ) );
                    index += 1;
                }
            }
            this._drainWaiters();
        },

        /**
         * <p>Return the index of the record within the collection. The collection may include aggregate records.
         * Useful because {@link model#forEachInPage} method takes a starting index/offset.</p>
         *
         * <p>Only applies to table and tree shape models. Throws an error if the model shape is record.
         * For tree shape models returns the index of the node among its siblings.</p>
         *
         * @param {model.Record} pRecord The record to return the index of.
         * @return {integer} The record index or -1 if not in collection.
         */
        indexOf: function( pRecord ) {
            var iNode,
                o = this._options;

            if ( o.shape === "record" ) {
                throw invalidShapeError( "indexOf" );
            }
            if ( o.shape === "tree" ) {
                iNode = this.getRecordMetadata( this._getIdentity( pRecord ) );
                if ( iNode && iNode.parent ) {
                    return iNode.parent[this._childrenKey].indexOf( pRecord );
                } // else
                return -1;
            } // else
            return this._data.indexOf( pRecord );
        },

        /**
         * <p>Return the record at the given index within the model collection. Only applies to table shape models.</p>
         *
         * @param {integer} index The index of the record to return.
         * @return {model.Record} The record or null if there is no record at the given index.
         * @example <caption>This example returns the fifth record in the collection assuming it exists.</caption>
         * var record = model.recordAt(5);
         */
        recordAt: function( index ) {
            if ( this._options.shape !== "table" ) {
                throw invalidShapeError( "recordAt" );
            }
            return this._data[index] || null;
        },

        /**
         * <p>Given a record return the unique identifier (id) for the record. The id is used in calls to
         * {@link model#getRecordMetadata} and {@link model#getRecord}. If the model has multiple
         * identity fields this returns a string representation of the combined fields.</p>
         *
         * @param {model.Record} pRecord The record to get the id from.
         * @return {string} The record id or null if no identityField is defined.
         * @example <caption>This example gets the identity of record <code class="prettyprint">someRecord</code>
         *     and uses it to get the record metadata.</caption>
         * var id = model.getRecordId( someRecord ),
         *     meta = model.getRecordMetadata( id );
         * // use meta for something
         */
        getRecordId: function( pRecord ) {
            return this._getIdentity( pRecord );
        },

        /**
         * Return true if the given field name is an identity field and false otherwise.
         *
         * @param {string} pFieldName Name of record field.
         * @return {boolean}
         */
        isIdentityField: function( pFieldName ) {
            if ( this._identityKeys !== undefined ) {
                return this._identityKeys.indexOf( this.getFieldKey( pFieldName ) ) >= 0;
            }
            return false;
        },

        /**
         * @typedef model.RecordMetadata
         * @desc
         * Metadata properties that the model creates and uses.
         *
         * @property {boolean} deleted true if the record has been deleted otherwise false or undefined.
         * @property {boolean} inserted true if the record is newly created and inserted/added to the collection otherwise false or undefined.
         * @property {boolean} autoInserted true if the record was auto inserted (these records are not saved if not also updated)
         * @property {boolean} updated true if the record has had any fields changed.
         * @property {model.Record} original When updated is true this is the original record before any changes.
         * @property {model.Record} record Reference to the record that this metadata is about.
         * @property {model.Record} parent The parent record of this record. Only applies to tree shape models.
         * @property {boolean} error true if the record as a whole has an error.
         * @property {boolean} warning true if the record as a whole has a warning.
         * @property {string} message Only present when <code class="prettyprint">error</code>
         *     or <code class="prettyprint">warning</code> are true. Describes the error or warning condition.
         * @property {boolean} sel true if the record is selected and false otherwise.
         * @property {string} highlight A string that view layers can use to provide extra styling for the record.
         * @property {object} allowedOperations
         * @property {boolean} allowedOperations.delete true if the record can be deleted.
         * @property {boolean} allowedOperations.update true if the record can be updated.
         * @property {boolean} canEdit Derived from <code class="prettyprint">allowedOperations.update</code>
         * @property {boolean} canDelete Derived from <code class="prettyprint">allowedOperations.delete</code>
         * @property {boolean} endControlBreak Used by views to implement control break UI.
         * @property {*} agg For aggregate records this is truthy.
         * @property {Object.<string, model.RecordFieldMetadata>} fields An object that maps from a field name to
         *     metadata about the field.
         */
        /*
         * TODO document more metadata
         * @property {string} recordId internal use, only applies briefly after saving an inserted record this is the previous id by which the record was known
         * @property {boolean} canDrag xxx
         * @property {string} protected xxx
         * @property {*} rowVersion opaque to model
         * @property {*} salt opaque to model
         * @property {*} grandTotal xxx
         */

        /**
         * @typedef model.RecordFieldMetadata
         * @desc
         * Metadata related to a specific record field.
         *
         * @property {boolean} error true if the field has an error.
         * @property {boolean} warning true if the field has a warning.
         * @property {string} message Only present when <code class="prettyprint">error</code>
         *     or <code class="prettyprint">warning</code> are true. Describes the error or warning condition.
         * @property {boolean} disabled true if the field is disabled. Disabled fields are written to the server as empty string.
         * @property {string} highlight A string that view layers can use to provide extra styling for the field.
         * @property {string} ck A checksum. If present and not null indicates the record field is readonly.
         * @property {string} url Use for cells that are links. This is the link target. The cell value is the link label.
         */

        /**
         * <p>Return the metadata object for the record given by the record id. This only applies to models that
         * define an identity field with option <code class="prettyprint">identityField</code>.</p>
         *
         * <p>Upper layers can store information related to the record here. The metadata should be related to the
         * record itself and not the view of it.</p>
         *
         * @param {string|string[]} pRecordId Value of the record's identity field or array of values of the record's
         *     identity fields or value returned by {@link model#getRecordId}.
         * @return {model.RecordMetadata} Metadata object or null if there is no record associated with
         *     <code class="prettyprint">pRecordId</code>.
         * @example <caption>This example checks if the record <code class="prettyprint">someRecord</code>
         *     is updated.</caption>
         * var id = model.getRecordId( someRecord ),
         *     meta = model.getRecordMetadata( id );
         * if ( meta.updated ) {
         *     // do something related to the updated record
         * }
         */
        getRecordMetadata: function( pRecordId ) {
            var iNode = this._index[makeIdentityIndex( pRecordId )];
            // todo THINK there was supposed to be something to distinguish metadata that had to go back to the server
            return iNode || null;
        },

        /**
         * <p>Call this method if any properties of the metadata returned by {@link model#getRecordMetadata} are changed
         * external to this module. Most record or field metadata should not be changed externally. However it may
         * be useful and reasonable to externally change metadata that comes from the records initially such as canEdit
         * or custom metadata properties.
         * The result of calling this method is sending a {@link model#event:metaChange} notification.</p>
         *
         * @param {string} pRecordId Value of the record's identity field or array of values of the record's
         *     identity fields or value returned by {@link model#getRecordId}.
         * @param {string} [pFieldName] Name of record field that has a metadata change if any.
         * @fires model#event:metaChange
         */
        metadataChanged: function( pRecordId, pFieldName ) {
            var iNode = this._index[makeIdentityIndex( pRecordId )];

            if ( iNode ) {
                notifyChange( this, "metaChange", {
                    record: iNode.record,
                    recordId: pRecordId,
                    field: pFieldName || null
                } );
            }
        },

        /**
         * Return metadata for given type name.
         * See comments before {@link apex.model.create} for more information on the properties associated with a type.
         *
         * @ignore
         * @param {string} pTypeName The type name.
         * @return {object} metadata object or null if there is no such type
         */
        getTypeMetadata: function( pTypeName ) {
            return this._options.types[pTypeName] || null;
        },

        /**
         * <p>Return metadata object for given field name. The field metadata is supplied when the model is created
         * in option property <code class="prettyprint">fields</code>.</p>
         *
         * @param {string} pFieldName The field name.
         * @return {model.FieldMeta} Metadata object or null if there is no such field.
         */
        getFieldMetadata: function( pFieldName ) {
            return this._options.fields[pFieldName] || null;
        },

        /**
         * <p>Return the index/key to use for the given field name when accessing that field of a record.
         * Use the value returned from this method to access a record field without using {@link model#getValue}.
         * This will work regardless of if the records are stored as objects or arrays.</p>
         *
         * @param {string} pFieldName The field name.
         * @return {(string|number|undefined)} returns undefined if the field doesn't exist or is virtual
         * @example <caption>This example gets the field key for the model field named "COST" and uses it
         * in a loop over array of records <code class="prettyprint">selectedRecords</code>.</caption>
         * var i, cost,
         *     costKey = model.getFieldKey("COST");
         * for ( i = 0; i < selectedRecords.length; i++ ) {
         *     cost = selectedRecords[i][costKey];
         *     // do something with cost
         * }
         *
         */
        getFieldKey: function( pFieldName ) {
            var o = this._options;
            if ( !o.fields.hasOwnProperty( pFieldName ) || o.fields[pFieldName].virtual ) {
                return undefined;
            }
            if ( o.recordIsArray ) {
                return o.fields[pFieldName].index;
            }
            return pFieldName;
        },

        /**
         * <p>Determine if the model has been changed in any way. See also {@link model#getChanges}.</p>
         *
         * <p>Note: Auto inserted records don't count as changes unless they are also updated but
         * they are returned by {@link model#getChanges}.</p>
         *
         * @return {boolean} true if the model has changed and false otherwise.
         * @example <caption>This example logs a console message if the model has changed.</caption>
         * if ( model.isChanged() ) {
         *     console.log("Model has changes.");
         * }
         */
        isChanged: function() {
            var i, iNode, count;

            if ( this._changes.length === 0 ) {
                return false;
            } // else
            count = 0;
            for ( i = 0; i < this._changes.length; i++ ) {
                iNode = this._changes[i];
                if ( !(iNode.autoInserted && !iNode.updated) ) {
                    count += 1;
                }
            }
            return count > 0;
        },

        /**
         * <p>Return an array of record metadata for all changed records.
         * Do not make any changes to the data structure returned. See also {@link model#isChanged}.</p>
         *
         * @return {model.RecordMetadata[]} Array of record metadata for changed records.
         * @example <caption>This example logs a console message if the model has changed that includes the number of changes.</caption>
         * if ( model.isChanged() ) {
         *     console.log("Model has " + model.getChanges().length + " changes.");
         * }
         */
        // todo THINK is a copy needed? Is this just what will be sent to the server or is there a different method for that? likely different
        getChanges: function() {
            return this._changes;
        },

        /**
         * This marks the model as not having any changes. All change indications will be removed.
         * If any record deletes are pending they will be removed by this method. This does not revert or undo the
         * changes but rather removes all metadata that is tracking changes. This happens implicitly after the model
         * is saved (See {@link model#save}). Use this method if changes are persisted in some other way or the
         * changes should be discarded before refreshing the model.
         *
         * @fires model#clearChanges
         * @example <caption>This example clears all the changes of an interactive grid with static id "emp"
         * in response to a Cancel or Abort button being pressed by the user. Use in a Execute JavaScript Code dynamic action.
         * If not for the call to <code class="prettyprint">clearChanges</code> before <code class="prettyprint">refresh</code>
         * the interactive grid would prompt the user to save changes.</caption>
         * var ig$ = apex.region( "emp" ).widget(),
         *     view = ig$.interactiveGrid( "getCurrentView" );
         * if ( view.supports.edit ) {
         *     // leave edit mode so that the column items will be reinitialized
         *     ig$.interactiveGrid( "getActions" ).set( "edit", false );
         *     view.model.clearChanges();
         * }
         * apex.region("emp").refresh();
         */
        clearChanges: function() {
            this._clearChanges( "_changes" );
        },

        /**
         * <p>Return true if the model has any errors.</p>
         *
         * @return {Boolean} true if model has errors and false otherwise.
         * @example <caption>This example logs a console message if the model has errors.</caption>
         * if ( model.hasErrors() ) {
         *     console.log("Model has errors.");
         * }
         */
        hasErrors: function() {
            return this._errors.length > 0;
        },

        /**
         * <p>Return an array of record metadata for all records with errors.
         * Do not make any changes to the data structure returned.</p>
         *
         * @return {model.RecordMetadata[]} Array of record metadata for error records.
         */
        getErrors: function() {
            return this._errors;
        },

        /**
         * <p>Select or unselect the given record.</p>
         *
         * <p>This method should only be used by view widgets to persist the view selection state in metadata property
         * <code class="prettyprint">sel</code>.
         * Note there is no notification about this metadata change. Listen to the view for selection change events. Also
         * use the view to change the selection.</p>
         *
         * @param pRecordId The record id to set the selection state metadata.
         * @param {boolean} pSelected The desired record selection state; true to select and false to unselect.
         */
        setSelectionState: function( pRecordId, pSelected ) {
            var index = makeIdentityIndex( pRecordId ),
                iNode = this._index[ index ];

            if ( iNode ) {
                pSelected = !!pSelected;
                if ( iNode.sel !== pSelected ) {
                    iNode.sel = pSelected;
                    if ( pSelected ) {
                        this._selection[index] = iNode;
                        this._selectionCount += 1;
                    } else {
                        delete this._selection[index];
                        this._selectionCount -= 1;
                    }
                }
            }
        },

        // todo xxx think about how to store select all state
        /**
         * <p>Unselect all the selected records. See also {@link model#setSelectionState}.</p>
         *
         * <p>This method should only be used by view widgets to persist the view selection state in metadata property
         * <code class="prettyprint">sel</code>.
         * Note there is no notification about this metadata change. Listen to the view for selection change events. Also
         * use the view to change the selection.</p>
         */
        clearSelection: function() {
            var i;

            for ( i in this._selection ) {
                if ( this._selection.hasOwnProperty( i ) ) {
                    this._selection[i].sel = false;
                }
            }
            this._selection = {};
            this._selectionCount = 0;
        },

        /**
         * <p>Return the number of currently selected records. This only applies if a view is storing selection state
         * in the model. See also {@link model#setSelectionState}.</p>
         *
         * <p>This is used by views that store view selection state in the model to return the selection count.</p>
         *
         * @return {integer} The number of selected records.
         */
        getSelectedCount: function() {
            return this._selectionCount;
        },

        /**
         * <p>Return an array of the selected records. This only applies if a view is storing selection state
         * in the model. See also {@link model#setSelectionState}.</p>
         *
         * <p>This is used by views that store view selection state in the model to return the selection.</p>
         *
         * @return {model.Record[]} The selected records.
         */
        getSelectedRecords: function() {
            var i,
                selection = this._selection,
                records = [];

            for ( i in selection ) {
                if ( selection.hasOwnProperty( i ) ) {
                    records.push( selection[i].record );
                }
            }
            return records;
        },

        /**
         * Determine if the given record can be edited.
         *
         * <p>For a record to be editable:</p>
         * <ul>
         * <li>the model must have the <code class="prettyprint">editable</code> option set to true and</li>
         * <li>the type of the record must allow edit or</li>
         * <li>if the record has no type or doesn't specify if it can be edited the default type must allow edit</li>
         * <li>and if the model specifies an additional <code class="prettyprint">check</code> callback
         *   function it must allow or deny the edit</li>
         * </ul>
         *
         * @param {model.Record} pRecord The record to check if editing is allowed.
         * @return {boolean} true if the record can be edited.
         * @example <caption>This example checks if editing is allowed before setting a value.</caption>
         * if ( myModel.allowEdit( record ) ) {
         *     myModel.setValue( record, "NAME", newName );
         * }
         */
        allowEdit: function( pRecord ) {
            return this.check( "canEdit", pRecord );
        },

        /**
         * Determine if the given record can be deleted.
         *
         * <p>For a record to be deletable:</p>
         * <ul>
         * <li>the shape must not be record and</li>
         * <li>if the shape is a tree the record must not be the root record</li>
         * <li>the model must have the <code class="prettyprint">editable</code> option set to true and</li>
         * <li>the type of the record must allow delete or</li>
         * <li>if the record has no type or doesn't specify if it can be deleted the default type must allow delete</li>
         * <li>and if the model specifies an additional <code class="prettyprint">check</code> callback
         *   function it must allow or deny the delete</li>
         * </ul>
         *
         * @param {model.Record} pRecord The record to check if deleting is allowed.
         * @return {boolean} true if the record can be deleted.
         * @example <caption>This example checks if deleting is allowed before deleting a record.</caption>
         * if ( myModel.allowDelete( record ) ) {
         *     myModel.deleteRecords( [record] );
         * }
         */
        allowDelete: function( pRecord ) {
            var o = this._options;

            // TODO THINK should it be OK to delete the root? Perhaps only if showing the root
            if ( o.shape === "record" || ( o.shape === "tree" && pRecord === this._data )) {
                return false; // can't delete the record or the tree root
            }
            return this.check( "canDelete", pRecord );
        },

        /**
         * Determine if any record or one or more specific records can be added to the table collection or, for trees,
         * the parent record's children collection.
         *
         * <p>For any record or one or more specific records to be addable:</p>
         * <ul>
         * <li>the shape must not be record and</li>
         * <li>if the shape is a tree the parent record is required and must have a children collection</li>
         * <li>the model must have the <code class="prettyprint">editable</code> option set to true and</li>
         * <li>if the shape is tree the type of the parent record must allow add or</li>
         * <li>if the shape is table or the parent record has no type or doesn't specify if it allows add the
         * default type must allow add</li>
         * <li>and if the model specifies an additional <code class="prettyprint">check</code> callback function
         *   it must allow or deny the add</li>
         * <li>then, for tree shape only, if adding is allowed and <code class="prettyprint">pRecordsToAdd</code>
         *   is given then check if the type of each record to add is a valid child type for the parent using
         *   validChildren type property.</li>
         * </ul>
         *
         * @param {model.Record} [pParentRecord] The parent record to add children to if the shape is tree,
         *  null if the shape is table.
         * @param {string=} pAddAction Specifies how/why the records are to be added.
         *  Standard values are "new", "move", or "copy".
         * @param {(model.Record[])=} pRecordsToAdd An array of the records to be added. Only used for tree shape models.
         * @return {boolean} true if add is allowed.
         * @example <caption>This example checks if adding is allowed before inserting a record.</caption>
         * if ( myModel.allowAdd() ) {
         *     myModel.insertNewRecord();
         * }
         */
        allowAdd: function( pParentRecord, pAddAction, pRecordsToAdd ) {
            var i, validChildren, addOK, t,
                o = this._options;

            if ( o.shape === "record" ) {
                return false;
            }

            if ( o.shape === "tree" ) {
                if ( !pParentRecord || !pParentRecord[this._childrenKey] ) {
                    return false;
                }
            }
            addOK = this.check( "canAdd", pParentRecord, pAddAction, pRecordsToAdd );

            if ( addOK && pRecordsToAdd && o.shape === "tree" ) {
                t = this._getType( pParentRecord );
                if ( t.validChildren !== undefined) {
                    validChildren = t.validChildren;
                } else if ( o.types["default"].validChildren !== undefined ) {
                    validChildren = o.types["default"].validChildren;
                } else {
                    validChildren = true;
                }
                // addOK is already true look for a reason to not allow add
                if ( validChildren !== true ) {
                    for ( i = 0; i < pRecordsToAdd.length; i++ ) {
                        if ( validChildren.indexOf( pRecordsToAdd[i][this._typeKey] ) < 0 ) {
                            addOK = false;
                            break;
                        }
                    }
                }
            }
            return addOK;
        },

        /**
         * Determine if an record can be dragged.
         * Note this is just a check to see if the dragging can start. What is allowed on drop (move, copy etc.)
         * is a separate check.
         *
         * <p>For a record to be draggable:</p>
         * <ul>
         * <li>the shape must not be record and</li>
         * <li>the model must have the <code class="prettyprint">editable</code> option set to true and</li>
         * <li>the type of the record must allow drag or</li>
         * <li>if the record has no type or doesn't specify if it can be dragged the default type must allow drag</li>
         * <li>and if the model specifies an additional <code class="prettyprint">check</code> callback function
         *   it must allow or deny the drag</li>
         * </ul>
         *
         * @param {model.Record} pRecord The record to check if it can be dragged.
         * @return {boolean} true if the record can be dragged.
         */
        allowDrag: function( pRecord ) {
            var o = this._options;

            if ( o.shape === "record" ) {
                return false;
            }
            return this.check( "canDrag", pRecord );
        },

        /**
         * <p>Determine what drag operations are allowed for a set of records. Not all views support dragging.
         * Dragging is a view operation. The model provides this method simply to allow type based configuration
         * of available drag operations. Note: The model types option is not currently documented and may change
         * in the future.</p>
         *
         * @param {model.Record[]} pRecords array of records to determine drag operations for or null when dragging
         *     an external record into this model.
         * @return {object} object with allowed drag operations. The properties are: "normal", "ctrl", "alt", "shift", "meta".
         *     The standard values are "move", "copy" or "add". Other values are allowed. The normal property is required.
         *     The default is: <code class="prettyprint">{ normal: "move", ctrl: "copy" }</code>
         *     or if <code class="prettyprint">pRecords</code> is null <code class="prettyprint">{ normal: "add" }</code>
         */
        dragOperations: function( pRecords ) {
            var i, ops, type,
                o = this._options;

            if ( pRecords ) {
                if ( pRecords.length > 0 && this._typeKey ) {
                    // if all the nodes being dragged are of the same type use that type
                    type = pRecords[0][this._typeKey] || "default";
                    for ( i = 1; i < pRecords.length; i++ ) {
                        if ( ( pRecords[i][this._typeKey] || "default" ) !== type ) {
                            type = "default"; // else use default type
                            break;
                        }
                    }
                } else {
                    type = "default";
                }
                if ( o.types[type].operations && o.types[type].operations.drag !== undefined ) {
                    ops = o.types[type].operations.drag;
                } else {
                    ops = o.types["default"].operations.drag;
                }
            } else {
                ops = o.types["default"].operations.externalDrag;
            }
            return ops;
        },

        /**
         * <p>Low level operation permission checking. Better to use {@link model#allowEdit}, {@link model#allowDelete},
         * {@link model#allowAdd}, {@link model#allowDrag}.
         * The purpose is to determine what kinds of edits are allowed.</p>
         *
         * <p>If the model is not editable (editable option is false) then no operations are allowed.
         * Also no operations are allowed on deleted records or aggregate records.</p>
         *
         * <p>Operation checking is based on the type of the record (as determined by the type field) and the type
         * information given to the model in the types option. Type names are strings. The special type name
         * "default" is used to provide a default when records don't have a type or the type of the record doesn't
         * specify a value for the operation. Note: The model types option is not currently documented and may change
         * in the future.</p>
         *
         * <p>Operations are strings. The standard operation permissions are "canAdd", "canDelete", "canEdit",
         * "canDrag". You can define your own as well.</p>
         *
         * <p>First the record itself is checked to see if it allows the operation by checking if the record metadata contains
         * the specified permission.
         * Next the type of the record is checked to see if it allows the operation.
         * If the record has no type or the operations for that type didn't specify a value for the operation then
         * the default type is checked to see if it allows the operation.
         * The value of an operation is true or false or a function that returns true or false. The function is
         * called in the context of this model with arguments <code class="prettyprint">pRecord, pAddAction, pRecordsToAdd</code>.
         * If the model options includes a <code class="prettyprint">check</code> function then it is called with the result so far and all the
         * same arguments as this check function. See {@link model.CheckCallback}.</p>
         *
         * @param {string} pOperation One of the default checks ("canEdit", "canDelete", "canAdd", "canDrag") or a custom
         * operation.
         * @param {model.Record} [pRecord] The record to check if action is allowed on it.
         * @param {(string)=} pAddAction Only used by allowAdd see {@link model#allowAdd} for details.
         * @param {(model.Record[])=} pRecordsToAdd Only used by allowAdd see {@link model#allowAdd} for details.
         * @return {boolean} true if the operation is allowed.
         */
        check: function( pOperation, pRecord, pAddAction, pRecordsToAdd ) {
            var meta,
                result = false,
                o = this._options,
                t = this._getType( pRecord );

            // if not editable or there is a parent model and the parent record is deleted then no edit operations are allowed
            if ( !o.editable || this._masterRecordIsDeleted ) {
                return false;
            }

            if ( pRecord ) {
                meta = this.getRecordMetadata( this._getIdentity( pRecord ) );
                if ( meta ) {
                    if ( meta.deleted || meta.agg ) {
                        // can't do anything to deleted records (except revert which is not handled with check)
                        // also can't do anything to an aggregate record
                        return false;
                    }
                    // special case to allow things that were added/inserted to be edited and deleted
                    if ( meta.inserted && ( pOperation === "canEdit" || pOperation === "canDelete" ) ) {
                        return true;
                    }
                }
            }

            if ( meta && meta[pOperation] !== undefined ) {
                result = meta[pOperation];
            } else if ( t.operations && t.operations[pOperation] !== undefined ) {
                result = t.operations[pOperation];
            } else if ( o.types["default"].operations[pOperation] !== undefined ) {
                result = o.types["default"].operations[pOperation];
            }
            if ( isFunction( result ) ) {
                result = result.call( this, pRecord, pAddAction, pRecordsToAdd );
            }
            if ( isFunction( o.check ) ) {
                result = o.check( result, pOperation, pRecord, pAddAction, pRecordsToAdd );
            }
            return result;
        },

        /**
         * <p>Return the record for a given record id. This only considers records that are currently fetched
         * into the model. The server may have a record with the given record id but if it hasn't yet been
         * fetched into the model, it will not be found with this method.</p>
         * <p>For table or tree shape models that define an <code class="prettyprint">identityField</code>
         * option, call with the value of the record's identity field or if the records have multiple identity fields
         * call with an array of ids or a string representation of the combined identity fields as returned by
         * {@link model#getRecordId}.</p>
         * <p>For table shape models that don't define an <code class="prettyprint">identityField</code> option
         * call with the index of the record. This is the same as {@link model#recordAt}.
         * <p>For record shape models call with no record id to get the one and only model record.</p>
         * @param {string|string[]} [pRecordId] The record id.
         * @method getRecord
         * @memberof model
         * @instance
         * @return Record or null if no record corresponding to <code class="prettyprint">pRecordId</code> is found.
         * @example <caption>This example returns the record with identity "001002".</caption>
         * record = model.getRecord( "001002" );
         * @example <caption>This example has a table shape model with two identity fields. It returns the
         * record from a model with identity <code class="prettyprint">["AXB9", "00003"]</code>.</caption>
         * record = model.getRecord( ["AXB9", "00003"] );
         * @example <caption>This example returns the record from a model with shape record.</caption>
         * record = model.getRecord();
         */
        // getRecord: function( pRecordId )

        /**
         * <p>Get the value of a record field given the record itself
         * or omit the record when the model shape is record. See also {@link model#setValue}.</p>
         *
         * @param {model.Record} [pRecord] The record to return the value of the given column.
         *  Omit if model shape is record.
         * @param {string} pFieldName Name of record field to get.
         * @return {*} Value of record field.
         * @example <caption>This example returns the NAME field of the given record.</caption>
         * var name = model.getValue( someRecord, "NAME" );
         * @example <caption>This example returns the NAME field from a record shape model.</caption>
         * var name = model.getValue( "NAME" );
         */
        getValue: function( pRecord, pFieldName ) {
            var field;
            if ( pFieldName === undefined ) {
                pFieldName = pRecord;
                pRecord = this._data;
            }
            field = this.getFieldKey( pFieldName );
            return pRecord[field];
        },

        /**
         * <p>Set the value of a record field given the record itself
         * or omit the record when the model shape is record. See also {@link model#getValue}.</p>
         *
         * <p>An error is thrown if the record does not allow editing or the field does not allow being set.</p>
         *
         * @param {model.Record} [pRecord] The record that will have a field set to the given value.
         *  Omit if model shape is record.
         * @param {string} pFieldName Name of record field to set.
         * @param {*} pValue the value to set
         * @return {string|null} One of:
         * <ul>
         *     <li>"SET": The value was set.</li>
         *     <li>"DUP": The value was not set because of duplicate identity. This can only happen when setting an
         *     identity field. Note: Even if the new value is unique on the client it may still result in an
         *     error when saving because the client in general does not have all the data that the server does.</li>
         *     <li>"NC": The value was not set because the new value is equal to the old value.</li>
         *     <li>null: The record is not in the model.</li>
         * </ul>
         * @fires model#event:set
         * @example <caption>This example sets the NAME field of the given record.</caption>
         * model.getValue( someRecord, "NAME", newName );
         * @example <caption>This example sets the identity field PART_NO of the given record. It checks for
         * a duplicate value and gives a message if the new part number is already taken.</caption>
         * var result = model.getValue( someRecord, "PART_NO", newPartNo );
         * if ( result === "DUP" ) {
         *     apex.message.alert( "The part number " + newPartNo + " is already taken." );
         * }
         * @example <caption>This example sets the NAME field from a record shape model.</caption>
         * model.getValue( "NAME", newName );
         */
        // @param {boolean} pInternalNoMove for internal use only - not applicable for record shape models.
        setValue: function(pRecord, pFieldName, pValue, pInternalNoMove ) {
            var i, oldValue, field, iNode, meta, identity, originalIdentity, a, parentRecord, afterRecord,
                o = this._options,
                addedOriginal = false;

            if ( pValue === undefined ) {
                pValue = pFieldName;
                pFieldName = pRecord;
                pRecord = this._data;
            }

            function equal(a, b) {
                var i,
                    val1 = a,
                    val2 = b;

                if (  a !== null && typeof a === "object" && a.hasOwnProperty("v") ) {
                    val1 = a.v;
                    if ( b !== null && typeof b === "object" && b.hasOwnProperty("v")) {
                        val2 = b.v;
                    }
                }
                if ( isArray( val1 ) && isArray( val2 ) ) {
                    if ( val1.length !== val2.length ) {
                        return false;
                    }
                    // else
                    for ( i = 0; i < val1.length; i++ ) {
                        // non strict equality test on purpose
                        if ( val1[i] != val2[i] ) {
                            return false;
                        }
                    }
                    return true;
                }
                // else
                // non strict equality test on purpose
                return val1 == val2;
            }

            field = this.getFieldKey( pFieldName );
            // To avoid this exception the UI should always do its own check to make sure edits are allowed.
            // TODO THINK provide an option to enforce edit checks if false cuts down on calls to check
            if ( !this.allowEdit( pRecord )) {
                throw new Error("Set value not allowed for record.");
            }

            originalIdentity = this._getIdentity( pRecord );
            iNode = this.getRecordMetadata( originalIdentity );
            if ( !iNode ) {
                // nothing to set if record is not in the model!
                return null;
            }

            // if the field is readonly (unless there is a parent model field) or the cell is readonly. A checksum (ck) means readonly
            if ( ( o.fields[pFieldName].readonly && !o.fields[pFieldName].parentField ) || iNode.fields && iNode.fields[pFieldName] && iNode.fields[pFieldName].ck ) {
                throw new Error("Set value not allowed for field.");
            }

            // only update if new value is different from current value
            // Note: setting the value back to its original value does not "un-change" the record
            oldValue = pRecord[field];
            if ( !equal( oldValue, pValue ) ) {

                // if the seq or parent id field is changed then it is really a move operation. moveRecords will call setValue back
                if ( !pInternalNoMove && ( ( pFieldName === o.sequenceField /* todo && o.sortCompare */ ) || pFieldName === o.parentIdentityField ) ) {
                    a = parentRecord = afterRecord = null;
                    if ( pFieldName === o.sequenceField ) {
                        // find where to move this record to
                        if ( o.shape === "tree" ) {
                            parentRecord = this.parent();
                            // there should probably be something else that keeps you from setting the parent identity of the root node
                            if ( parentRecord ) {
                                a = parentRecord[this._childrenKey];
                            }
                        } else { // table
                            a = this._data;
                        }
                        if ( a ) {
                            for ( i = 0; i < a.length; i++ ) {
                                if ( ( parseFloat( a[i][this._sequenceKey] ) > parseFloat( pValue ) ) ) {
                                    break;
                                }
                                afterRecord = a[i];
                            }
                        }
                    } else if ( pFieldName === o.parentIdentityField ) {
                        parentRecord = this.getRecord( pValue );
                    }
                }

                if ( !iNode.original ) {
                    iNode.original = copyRecord( pRecord );
                    addedOriginal = true;
                }

                pRecord[field] = pValue;
                identity = this._getIdentity( pRecord );
                if ( identity !== originalIdentity ) {
                    if ( this._index[identity] ) {
                        // there is already an existing record with the same identity
                        // undo the setValue
                        pRecord[field] = oldValue;
                        if ( addedOriginal ) {
                            delete iNode.original;
                        }
                        return "DUP";
                    }
                    if ( !iNode.originalId ) {
                        iNode.originalId = originalIdentity;
                    }
                    delete this._index[originalIdentity];
                    this._index[identity] = iNode;
                    // if record is selected then update the selection index as well
                    if ( iNode.sel ) {
                        delete this._selection[originalIdentity];
                        this._selection[identity] = iNode;
                    }
                }

                if ( !iNode.updated && !iNode.deleted && !iNode.inserted ) {
                    // first time being changed so add to change list
                    this._addChange( iNode );
                }
                iNode.updated = true;
                if ( !iNode.fields ) {
                    iNode.fields = {};
                }
                meta = iNode.fields[pFieldName];
                if ( !meta ) {
                    meta = {};
                    iNode.fields[pFieldName] = meta;
                }
                meta.changed = true;

                // assume any change fixes any row level validation problem
                if ( iNode.error || iNode.warning ) {
                    this.setValidity( "valid", identity );
                }

                notifyChange( this, "set", {
                    oldValue: oldValue,
                    oldIdentity: identity !== originalIdentity ? originalIdentity : null,
                    recordId: identity,
                    record: pRecord,
                    field: pFieldName
                } );

                if ( parentRecord || afterRecord ) {
                    this.moveRecords( [pRecord], parentRecord, afterRecord );
                }
                return "SET";
            }
            return "NC";
        },

        /**
         * <p>Get the value of a record field given the record id.
         * This is only useful when the model shape is table or tree.
         * If there are many field values to get or set use {@link model#getRecord} followed by {@link model#getValue}
         * or {@link model#setValue}. See also {@link model#setRecordValue}.</p>
         *
         * @param {string|string[]} pRecordId Value of the record's identity field or array of values of the record's
         *     identity fields or value returned by {@link model#getRecordId}.
         * @param {string} pFieldName Name of record field to get.
         * @return {*} Value of record field.
         * @example <caption>This example gets the NAME field of the record with identity "00013".</caption>
         * var name = model.getRecordValue( "00013", "NAME" );
         */
        getRecordValue: function( pRecordId, pFieldName ) {
            return this.getValue( this.getRecord( pRecordId ), pFieldName);
        },

        /**
         * <p>Set the value of a record field given the record id.
         * This is only useful when the model shape is table or tree.
         * If there are many field values to get or set use {@link model#getRecord} followed by {@link model#getValue}
         * or {@link model#setValue}. See also {@link model#getRecordValue}.</p>
         *
         * @param {string|string[]} pRecordId Value of the record's identity field or array of values of the record's
         *     identity fields or value returned by {@link model#getRecordId}.
         * @param {string} pFieldName Name of record field to set.
         * @param pValue {*} Value to set.
         * @example <caption>This example sets the NAME field of the record with identity "00013".</caption>
         * model.setRecordValue( "00013", "NAME", newName );
         */
        setRecordValue: function( pRecordId, pFieldName, pValue ) {
            this.setValue( this.getRecord( pRecordId ), pFieldName, pValue);
        },

        /**
         * <p>Sets the validity and associated validation message of a record or record field.</p>
         *
         * @param {string} pValidity one of "error", "warning", "valid".
         * @param {string} pRecordId Value of the record's identity field or array of values of the record's
         *     identity fields or value returned by {@link model#getRecordId}.
         * @param {string} [pFieldName] Name of field that the validity state applies to or null if it applies to the whole record.
         * @param {string} [pMessage] Error or warning message text or omit if valid
         * @example <caption>This examples calls a function, <code class="prettyprint">checkRecord</code>, that returns
         * an error message if the record is not valid and null if it is valid. It then sets the validity of the record.
         * </caption>
         * var invalidReasonMessage = checkRecord( recordId );
         * if ( invalidReasonMessage ) {
         *     model.setValidity( "error", recordId, null, invalidReasonMessage );
         * } else {
         *     this.model.setValidity( "valid", recordId );
         * }
         */
        setValidity: function( pValidity, pRecordId, pFieldName, pMessage ) {
            var f, prop, meta, hasError, index, curValidity, curMessage,
                iNode = this._index[makeIdentityIndex( pRecordId )];

            if ( iNode ) {
                if ( pFieldName ) {
                    if ( !iNode.fields ) {
                        iNode.fields = {};
                    }
                    meta = iNode.fields[pFieldName];
                    if ( !meta ) {
                        meta = {};
                        iNode.fields[pFieldName]  = meta;
                    }
                } else {
                    meta = iNode;
                }
                curValidity = "valid";
                curMessage = meta.message || pMessage; // if there is no message make current same as pMessage for compare below
                if ( meta.warning ) {
                    curValidity = "warning";
                }
                if ( meta.error ) {
                    curValidity = "error";
                }
                // only update if there is a change
                if ( pValidity !== curValidity || curMessage !== pMessage ) {
                    switch ( pValidity ) {
                        case "error":
                            prop = "error";
                            delete meta.warning;
                            break;
                        case "warning":
                            prop = "warning";
                            delete meta.error;
                            break;
                        case "valid":
                            delete meta.error;
                            delete meta.warning;
                            delete meta.message;
                            break;
                        default:
                            throw new Error( "Invalid value for pValidity parameter: " + pValidity );
                    }
                    if ( prop ) {
                        meta[prop] = true;
                        meta.message = pMessage;
                    }
                    // if record or any fields have an error add to _errors list otherwise remove from list
                    hasError = iNode.error;
                    if ( !hasError && iNode.fields ) {
                        for ( f in iNode.fields ) {
                            if ( iNode.fields.hasOwnProperty( f ) ) {
                                if ( iNode.fields[f].error ) {
                                    hasError = true;
                                    break;
                                }
                            }
                        }
                    }
                    if ( hasError ) {
                        index = this._errors.indexOf( iNode );
                        // if already present remove from where it is
                        if ( index >= 0 ) {
                            this._errors.splice( index, 1 );
                        }
                        this._errors.push( iNode );
                    } else {
                        this._removeError( iNode );
                    }
                    this.metadataChanged( pRecordId, pFieldName );
                }
            }
        },

        /**
         * <p>Delete one or more records from a table or tree.
         * </p>
         * <p>If the <code class="prettyprint">onlyMarkForDelete</code>
         * option is true the records are just marked for delete.
         * Records marked for delete will be included in data returned by {@link model#forEach}, {@link model#forEachInPage},
         * {@link model#walkTree}, etc. and can be found by {@link model#getRecord}. They will be deleted once the
         * {@link model#clearChanges} method is called explicitly or implicitly after data has been saved successfully.
         * </p>
         * <p>If the <code class="prettyprint">onlyMarkForDelete</code> option is false
         * the records are deleted right away and are no longer part of the model. In either case the deleted records
         * are on the change list so the delete can be persisted.</p>
         *
         * <p>If <code class="prettyprint">pRecords</code> contains records that cannot be found in the collection
         * or finds records that can't be deleted they are ignored and a debug warning is given.</p>
         *
         * @param {model.Record[]} pRecords An array of records to delete.
         * @returns {number} The number of records deleted or marked for delete.
         * @fires model#event:delete
         * @example <caption>This example checks if deleting is allowed before deleting a record.</caption>
         * if ( myModel.allowDelete( record ) ) {
         *     myModel.deleteRecords( [record] );
         * }
         */
        deleteRecords: function( pRecords ) {
            var i, iNode, recordId, rec,
                deleted = [],
                deletedIds = [],
                o = this._options;

            if ( o.shape === "record" ) {
                throw invalidShapeError( "deleteRecords" );
            }

            for ( i = 0; i < pRecords.length; i++ ) {
                rec = pRecords[i];
                recordId = this._getIdentity( rec );
                iNode = this.getRecordMetadata( recordId );
                if ( !iNode ) {
                    debug.warn( "Record to delete not found: " + recordId );
                    continue;
                }

                if ( !this.allowDelete( rec ) ) {
                    debug.warn( "Delete not allowed for record: " + recordId );
                    continue;
                }
                if ( o.shape === "table" ) {
                    this._numDeletedRecords += 1;
                }
                if ( !o.onlyMarkForDelete || iNode.inserted ) {
                    if ( o.shape === "table" && iNode.inserted ) {
                        this._numDeletedRecords -= 1;
                        this._numInsertedRecords -= 1;
                    }
                    // remove from collection
                    this._removeRecord( recordId, iNode );
                }
                if ( iNode.inserted ) {
                    // Deleting something that was inserted is as if it was never inserted.
                    // Remove from change list and later from the collection
                    delete iNode.inserted;
                    delete iNode.autoInserted;
                    delete iNode.updated;
                    this._removeError( iNode );
                    this._removeChange( iNode );
                } else {
                    // deleted things cannot have errors
                    clearRecordChanges( iNode, true ); // only clear errors not changes
                    this._removeError( iNode );
                    iNode.deleted = true; // mark as deleted
                    this._addChange(iNode); // record delete change
                }
                // todo if shape is tree and just marking for delete then it seems to make sense to mark all descendants as deleted
                deleted.push( rec );
                deletedIds.push( recordId );
            }

            if ( deleted.length > 0 ) {
                notifyChange( this, "delete", {
                    records: deleted,
                    recordIds: deletedIds
                } );
            }
            return deleted.length;
        },

        /**
         * <p>Return true if the record exists in the model and has a change that can be reverted
         * (is updated or is deleted). See also {@link model#revertRecords}.</p>
         *
         * @param {model.Record} pRecord The record to check if it can be reverted.
         * @return {boolean} true if record has change that can be reverted.
         * @example <caption>This example checks if a record can be reverted before reverting it.</caption>
         * if ( myModel.canRevertRecord( record ) ) {
         *     myModel.revertRecords( [record] );
         * }
         */
        canRevertRecord: function( pRecord ) {
            var iNode;

            iNode = this.getRecordMetadata( this._getIdentity( pRecord ) );
            return !!( iNode && ( iNode.original || iNode.deleted ) );
        },

        /**
         * <p>Revert one or more records to the way they were when first added to the model or last saved.
         * This undoes any changes made to the records. See also {@link model#canRevertRecord}.</p>
         *
         * @param {model.Record[]} pRecords The records to revert.
         * @returns {integer} The number of records reverted. This can be less than the number of records in
         *   <code class="prettyprint">pRecords</code> if some of the records had no changes to revert.
         * @fires model#event:revert
         * @example <caption>This example checks if a record can be reverted before reverting it.</caption>
         * if ( myModel.canRevertRecord( record ) ) {
         *     myModel.revertRecords( [record] );
         * }
         */
        revertRecords: function( pRecords ) {
            var i, iNode, rec, recordId, a, index,
                newIds = {},  // map from old (changed) ids to new (reverted) ids
                reverted = [],
                revertedIds = [],
                o = this._options;

            for ( i = 0; i < pRecords.length; i++ ) {
                rec = pRecords[i];
                recordId = this._getIdentity( rec );
                iNode = this.getRecordMetadata( recordId );

                if ( !iNode ) {
                    debug.warn( "Record to revert not found: " + recordId );
                    continue;
                }

                if ( !iNode.original && !iNode.deleted ) {
                    debug.warn( "Nothing to revert for record " + recordId );
                    continue;
                }

                if ( o.shape === "table" ) {
                    a = this._data;
                } else if ( o.shape === "tree" ) {
                    a = this.parent( iNode.record )[this._childrenKey];
                }
                index = a.indexOf( iNode.record );

                if ( iNode.deleted ) {
                    if ( o.shape === "table" ) {
                        this._numDeletedRecords -= 1;
                    }
                    delete iNode.deleted;
                } else {
                    // if the identity/primary key has been edited reinsert in index under original id
                    if ( iNode.originalId ) {
                        this._index[iNode.originalId] = iNode;
                        delete this._index[recordId];
                        // if record is selected then update the selection index as well
                        if ( iNode.sel ) {
                            this._selection[iNode.originalId] = iNode;
                            delete this._selection[recordId];
                        }
                        newIds[recordId] = iNode.originalId;
                        delete iNode.originalId;
                    }
                    if ( iNode.original ) {
                        iNode.record = iNode.original;
                        delete iNode.original;
                    }
                    delete iNode.updated;
                    clearRecordChanges( iNode );
                    this._removeError( iNode );
                }
                this._removeChange( iNode ); // this checks to make sure there are no remaining changes

                // update in collection if needed
                rec = iNode.record;
                if ( a[index] !== rec ) {
                    a[index] = rec;
                }
                reverted.push( rec );
                revertedIds.push( recordId );
            }

            if ( reverted.length > 0 ) {
                notifyChange( this, "revert", {
                    records: reverted,
                    recordIds: revertedIds,
                    newIds: newIds
                } );
            }
            return reverted.length;
        },

        /**
         * <p>Inserts a new record into the collection. Only applies to tree and table shape models.
         * For tree shape models the record is inserted under the given parent node. The model must
         * allow adding new records. See {@link model#allowAdd}.</p>
         *
         * @param {model.Record} [pParentRecord] Parent tree node. Only for tree shape models, must be null otherwise.
         * @param {model.Record} [pAfterRecord] Record after which to insert the new record. If not given
         *   the new record is inserted at the beginning.
         * @param {model.Record} [pNewRecord] The new record to insert. If not given a new record is created using defaults.
         *   The identity, meta, children, and parent fields if any will be initialized.
         * @return {string} The temporary primary key of inserted record.
         * @fires model#event:insert
         */
        insertNewRecord: function( pParentRecord, pAfterRecord, pNewRecord ) {
            var iNode, index, pk, newRecord, a, beginSeq, endSeq,
                o = this._options,
                afterId = null;

            if ( o.shape === "record" ) {
                throw invalidShapeError( "insertNewRecord" );
            }

            newRecord = this._initRecord( pNewRecord, null, pParentRecord );

            if ( !this.allowAdd( pParentRecord, "new", [newRecord] ) ) {
                throw new Error( "Insert not allowed for new record." );
            }

            // insert in collection
            if ( o.shape === "tree" ) {
                if ( pParentRecord ) {
                    a = pParentRecord[this._childrenKey];
                } else {
                    a = this._data[this._childrenKey];
                }
            } else { // table
                a = this._data;
            }
            index = 0;
            if ( pAfterRecord ) {
                afterId = this._getIdentity( pAfterRecord );
                iNode = this.getRecordMetadata( afterId );
                if ( iNode ) {
                    index = a.indexOf( iNode.record ) + 1;
                }
            }
            if ( this._sequenceKey ) {
                // assign a sequence for this new record
                beginSeq = endSeq = -1;
                if ( index - 1 >= 0) {
                    beginSeq = parseFloat( a[index - 1][this._sequenceKey] );
                }
                if ( index < a.length ) {
                    endSeq = parseFloat( a[index][this._sequenceKey] );
                }
                newRecord[this._sequenceKey] = "" + getSequence( o.sequenceStep, beginSeq, endSeq, 1, 1 );
            }

            a.splice( index, 0, newRecord );

            // insert in index
            pk = this._getIdentity( newRecord );
            iNode = { record: newRecord, inserted: true };
            this._index[pk] = iNode;
            this._addChange( iNode );
            if ( o.shape === "tree" ) {
                iNode.parent = pParentRecord;
            } else {
                this._numInsertedRecords += 1;
            }

            notifyChange( this, "insert", {
                record: newRecord,
                recordId: pk,
                insertAfterId: afterId
            } );
            return pk;
        },

        /**
         * <p>Moves the given records to a new position in the collection (table or parentRecord's children) or, for
         * tree shape only, to a new parent node.</p>
         *
         * <p>For tree shape models if there is a <code class="prettyprint">parentIdentityField</code>
         * the moved records will have the parent identity field
         * set to the identity of the new parent record.</p>
         *
         * @param {model.Record[]} pRecords Array of records to move.
         * @param {model.Record} [pParentRecord] Only used when the shape is tree.
         *     This is the parent node to insert the moved records into. If null then insert to root.
         * @param {model.Record} [pAfterRecord] The moved records are added after this record or if null at the beginning.
         * @return {string[]} Array of record identities of moved records.
         * @fires model#event:move
         */
        /* TODO add this info once sequence is documented
         * <p>If there is a <code class="prettyprint">sequenceField</code> the records are assumed
         * to already be sorted by the sequence. The moved
         * records will be given new sequence numbers that maintain the order.</p>
         *
         * <p>Note: Unless the parent record changes or there is a sequence field there is no change and nothing to revert.</p>
         */
        moveRecords: function( pRecords, pParentRecord, pAfterRecord ) {
            var i, iNode, index, a, prev, prevIndex, record, recordId, beginSeq, endSeq,
                o = this._options,
                recordIds = [],
                records = [],
                afterId = null;

            if ( o.shape === "record" ) {
                throw invalidShapeError( "moveRecords" );
            }

            /* todo check if move is allowed
            table/tree: if there is a sequence field then check allowEdit
            tree: if moving from one parent to another it may make sense to check if delete is allowed.
            OTOH perhaps there should be a distinct allowMove
             for ( i = 0; i < nodes.length; i++ ) {
                 if ( !nodeAdapter.allowDelete( nodes[i] ) ) {
                     allAllowDelete = false;
                     break;
                 }
             }
             tree: if changing to a new parent check if allow add for the nodes
             if ( allAllowDelete && nodeAdapter.allowAdd( parentNode, "move", nodes ) ) {
                 focus = this.element.find( "." + C_FOCUSED ).length > 0; // if have focus then focus selection after move
                 this._moveOrCopy( {}, toParentNodeContent$, index, nodeContent$, false, focus );
             }
             */

            // where to start inserting the moved records
            if ( o.shape === "tree" ) {
                if ( !pParentRecord ) {
                    pParentRecord = this._data;
                }
                a = pParentRecord[this._childrenKey];
            } else { // table
                a = this._data;
            }
            index = 0;
            if ( pAfterRecord ) {
                afterId = this._getIdentity( pAfterRecord );
                iNode = this.getRecordMetadata( afterId );
                if ( iNode ) {
                    index = a.indexOf( iNode.record ) + 1;
                }
                if ( !iNode || index < 0 ) {
                    debug.warn( "AfterRecord not found, move to beginning." );
                    index = 0;
                }
            }

            if ( this._sequenceKey ) {
                // figure out the range for sequence numbers
                beginSeq = endSeq = -1;
                if ( index - 1 >= 0) {
                    beginSeq = parseFloat( a[index - 1][this._sequenceKey] );
                }
                if ( index < a.length ) {
                    endSeq = parseFloat( a[index][this._sequenceKey] );
                }
            }

            for ( i = 0; i < pRecords.length; i++ ) {
                record = pRecords[i];
                recordId = this._getIdentity( record );
                iNode = this.getRecordMetadata( recordId );
                if ( !iNode ) {
                    debug.warn( "Record to move not found: " + recordId );
                    continue;
                }

                // remove from current location
                if ( o.shape === "tree" ) {
                    prev = this.parent(record);
                    if ( !prev ) {
                        debug.warn( "Move not allowed for root" );
                        continue;
                    }
                    prev = prev[this._childrenKey];
                } else {
                    prev = a;
                }
                prevIndex = prev.indexOf(record);
                prev.splice( prevIndex, 1); // delete from table/previous parent node
                if ( a === prev && prevIndex < index ) {
                    // when reordering in the same node (or for table shape) take into consideration the node just deleted
                    index -= 1;
                }

                records.push( record );
                recordIds.push( recordId );

                // insert in collection
                a.splice( index, 0, record );
                index += 1;

                if ( this._sequenceKey ) {
                    // assign a sequence for this record
                    this.setValue( record, o.sequenceField, "" + getSequence( o.sequenceStep, beginSeq, endSeq, pRecords.length, i + 1 ), true );
                }

                if ( o.shape === "tree" ) {
                    iNode.parent = pParentRecord;
                    if ( this._parentIdKey ) {
                        this.setValue( record, o.parentIdentityField, this._getIdentity( pParentRecord ), true );
                    }
                }
                // no change to index because nothing created and no identity changed just the position of the record has changed
            }
            notifyChange( this, "move", {
                records: records,
                recordIds: recordIds,
                insertAfterId: afterId
            } );

            return recordIds;
        },

        /**
         * <p>Copies the given records and inserts the copies into the collection (table or parent node's children) or, for
         * tree shape only, to a new parent node.</p>
         *
         * @param {model.Record[]} pRecords Array of records to copy.
         * @param {model.Record} [pParentRecord] Only used when the shape is tree. This is the parent node to insert the copies into. If null then insert to root.
         * @param {model.Record} [pAfterRecord] The copied records are added after this record or if null at the beginning.
         * @return {string[]} Array of temp primary keys of inserted records.
         * @fires model#event:copy
         * @example <caption>This examples copies the selected records to just after the last selected record.</caption>
         * var keys = model.copyRecords( selectedRecords, null, selectedRecords[ selectedRecords.length - 1 ] );
         */
        copyRecords: function( pRecords, pParentRecord, pAfterRecord ) {
            var i, iNode, index, record, newRecord, recordId, a, pk, visitor, beginSeq, endSeq,
                self = this,
                o = this._options,
                recordIds = [],
                records = [],
                afterId = null;

            if ( o.shape === "record" ) {
                throw invalidShapeError( "copyRecords" );
            }

            /* todo check if copy allowed
              tree: the parent should allow add for the given nodes
z             if ( nodeAdapter.allowAdd( parentNode, "copy", nodes ) ) {
                 focus = this.element.find( "." + C_FOCUSED ).length > 0; // if have focus then focus selection after copy
                 this._moveOrCopy( {}, toParentNodeContent$, index, nodeContent$, true, focus );
             }
             table or tree if sequence field then check if can edit NO because can always edit what is inserted
             */
            // where to start inserting the copies
            if ( o.shape === "tree" ) {
                visitor = {
                    node: function( n, p ) {
                        var pk, iNode;
                        if ( p ) {
                            pk = self._getIdentity( n );
                            iNode = { record: n, inserted: true, parent: p };
                            self._index[pk] = iNode;
                            self._addChange( iNode );
                        }
                    }
                };
                if ( !pParentRecord ) {
                    pParentRecord = this._data;
                }
                a = pParentRecord[this._childrenKey];
            } else { // table
                a = this._data;
            }
            index = 0;
            if ( pAfterRecord ) {
                afterId = this._getIdentity( pAfterRecord );
                iNode = this.getRecordMetadata( afterId );
                if ( iNode ) {
                    index = a.indexOf( iNode.record ) + 1;
                }
                if ( !iNode || index < 0 ) {
                    debug.warn( "AfterRecord not found, copy to beginning." );
                    index = 0;
                }
            }

            if ( this._sequenceKey ) {
                // figure out the range for sequence numbers
                beginSeq = endSeq = -1;
                if ( index - 1 >= 0) {
                    beginSeq = parseFloat( a[index - 1][this._sequenceKey] );
                }
                if ( index < a.length ) {
                    endSeq = parseFloat( a[index][this._sequenceKey] );
                }
            }

            for ( i = 0; i < pRecords.length; i++ ) {
                record = pRecords[i];
                recordId = this._getIdentity( record );
                iNode = this.getRecordMetadata( recordId );
                if ( !iNode ) {
                    debug.warn( "Record to copy not found: " + recordId );
                    continue;
                }

                newRecord = this._initRecord( null, pRecords[i], pParentRecord );
                // insert in collection
                a.splice( index, 0, newRecord );
                index += 1;

                if ( this._sequenceKey ) {
                    // assign a sequence for this new record
                    newRecord[this._sequenceKey] = "" + getSequence( o.sequenceStep, beginSeq, endSeq, pRecords.length, i + 1 );
                }

                // insert in index
                pk = this._getIdentity( newRecord );
                records.push( newRecord );
                recordIds.push( pk );
                iNode = { record: newRecord, inserted: true };
                this._index[pk] = iNode;
                this._addChange( iNode );
                if ( o.shape === "tree" ) {
                    iNode.parent = pParentRecord;
                    // when copying a tree node that has children all its children were also copied and also need to be inserted in the index
                    this.walkTree( newRecord, visitor, null );
                } else {
                    this._numInsertedRecords += 1; // doesn't apply for trees
                }
            }
            notifyChange( this, "copy", {
                records: records,
                recordIds: recordIds,
                insertAfterId: afterId
            } );

            return recordIds;
        },

        //
        // Tree shape specific methods
        //
        // For these methods the term node is used in place of record.
        //

        /**
         * <p>Return the root node of the tree. An error is thrown if the model shape is not tree.</p>
         *
         * @return {model.Node} Root node or null if there is no root.
         * @example <caption>This example gets the tree shape model root node.</caption>
         * var rootNode = model.root();
         */
        root: function() {
            if ( this._options.shape !== "tree" ) {
                throw invalidShapeError( "root" );
            }
            return this._data;
        },

        /**
         * <p>Return the child at pIndex of node pNode.</p>
         *
         * <p>This method must only be used on tree shape models.</p>
         *
         * @param {model.Node} pNode The node who's ith child is to be returned.
         * @param {integer} pIndex The index of the child node.
         * @return {model.Node} The ith child node.
         * @example <caption>This example loops over the children of a parent node.</caption>
         * var i, node;
         * for ( i = 0; i < model.childCount( parentNode ); i++ ) {
         *     node = mode.child( parentNode, i );
         *     // do something with node
         * }
         */
        child: function( pNode, pIndex ) {
            var c = pNode[this._childrenKey];
            if ( c ) {
                return c[pIndex];
            }
            // undefined
        },

        /**
         * <p>Return the parent node of the given node. Only supported for tree shape models that have an
         * <code class="prettyprint">identityField</code> option defined.</p>
         *
         * <p>This method must only be used on tree shape models.</p>
         *
         * @param {model.Node} pNode The node to get the parent of.
         * @return {model.Node} Parent node or null for the root node and undefined otherwise
         */
        parent: function( pNode ) {
            var id, iNode;

            if ( this._identityKeys ) {
                id = this._getIdentity( pNode );
                iNode = this.getRecordMetadata( id );
                if ( iNode && iNode.hasOwnProperty( "parent" ) ) {
                    return iNode.parent ? iNode.parent : null;
                }
            }
            // undefined
        },

        /**
         * <p>Returns the number of children that node <code class="prettyprint">pNode</code> has, or null if the answer is not yet known.
         * A node that has its children lazy loaded may not know how many children it has until they are loaded.</p>
         *
         * <p>This method must only be used on tree shape models.</p>
         *
         * @param {model.Node} pNode The node who's children are to be counted.
         * @return {integer} Number of children, 0 if none, or null if not known.
         * @example <caption>This example loops over the children of a parent node.</caption>
         * var i, node;
         * for ( i = 0; i < model.childCount( parentNode ); i++ ) {
         *     node = mode.child( parentNode, i );
         *     // do something with node
         * }
         */
        childCount: function( pNode ) {
            var c = pNode[this._childrenKey];
            if ( c === null) {
                return null;
            } // else
            return c ? c.length : 0;
        },

        /**
         * <p>Returns true if the node <code class="prettyprint">pNode</code> has children, false if it does not,
         * and null if not yet known.
         * A node that has its children lazy loaded may not know if it has any children until they are loaded.
         *
         * @param {model.Node} pNode The node to check if it has any children.
         * @return {boolean} true if the node has children, false if it does not, and null if not known.
         * @example <caption>This example logs a message to the console if the node is a leaf (has no children).</caption>
         * if ( model.hasChildren( node ) === true ) {
         *     console.log("node is a leaf");
         * }
         */
        hasChildren: function( pNode ) {
            var c = pNode[this._childrenKey];
            if ( c === null) {
                return null;
            } // else
            return c ? c.length > 0 : false;
        },

        /**
         * <p>Fetch child nodes for node <code class="prettyprint">pNode</code>.
         * This method is only used for trees that lazy load data from the sever as needed. The top level
         * of nodes should not be lazy loaded.</p>
         *
         * <p>This is an asynchronous operation. When it completes the <code class="prettyprint">pCallback</code>
         * function is called with a status argument. Where status is:
         * <ul>
         *     <li>> 0 (or true) if 1 or more children were fetched.</li>
         *     <li>0 if the node has 0 children.</li>
         *     <li>Error if there was an error fetching the children.</li>
         * </ul>
         *
         * <p>Can use either the callback argument or the returned promise to determine when the request is complete.</p>
         *
         * @param {model.Node} pNode The node record to fetch children for.
         * @param {function} [pCallback] callback function that is called after nodes have been fetched or there is an error.
         * @return {promise} A promise that receives count of children fetched when resolved and an Error argument when rejected.
         * @fires model#event:addData
         */
        fetchChildNodes: function( pNode, pCallback ) {
            var p, promiseRet, requestData, requestOptions, thisRegion,
                self = this,
                o = this._options,
                deferred = makeDeferred();

            thisRegion = extend( {}, o.regionData, {
                id: o.regionId,
                ajaxIdentifier: o.ajaxIdentifier,
                fetchData: extend( {}, o.fetchData, {
                    version: o.version,
                    parentId: this._getPrimaryKey( pNode )
                })
            } );

            requestData = {
                regions: [ thisRegion ]
            };
            if ( o.pageItemsToSubmit ) {
                requestData.pageItems = o.pageItemsToSubmit;
            }
            this._addParentItems( requestData.regions[0] );

            requestOptions = {
                loadingIndicator: makeLoadingIndicatorFunction( this )
            };

            p = this._callServer( requestData, requestOptions );
            p.done( function( data ) {
                var children = data[self._childrenKey];
                self._addData( pNode, null, children );
                // todo some kind of notification? like refreshFromParentNode
                deferred.resolve( children.length );
            }).fail( function( jqXHR, textStatus, errorThrown ) {
                deferred.reject( makeAjaxError( "Error retrieving data.", jqXHR, textStatus, errorThrown ) ); // todo i18n???
            });

            promiseRet = deferred.promise();
            if ( pCallback ) {
                promiseRet.always( pCallback );
            }
            return promiseRet;
        },

        // todo clearChildren method - the intention is that you can fetch new data for a sub tree
        // todo issue is unsaved changes in branch
        clearChildNodes: function( pNode ) {
            var c = pNode[this._childrenKey];
//            if ( c !== null) {
                // todo tree walk sub tree and clear any changes
//            }
            pNode[this._childrenKey] = null; // this means unknown so the server will be contacted
            // todo trigger some notification perhaps refresh with the parent node given
        },

        /**
         * <p>Traverse the tree shape model. Methods of the <code class="prettyprint">pVisitor</code> object
         * are called as follows:</p>
         * <ul>
         *     <li>First the visitor <code class="prettyprint">node</code> method is called for the
         *     <code class="prettyprint">pNode</code> passed to <code class="prettyprint">walkTree</code>.</li>
         *     <li>If the node has children the remaining steps are done.</li>
         *     <li>The visitor <code class="prettyprint">beginChildren</code> method is called.</li>
         *     <li>For each child node <code class="prettyprint">walkTree</code> is called performing these steps recursively.</li>
         *     <li>The visitor <code class="prettyprint">endChildren</code> method is called.</li>
         * </ul>
         *
         * @param {model.Node} pNode The node to start with. This node is visited and then all of its children are.
         * @param {object} pVisitor
         * @param {function} pVisitor.node Function with signature function(node, parent).
         * @param {function} [pVisitor.beginChildren] Function with signature function(node).
         * @param {function} [pVisitor.endChildren] Function with signature function(node).
         * @param {model.Node=} pParentNode The parent node of <code class="prettyprint">pNode</code> or null if
         * <code class="prettyprint">pNode</code> is the root. If this argument is omitted or undefined and
         * the model has the <code class="prettyprint">identityField</code> option defined the parent node
         * will be determined automatically. If this argument is omitted or undefined and
         * the model does not have the <code class="prettyprint">identityField</code> option defined then
         * the parent parameter in each call to the visitor <code class="prettyprint">node</code> method is null.
         * @example <caption>This example walks the tree shape model starting at the root logging information
         * about the tree as it goes. Indentation shows the structure of the tree.
         * The nodes in this model have a NAME field.</caption>
         * var indent = "";
         * model.walkTree( model.root(), {
         *     node: function( node, parent } {
         *         console.log( "Node: " + model.getValue( node, "NAME" ) );
         *     },
         *     beginChildren: function( node ) {
         *         indent += "    ";
         *     },
         *     endChildren: function( node ) {
         *         indent = indent.substring(4);
         *     }
         * }, null );
         */
        walkTree: function( pNode, pVisitor, pParentNode ) {
            var i, id, iNode, c, prune;

            if ( pParentNode === undefined ) {
                pParentNode = null;
                id = this._getIdentity( pNode );
                if ( id ) {
                    iNode = this.getRecordMetadata( id );
                    if ( iNode ) {
                        pParentNode = iNode;
                    }
                }
            }
            prune = pVisitor.node(pNode, pParentNode);
            if (prune) {
                return;
            }
            c = pNode[this._childrenKey];
            if ( c && c.length > 0 ) {
                if ( pVisitor.beginChildren ) {
                    pVisitor.beginChildren( pNode );
                }
                for ( i = 0; i < c.length; i++ ) {
                    this.walkTree( c[i], pVisitor, pNode );
                }
                if ( pVisitor.endChildren ) {
                    pVisitor.endChildren( pNode );
                }
            }
        },

        //
        // Notification subscription methods
        //

        /**
         * @typedef {object} model.Observer
         * @desc
         * <p>Information about an observer for subscribing to this model. See {@link model#subscribe} and
         * {@link model#unSubscribe}.</p>
         *
         * @property {string=} viewId A unique key that can be used to unsubscribe.
         *     A DOM element id makes a good unique key.
         * @property {function} onChange A function to receive change notifications. The signature is
         *     <code class="prettyprint">function(changeType, change)</code><br>
         *     <code class="prettyprint">changeType</code> is a string describing the change such as "delete"<br>
         *     <code class="prettyprint">change</code> is an object with details about the change.<br>
         *     See each notification for details.
         * @property {jQuery=} progressView jQuery object to center a progress spinner over while performing an
         *     asynchronous network operation such as {@link model#fetch} or {@link model#save}.
         * @property {object=} progressOptions Options object for {@link apex.util.showSpinner}.
         */

        /**
         * <p>Subscribe to model change notifications by adding an observer.</p>
         *
         * @param {model.Observer} pObserver An observer object that includes a callback function to receive notifications.
         * @return {string} A viewId to use with {@link model#unSubscribe}. This is the same as the
         *   <code class="prettyprint">viewId</code> property if there is one. One is generated if not given in
         *   <code class="prettyprint">pObserver</code>
         * @example <caption>This simple example subscribes to a model to handle notifications.</caption>
         * var viewId = model.subscribe( {
         *     onChange: function( changeType, change ) {
         *         // respond to model changes
         *     }
         * } );
         * @example <caption>This example is typical of what a widget that displays model data would do to subscribe.</caption>
         * var viewId = model.subscribe( {
         *     viewId: this.element[0].id
         *     onChange: function(changeType, change) {
         *         // respond to model changes
         *     },
         *     progressView: this.element
         * } );
         */
        subscribe: function( pObserver ) {
            var viewId = pObserver.viewId;
            if ( !viewId ) {
                viewId = "v::" + gNextViewId;
                gNextViewId += 1;
                pObserver.viewId = viewId;
            }
            this._listeners.push( pObserver );
            return viewId;
        },

        /**
         * <p>Unsubscribe to model change notifications.</p>
         *
         * @param {string} pViewId The view id returned from {@link model#subscribe}.
         * @example <caption>This example unsubscribes from this model using the <code class="prettyprint">viewId</code>
         * returned when subscribing.</caption>
         * model.unSubscribe(viewId);
         */
        unSubscribe: function( pViewId ) {
            var i;
            for ( i = 0; i < this._listeners.length; i++ ) {
                if ( this._listeners[i].viewId === pViewId ) {
                    this._listeners.splice( i, 1 );
                }
            }
        },

        /* notifications*/

        /**
         * Sent when the model has been given new data or there is a change in data
         * on the server that the model should now go get. In either case the previous data in the
         * model is gone/changed so any views showing the model data should re-render their views.
         *
         * @event model#refresh
         * @property {string} changeType "refresh"
         * @property {object} change Empty object
         */

        /**
         * Sent when specific records in the model have changed. This happens when the model is saved if
         * the server returns updated records or when {@link model#fetchRecords} is called. Both the record field values
         * and metadata may have changed. The view layer should render the new record including taking into
         * consideration any metadata and replace the existing view of the record.
         *
         * @event model#refreshRecords
         * @property {string} changeType "refreshRecords"
         * @property {object} change
         * @property {array} change.records Records that have been updated. Note for inserted items this includes the new id
         * @property {array} change.recordIds Record ids that have been changed. Note for inserted items the previous (old) id
         *    is given. The ith item in this array corresponds to the ith item in the records array.
         * @property {object} change.newIds For inserted records this is a map from the previous (old) id to the new id.
         */

        /**
         * Sent when the model has been saved (or {@link model#clearChanges} called) after all metadata related to changes
         * has been cleared.
         *
         * @event model#clearChanges
         * @property {string} changeType "clearChanges"
         * @property {object} change
         * @property {array} change.deletedIds Record ids for deleted records.
         * @property {array} change.changedIds Record ids for records that had been updated or inserted.
         */

        /**
         * Sent when data has been added to the model from the server.
         *
         * @event model#addData
         * @property {string} changeType "addData"
         * @property {object} change
         * @property {model.Node} change.parentNode Only for tree shape models. This is the parent node the data was added to or null if root.
         * @property {integer} change.offset Index into the client model data. 0 for tree or record shape models
         * @property {integer} change.count Number of records added to the model. For a tree shape model this is the number of nodes added
         *   to the parent or 1 if root. For table shape models the count could be less than the number
         *   of records returned by the server if some records were merged (replaced) existing record with same identity.
         * @property {array} change.replacedIds Only for table shape models. Array of record ids that were replaced.
         *   This happens when a record returned by the server is already in the model. In this case the existing
         *   record is replaced and the record id is added to this list.
         */

        /**
         * Sent when a field value of a record is changed.
         *
         * @event model#set
         * @property {string} changeType "set"
         * @property {object} change
         * @property {*} change.oldValue The previous value of the field.
         * @property {string} change.oldIdentity If the identity changed this is the previous identity value.
         * @property {string} change.recordId The id of the record that changed.
         * @property {model.Record} change.record The record that changed.
         * @property {string} change.field The name of the field that changed.
         */

        /**
         * Sent when one or more records are deleted.
         *
         * @event model#delete
         * @property {string} changeType "delete"
         * @property {object} change
         * @property {array} change.records The records that were deleted.
         * @property {array} change.recordIds The ids of the records that were deleted.
         *   The ith item in this array corresponds to the ith item in the records array.
         */

        /**
         * Sent when a record is inserted into the model.
         *
         * @event model#insert
         * @property {string} changeType "insert"
         * @property {object} change
         * @property {model.Record} change.record The inserted record.
         * @property {string} change.recordId The id of the inserted record.
         * @property {string} change.insertAfterId The id of the record that this new record was inserted
         *   after or null if inserted at the beginning.
         */

        /**
         * Sent when one or more records are copied.
         *
         * @event model#copy
         * @property {string} changeType "copy"
         * @property {object} change
         * @property {array} change.records The records that were copied.
         * @property {array} change.recordIds The ids of the records that were copied.
         *   The ith item in this array corresponds to the ith item in the records array.
         * @property {string} change.insertAfterId The id of the record that these new records were inserted after
         *   or null if inserted at the beginning.
         */

        /**
         * Sent when one or more records are moved.
         *
         * @event model#move
         * @property {string} changeType "move"
         * @property {object} change
         * @property {array} change.records The records that were moved.
         * @property {array} change.recordIds The ids of the records that were moved.
         *   The ith item in this array corresponds to the ith item in the records array.
         * @property {object} change.insertAfterId: The id of the record that these new records were inserted after
         *   or null if inserted at the beginning.
         */

        /**
         * Sent when record changes are reverted.
         *
         * @event model#revert
         * @property {string} changeType "revert"
         * @property {object} change
         * @property {array} change.records The records that were reverted.
         * @property {array} change.recordIds The ids of the records that were reverted.
         *   The ith item in this array corresponds to the ith item in the records array.
         * @property {object} change.newIds For records where the identity was changed and is now reverted this is a
         *   map from the previous (old) id to the new (reverted) id.
         */

        /**
         * Sent when metadata has changed. The record field values have not changed but the record or field
         * metadata has changed. Typically this is the result of validation errors. If external code changes
         * the metadata it must call {@link model#metadataChanged} (which sends this notification) to let other views
         * know about the change.
         *
         * @event model#metaChange
         * @property {string} changeType "metaChange"
         * @property {object} change
         * @property {object} change.record The record that changed.
         * @property {object} change.field The name of the field that changed or null if field metadata didn't change.
         */

        /**
         * Sent when the model instance changes. This happens when model.renameInstance is called, which
         * is generally the result of the value of the master column in a master model changing.
         *
         * @ignore
         * @event model#instanceRename
         * @property {string} changeType "instanceRename"
         * @property {object} change
         * @property {string} change.oldInstance xxx
         * @property {string} change.newInstance xxx
         */

        //
        // Configuration methods
        //

        /**
         * <p>Get the value of the given model option. The model options are provided in the call
         * to {@link apex.model.create}. See also {@link model#setOption}.</p>
         *
         * @param {string} pName Name of option to get.
         * @return {*} Option value.
         * @example <caption>This example gets the <code class="prettyprint">onlyMarkForDelete</code> option.</caption>
         * var markForDelete = model.getOption( "onlyMarkForDelete" );
         * @example <caption>This example gets the <code class="prettyprint">hasTotalRecords</code> option.</caption>
         * var hasTotalRecords = model.getOption( "hasTotalRecords" );
         */
        getOption: function( pName ) {
            var value = this._options[pName];

            if ( value === undefined ) {
                throw new Error( "No such option: " + pName);
            }
            return value;
        },

        /**
         * <p>Set the value of the given model option. The model options are provided in the call
         * to {@link apex.model.create}. See also {@link model#getOption}.</p>
         *
         * <p>The options that can be set are:</p>
         * <ul>
         *     <li>genIdPrefix</li>
         *     <li>pageItemsToSubmit</li>
         *     <li>fetchData</li>
         *     <li>saveData</li>
         *     <li>regionData</li>
         *     <li>parentRecordId</li>
         *     <li>editable</li>
         *     <li>pageSize</li>
         * </ul>
         *
         * @param {string} pName Name of option to set. Not all options can be set.
         * @param {*} pValue Value to set the option to.
         */
        setOption: function( pName, pValue ) {
            var settable = { genIdPrefix:1, pageItemsToSubmit:1, fetchData:1, saveData:1, regionData:1, parentRecordId:1, editable:1, pageSize:1};

            if ( settable[pName] ) {
                if ( pName === "editable" && !this._options.identityField ) {
                    throw new Error( "An editable model requires an identityField" );
                }
                this._options[pName] = pValue;
            } else {
                debug.warn( "Option cannot be set: " + pName);
            }
        },

        //
        // Internal methods
        //

        _callServer: function( requestData, requestOptions ) {
            var p;
            p = server.plugin( requestData, requestOptions );
            return p;
        },

        _drainWaiters: function( err ) {
            var i, waiter;

            for ( i = 0; i < this._waitingPages.length; i++ ) {
                waiter = this._waitingPages[i];

                // if have all the data or there is a record at the desired offset of the waiter then the waiters request should be able to be satisfied
                if ( this._haveAllData || this._data[waiter.offset] || err ) {
                    this._waitingPages.splice( i, 1 );
                    i -= 1; // stay in place because of removed waiter
                    if ( err && err.status !== 0 ) {
                        // reporting of errors is separate but caller is still expecting to be called back
                        callForEachCallback( waiter.thisArg, waiter.callback, null, -1, null );
                    } else {
                        waiter.next();
                    }
                    // In most cases data already fetched will completely satisfy any waiters but if for any reason
                    // a fetch is started must stop processing waiters to avoid an infinite loop
                    if ( this._requestsInProgress.fetch ) {
                        return;
                    }
                }
            }
        },

        // given an offset into _data return the corresponding server offset. Only used for table models
        _getServerOffset: function( offset ) {
            var id, iNode, record,
                i = offset - 1;

            // The offset into the server's result set can be different from the index into the model data array
            // because of aggregate records which the server doesn't count but this model does.
            record = this._data[i];
            while ( record ) {
                id = this._getIdentity( record, i );
                iNode = this.getRecordMetadata( id );
                if ( iNode && iNode.serverOffset >= 0 ) {
                    return iNode.serverOffset + 1;
                }
                i -= 1;
                record = this._data[i];
            }
            return offset;
        },

        _clear: function() {
            var o = this._options;

            // If there is a request in progress, the data is about to be cleared so it needs to be aborted
            // don't actually abort the request but the results need to be discarded
            if ( this._requestsInProgress.fetch ) {
                this._requestsInProgress.abortFetch = true;
            }
            if ( this._requestsInProgress.save ) {
                this._requestsInProgress.abortSave = true;
            }
            if ( o.shape === "table" ) {
                this._data = [];
                if ( o.hasTotalRecords ) {
                    this._totalRecords = 0;
                } else {
                    this._totalRecords = -1; // unknown
                }
                this._haveAllData = false;
                this._offset = 0;
                this._numInsertedRecords = 0;
                this._numDeletedRecords = 0;
                if ( this._masterRecordIsInserted ) {
                    this._haveAllData = true;
                }
                this.dataOverflow = false;
            } else {
                this._data = null;
            }
            this._changes = [];
            this._errors = [];
            this._index = {};
            this._selection = {};
            this._selectionCount = 0;
        },

        _saveDataState: function() {
            this._saveState = {
                _data: this._data,
                _totalRecords: this._totalRecords,
                _haveALlData: this._haveAllData,
                _offset: this._offset,
                _numInsertedRecords: this._numInsertedRecords,
                _numDeletedRecords: this._numDeletedRecords,
                dataOverflow: this.dataOverflow,
                _changes: this._changes,
                _errors: this._errors,
                _index: this._index,
                _selection: this._selection,
                _selectionCount: this._selectionCount
            };
        },

        _restoreDataState: function() {
            var state = this._saveState;

            this._data = state._data;
            this._totalRecords = state._totalRecords;
            this._haveALlData = state._haveAllData;
            this._offset = state._offset;
            this._numInsertedRecords = state._numInsertedRecords;
            this._numDeletedRecords = state._numDeletedRecords;
            this.dataOverflow = state.dataOverflow;
            this._changes = state._changes;
            this._errors = state._errors;
            this._index = state._index;
            this._selection = state._selection;
            this._selectionCount = state._selectionCount;

        },

        _clearChanges: function( changeArray ) {
            var i, iNode, id,
                deletedIds = [],
                changedIds = [],
                o = this._options,
                changes = this[changeArray];

            // for each changed clear change flags
            for ( i = 0; i < changes.length; i++ ) {
                iNode = changes[i];
                id = this._getIdentity( iNode.record );
                if ( iNode.deleted && o.onlyMarkForDelete ) {
                    // actually have to remove the record at this point
                    this._removeRecord( id, iNode );
                }
                if ( iNode.deleted ) {
                    deletedIds.push( id );
                } else if ( iNode.inserted || iNode.updated ) {
                    changedIds.push( id );
                }
                delete iNode.deleted; // just in case
                delete iNode.recordId; // just in case
                delete iNode.inserted;
                delete iNode.autoInserted;
                delete iNode.updated;
                delete iNode.original;
            }
            // send notification because metadata for cleared records has changed
            this[changeArray] = [];
            notifyChange( this, "clearChanges", {
                deletedIds: deletedIds,
                changedIds: changedIds
            } );
        },

        // when shape is tree offset is parent node or falsey for root and srvRecOffset is not used
        // total and moreData are just for table models
        _addData: function( offset, srvRecOffset, data, total, moreData, dataOverflow ) {
            var i, dst, rec, id, index, meta, parentNode, curOffset, sOff, change, replaced,
                o = this._options,
                self = this;

            function setIndex(id, offset, rec) {
                var meta = { record: rec };

                // if the record has metadata copy it
                if (self._metaKey) {
                    extend(meta, rec[self._metaKey]);
                    meta.sel = meta.sel === "Y"; // convert Y/N used by server to true/false
                    if ( meta.agg && (!id || (self._identityKeys && !rec[self._identityKeys[0]] ) ) ) {
                        self._assignTempIdentity( rec );
                        id = self._getIdentity( rec );
                    }
                    // convert what APEX server sends in metadata to what the model access checking requires
                    if ( meta.allowedOperations ) {
                        meta.canEdit = !!meta.allowedOperations.update;
                        meta.canDelete =  !!meta.allowedOperations["delete"];
                    }
                }
                if ( offset !== undefined && offset !== null ) {
                    meta.serverOffset = offset;
                }
                self._index[id] = meta;
                if ( meta.sel ) {
                    self._selected[id] = meta;
                }
            }

            if ( o.shape === "table" ) {
                // when paginationType is none or when starting at the beginning (and there are no changes) clear the model first
                if ( ( offset === 0 && !this.isChanged() ) || o.paginationType === "none" ) {
                    this._clear();
                }
                if ( o.paginationType === "one" ) {
                    this._offset = offset;
                }

                // total records is just advisory. The actual number of elements in _data can be different even when have all data
                this._totalRecords = -1; // unknown
                if ( total !== undefined && total !== null ) {
                    this._totalRecords = total;
                } else if ( o.hasTotalRecords ) {
                    debug.warn( "Model missing total records" );
                }
                if ( !this._haveAllData && !moreData ) {
                    // only set this once when reach the end. Only way to clear this is to clearData
                    this._haveAllData = true; // can never be true when pagination type is one
                }
                if ( dataOverflow ) {
                    this.dataOverflow = true;
                }

            } else if ( o.shape === "record" ) {
                this._clear();
            }

            if ( o.shape === "tree" && offset ) {
                parentNode = offset;

                parentNode[this._childrenKey] = data;
                if ( o.identityField ) {
                    // for tree models add parent reference to each node metadata
                    self.walkTree( parentNode, {
                        node: function( n, p ) {
                            var id;
                            if ( p ) {
                                id = self._getIdentity( n );
                                setIndex( id, null, n );
                                self.getRecordMetadata( id ).parent = p;
                            }
                        }
                    }, null );
                }
                notifyChange( this, "addData", {
                    parentNode: parentNode,
                    offset: 0,
                    count: data.length
                });
            } else if ( this._data === null || this._data.length === 0 || o.shape !== "table" || o.paginationType === "one" ) {
                debug.trace( "Model: " + this.modelId() + ". add data set: ", offset, total, moreData);
                this._data = data;
                this._numInsertedRecords = 0;
                this._numDeletedRecords = 0;
                // even if there is no identity still create an index to store metadata if any
                if ( o.shape !== "record" ) {
                    change = {
                        offset: 0,
                        count: data.length
                    };
                    // this handles trees starting at the root and tables starting at the beginning
                    curOffset = srvRecOffset;
                    this.forEach(function( rec, index, id ) {
                        // todo THINK can tree models have aggregate records?
                        if (self._metaKey && rec[self._metaKey].agg ) {
                            sOff = null;
                        } else {
                            sOff = curOffset;
                            curOffset += 1;
                        }
                        setIndex( id, sOff, rec );
                    });
                    if ( o.shape === "tree" && this.root() && o.identityField ) {
                        // for tree models add parent reference to each node metadata
                        this.walkTree( this.root(), {
                            node: function( n, p ) {
                                self.getRecordMetadata( self._getIdentity( n ) ).parent = p;
                            }
                        }, null );
                        change.parentNode = null;
                        change.count = 1;
                    }
                } else if ( o.identityField && this._data ) {
                    change = {
                        offset: 0,
                        count: 1
                    };
                    setIndex( this._getIdentity( this._data ), null, this._data );
                } else {
                    // a record shape with either no identity field or null record
                    change = {
                        offset: 0,
                        count: this._data ? 1 : 0
                    };
                }
                notifyChange( this, "addData", change );
            } else {
                // need to merge data in to existing data
                debug.trace( "Model: " + this.modelId() + ". add data merge: ", offset, total, moreData );
                dst = offset;
                curOffset = srvRecOffset;
                replaced = [];
                for ( i = 0; i < data.length; i++ ) {
                    rec = data[i];
                    id = this._getIdentity( rec, dst );

                    if (this._metaKey && rec[this._metaKey].agg ) {
                        sOff = null;
                    } else {
                        sOff = curOffset;
                        curOffset += 1;
                    }

                    meta = this.getRecordMetadata( id );
                    // meta is only found if there is a duplicate ID which means that the same record was fetched
                    // if the model already contains this record and it hasn't been changed then update it in place
                    if ( meta ) {
                        // if it has changed then must just drop it
                        if ( meta.updated || meta.inserted || meta.deleted ) {
                            continue;
                        }
                        // update: replace the existing record with the new one from the server
                        index = this._data.indexOf( meta.record );
                        this._data[index] = rec;
                        meta.record = rec;
                        meta.serverOffset = sOff; // should not be null
                        // if there is metadata merge it in again
                        if ( this._metaKey ) {
                            // todo THINK no easy way to clean out prev metadata, perhaps delete fields?
                            extend(meta, rec[this._metaKey]);
                        }
                        replaced.push( id );
                    } else {
                        // add to model
                        if ( this._data[dst] ) {
                            // Because of aggregate records returned by the server and records can be fetched in any order
                            // it is possible that there is already a different record where this one needs to go which
                            // is why it needs to be inserted before dst
                            this._data.splice( dst, 0, rec );
                        } else {
                            this._data[dst] = rec;
                        }
                        dst += 1;
                        // add index
                        setIndex( id, sOff, rec );
                    }
                }
                change = {
                    offset: offset,
                    count: dst - offset
                };
                if ( replaced.length ) {
                    change.replacedIds = replaced;
                }
                notifyChange( this, "addData", change );
            }
        },

        _updateData: function( data, altMetaKey ) {
            var i, rec, id, prevId, iNode, meta,
                updatedRecs = [],
                updatedIds = [],
                deleted = [],
                deletedIds = [],
                newIds = {}, // map from old ids to new ids
                metaKey = altMetaKey || this._metaKey;

            for ( i = 0; i < data.length; i++ ) {
                rec = data[i];
                meta = rec[metaKey];
                prevId = meta ? meta.recordId : null;
                // When saving or refreshing records it is possible that some of them are no longer found on the server
                if ( meta && prevId && meta.notFound ) {
                    iNode = this.getRecordMetadata( prevId );
                    this._removeRecord( prevId, iNode );
                    deleted.push( iNode.record );
                    deletedIds.push( prevId );
                    continue;
                } // else
                id = this._getIdentity( rec );
                if ( prevId === id ) { // prevId is all about checking if there was a change in id
                    prevId = null;
                }
                iNode = this.getRecordMetadata( prevId ? prevId : id );

                // if the model contains this record update it
                if ( iNode ) {
                    if ( prevId ) {
                        newIds[prevId] = id;
                        // update the index
                        this._index[id] = iNode;
                        delete this._index[prevId];
                        delete this._selection[prevId];
                        this._selectionCount -= 1;
                    }
                    updatedRecs.push( rec );
                    updatedIds.push( prevId || id );
                    this._data[this._data.indexOf( iNode.record )] = rec;
                    iNode.record = rec;
                    // need to update record metadata again
                    if ( metaKey && meta ) {
                        extend(true, iNode, meta);
                        delete iNode.recordId;
                    } else if ( altMetaKey ) {
                        if ( this._options.recordIsArray ) {
                            rec.splice(altMetaKey, 1);
                        } else {
                            delete rec[altMetaKey];
                        }
                    }
                    // updating the record value also clears some metadata
                    delete iNode.deleted; // just in case
                    delete iNode.inserted; // just in case
                    delete iNode.autoInserted;
                    delete iNode.updated;
                    delete iNode.original;
                    clearRecordChanges( iNode );
                    this._removeError( iNode );
                    this._removeChange( iNode );
                }
                // otherwise do nothing
            }

            if ( updatedRecs.length > 0 ) {
                notifyChange(this, "refreshRecords", {
                    records: updatedRecs,
                    recordIds: updatedIds,
                    newIds: newIds
                });
            }
            if ( deleted.length > 0 ) {
                notifyChange( this, "delete", {
                    records: deleted,
                    recordIds: deletedIds
                } );
            }
        },

        /*
         * Initialize and return a new record either completely new or using newRecord as a starting point
         * or as a copy of srcRecord and with an optional parentRecord
         * only one of newRecord or srcRecord should be set
         */
        _initRecord: function( newRecord, srcRecord, parentRecord ) {
            var i, prop, key, srcChildren, dstChildren, dstRecord, masterModel, masterRecord,
                o = this._options;

            // Use pNewRecord or create new one
            if ( newRecord ) {
                dstRecord = newRecord;
            } else {
                dstRecord = o.recordIsArray ? [] : {};

                // create the new record with defaults or as copy
                for ( i in o.fields ) {
                    if ( o.fields.hasOwnProperty( i ) ) {
                        prop = o.fields[i];
                        key = o.recordIsArray ? prop.index : i;
                        if ( !prop.virtual ) {
                            if ( !srcRecord || prop.noCopy ) {
                                if ( prop.parentField && o.parentModel ) {
                                    if ( !masterModel ) {
                                        masterModel = model.get( o.parentModel );
                                        if ( masterModel && !masterRecord && o.parentRecordId ) {
                                            masterRecord = masterModel.getRecord( o.parentRecordId );
                                        }
                                    }
                                    if ( masterRecord ) {
                                        dstRecord[key] = masterModel.getValue( masterRecord, prop.parentField );
                                        continue;
                                    } // else fall through to use default value or empty string
                                }
                                dstRecord[key] = prop.defaultValue !== undefined ? prop.defaultValue : "";
                            } else {
                                dstRecord[key] = srcRecord[key];
                            }
                        }
                    }
                }
            }

            if ( masterModel ) {
                model.release( o.parentModel );
            }

            // set a temporary primary key - there should be one
            if ( this._identityKeys ) {
                this._assignTempIdentity( dstRecord );
            }
            // initialize metadata field if any
            if ( this._metaKey ) {
                dstRecord[this._metaKey] = {};
            }
            // the sequence field can't be set until the new record is inserted

            if ( o.shape === "tree" ) {
                if ( this._parentIdKey ) {
                    dstRecord[this._parentIdKey] = this._getIdentity( parentRecord );
                }
                // a tree must have a children field todo tree not all nodes have children
                dstChildren = [];
                dstRecord[this._childrenKey] = dstChildren;
                if ( srcRecord ) {
                    srcChildren = srcRecord[this._childrenKey];
                    if ( srcChildren ) {
                        for ( i = 0; i < srcChildren.length; i++ ) {
                            dstChildren.push( this._initRecord( null, srcChildren[i], dstRecord ) );
                        }
                    }
                }
            }
            return dstRecord;
        },

        _assignTempIdentity: function( rec ) {
            var i;
            for ( i = 0; i < this._identityKeys.length; i++ ) {
                rec[this._identityKeys[i]] = this._options.genIdPrefix + this._nextInsertId;
                this._nextInsertId += 1;
            }
        },

        _getIdentity: function( rec, index) {
            var i, id = null;
            if ( this._identityKeys !== undefined ) {
                if ( this._identityKeys.length === 1 ) {
                    id = rec[this._identityKeys[0]] + "";
                } else {
                    id = [];
                    for ( i = 0; i < this._identityKeys.length; i++ ) {
                        id.push( rec[this._identityKeys[i]] + "" );
                    }
                }
            } else if ( index !== null && index !== undefined ) {
                id = index + "";
            }
            if ( id !== null ) {
                return makeIdentityIndex( id );
            }
            return id;
        },

        // this is different from _getIdentity because it returns a form that is useful for the server
        _getPrimaryKey: function( rec ) {
            var i, key;

            if ( this._identityKeys !== undefined ) {
                key = [];
                for ( i = 0; i < this._identityKeys.length; i++ ) {
                    key.push( rec[this._identityKeys[i]] + "" );
                }
            }
            return key;
        },

        _getType: function( rec ) {
            var t = "default",
                o = this._options;

            if ( rec && this._typeKey !== undefined ) {
                t = rec[this._typeKey];
                if ( t !== null && typeof t === "object" && t.hasOwnProperty("v") ) {
                    t = t.v;
                }
                if ( !t ) {
                    t = "default";
                }
            }
            return o.types[t] || o.types["default"];
        },

        _getRecordById: function( id ) {
            var iNode = this._index[makeIdentityIndex( id )];
            return iNode ? iNode.record : null;
        },

        _removeRecord: function( id, iNode ) {
            var a, ident,
                o = this._options;

            if ( o.shape === "table" ) {
                a = this._data;
            } else if ( o.shape === "tree" ) {
                a = iNode.parent[this._childrenKey];
                delete iNode.parent;
            }
            // remove from collection
            a.splice( a.indexOf( iNode.record ), 1 );
            // remove from index
            ident = makeIdentityIndex( id );
            delete this._index[ident];
            if ( iNode.sel ) {
                delete this._selection[ident];
                this._selectionCount -= 1;
            }
        },

        _addChange: function( iNode ) {
            var index = this._changes.indexOf( iNode );
            // if already present remove from where it is
            if ( index >= 0 ) {
                this._changes.splice( index, 1 );
            }
            this._changes.push( iNode );
        },

        _removeChange: function( iNode ) {
            var index = this._changes.indexOf( iNode );
            if ( index >= 0 && !iNode.deleted && !iNode.updated && !iNode.inserted ) {
                this._changes.splice( index, 1 );
            }
        },

        _removeError: function( iNode ) {
            var index = this._errors.indexOf( iNode );
            if ( index >= 0 ) {
                this._errors.splice( index, 1 );
            }
        },

        _addParentItems: function ( request ) {
            var i, prop, masterModel, masterRecord, item, masterMeta,
                parentItems = {values:[]},
                o = this._options;

            if ( o.parentModel ) {
                for ( i in o.fields ) {
                    if ( o.fields.hasOwnProperty( i ) ) {
                        prop = o.fields[i];
                        if ( !prop.virtual && prop.parentField ) {
                            if ( !masterModel ) {
                                masterModel = model.get( o.parentModel );
                                if ( masterModel && !masterRecord ) {
                                    masterRecord = masterModel.getRecord( o.parentRecordId );
                                    masterMeta = masterModel.getRecordMetadata( o.parentRecordId );
                                }
                            }
                            if ( masterRecord ) {
                                item = {
                                    n: prop.parentField,
                                    v: masterModel.getValue( masterRecord, prop.parentField )
                                };
//                                if ( masterMeta ) {
                                    // xxx ck
//                                }
                                parentItems.values.push( item );
                            }
                        }
                    }
                }
                if ( masterMeta ) {
                    if ( masterMeta.salt ) {
                        parentItems.salt = masterMeta.salt;
                    }
                    if ( masterMeta["protected"] ) {
                        parentItems["protected"] = masterMeta["protected"];
                    }
                }
                if ( masterModel ) {
                    model.release( o.parentModel );
                }
                request.parentRecordId = o.parentRecordId;
                if ( parentItems.values.length > 0 ) {
                    request.parentItems = parentItems;
                }
            }
        }
    };

    var defaultOptions = {
            shape: "table",
            recordIsArray: false,
            hasTotalRecords: false,
            genIdPrefix: "t",
            regionId: null,
            ajaxIdentifier: null,
            pageItemsToSubmit: null,
            regionData: {},
            fetchData: {},
            saveData: {},
            version: 1,
            parentModel: null,
            parentRecordId: null,
            editable: false,
            onlyMarkForDelete: true,
            identityField: null,
            typeField: null,
            childrenField: null,
            parentIdentityField: null,
            sequenceField: null,
            metaField: null,
            sequenceStep: 10,
            saveSelection: false,
            types: {
                "default" : {
                    validChildren: true, // any children are allowed
                    operations: {
                        canAdd: true,
                        canEdit: true,
                        canDelete: true,
                        canDrag: true,
                        drag: {
                            normal: "move",
                            ctrl: "copy"
                        },
                        externalDrag: {
                            normal: "add"
                        }
                    }
                }
            },
            check: null,
            sortCompare: null,
            paginationType: "none",
            pageSize: 100,
            preFetch: false
        },
        validShapes = {"table": 1, "tree": 1, "record": 1},
        validPaginationTypes = {"none": 1, "one": 1, "progressive": 1};


    // todo cleanup this doc
    // Types (from treeview widget)
    // {
    //     "<type name or 'default'>": {
    //         icon:        <icon name or null>,
    //         classes:     <class name(s)>,
    //         isDisabled:  <true/false/function>,
    //         defaultLabel: <text>,
    //         validChildren: [ "type", ... ] | true, // true allows any children, or an array of valid type names
    //         operations: {
    //             canAdd:    <true/false/function>, // Note: node must also have a children array to be able to add
    //             canDelete: <true/false/function>, // Note: can't delete root node
    //             canRename: <true/false/function>,
    //             canDrag:   <true/false/function>
    //                                               // The above functions are called in the context of the adapter with arguments:
    //                                               //   node, operation, children. The last two only apply for canAdd. The function
    //                                               // must return true or false.
    //             drag: {
    //                 normal: <op>,
    //                 ctrl: <op>,
    //                 alt: <op>,
    //                 shift: <op>
    //            }, // <op> is a built in action "move", "copy", or "add" or a custom operation that can be handled in the beforeStop event
    //            externalDrag: <same object as drag> // only applies to the default type
    //         }
    //     },

    /**
     * @typedef {(string|array)} model.ModelId
     * @desc
     * <p>A model is uniquely identified by a string name and optional string instance id. The instance id is used to
     * support multiple detail models in a master detail arrangement. The instance id is the identity value of the
     * record in the master model for which the detail model pertains. The form for a model id is "name" or a
     * tuple array ["name","instance"]</p>
     * @example <caption>A model with no instance.</caption>
     * "MyModel"
     * @example <caption>A detail model with instance id "000109".</caption>
     * ["MyDetailModel", "000109"]
     */

    /**
     * @typedef {(array|object)} model.Record
     * @desc
     * A model record is either an array or an object depending on the model option <code class="prettyprint">recordIsArray</code>.
     */

    /**
     * @typedef {(array|object)} model.Node
     * @desc
     * A model node is a synonym for {@link model.Record} that is more naturally used when the model has a tree shape.
     */

    /**
     * @typedef {object} model.FieldMeta
     * @desc
     * The field metadata describes the field and affects how the model uses the field. It may contain additional
     * properties especially if the metadata is shared with view layers.

     * @property {string} index Only used when records are arrays. This is the index into the array where the field
     *   value is stored.
     * @property {*} defaultValue This value is used when a new record is added or an existing record is duplicated and noCopy is true.
     *   The defaultValue has no effect for the identity, meta, children, and parent fields if defined.
     *   If there is no defaultValue empty string is used.
     * @property {string} parentField Only applies if the model has a parentModel. When a new record is added or an existing record is
     *   duplicated and noCopy is true the value of this field is taken from the parentField of the parentModel
     *   This is useful for foreign key fields but can be any field that gets a default from the parentModel.
     * @property {boolean} noCopy If true the field value is not copied when a record is copied/duplicated.
     * @property {boolean} readonly If true the field cannot be edited.
     * @property {boolean} volatile The field is generated by the server. It cannot be edited. It is not sent back to the server. This means
     *   that for records stored as arrays the volatile fields should be at the end or the server must account
     *   for the missing volatile fields when using other field's index. Volatile fields may depend on (are calculated
     *   from) other fields and the value may be considered stale if the record is edited. It is up to the view
     *   layers to make this determination.
     * @property {boolean} virtual A virtual field has no associated data. None of the other properties apply. The main purpose for
     *   including a virtual field is so that view layers and the model can share the same field metadata.
     *   This allows view layers to have fields that don't have corresponding data in the model.
     */

    /**
     * <p>A callback function to do additional access checking. See the <code class="prettyprint">check</code>
     * option property of {@link apex.model.create} and the {@link model#check} method.</p>
     *
     * @callback model.CheckCallback
     * @param {boolean} pResult The result of the access checking so far.
     * @param {string} pOperation One of the default checks ("canEdit", "canDelete", "canAdd", "canDrag") or a custom
     *   operation.
     * @param {model.Record} pRecord The record to check if action is allowed on it.
     * @param {(string)=} pAddAction Only used by allowAdd see {@link model#allowAdd} for details.
     * @param {(model.Record[])=} pRecordsToAdd Only used by allowAdd see {@link model#allowAdd} for details.
     * @return {boolean} true if the operation is allowed.
     */

    /**
     * <p>Create a model with the given identity, options and optionally initial data.
     * When you are done with the model you must call {@link apex.model.release}. Or if you are sure no one else is using it
     * you can call {@link apex.model.destroy}.</p>
     *
     * @function create
     * @memberof apex.model
     * @param {model.ModelId} pModelId Model identifier. Must be unique for the page. Creating a model with an identifier
     *   that already exists will overwrite the existing model.
     * @param {object} pOptions Model options. All properties are optional unless specified otherwise.
     * @param {string} pOptions.shape The shape of data the model holds. One of "table", "tree", or "record". The default is "table".
     * @param {boolean} pOptions.recordIsArray If true record fields are stored in an array otherwise the record is an object.
     *   If recordIsArray is true then the field metadata must include the <code class="prettyprint">index</code> property. The default is false.
     * @param {boolean} pOptions.hasTotalRecords Only applies if <code class="prettyprint">shape</code> is "table".
     *   If true the sever will always provide the total
     *   number of records. The default is false unless paginationType is "none".
     * @param {string} pOptions.genIdPrefix A string prefix to use when generating ids for inserted records. The default is "t".
     * @param {Object.<string, model.FieldMeta>} pOptions.fields This required option defines the fields of each record.
     *   Each property is the name of a field. The value is a {@link model.FieldMeta} object with metadata about the field that
     *   the model uses.
     * @param {string} pOptions.regionId Primary region ID that this model is associated with for the purpose of exchanging
     *   data with the APEX server. If there is no regionId then the model cannot use standard requests to fetch or save
     *   data and therefore is just a local model. The default is null.
     * @param {string} pOptions.ajaxIdentifier The Ajax Identifier used to identify the Ajax call to fetch or save data.
     *   The default is null.
     * @param {string[]} pOptions.pageItemsToSubmit: An array of page item names to submit when fetching and saving data.
     *   The default is null.
     * @param {object} pOptions.regionData Additional data to send at the region level for all requests. The default is an empty object.
     * @param {object} pOptions.fetchData Additional data to send in fetch requests. The default is an empty object.
     * @param {object} pOptions.saveData Additional data to send in save requests. The default is an empty object.
     * @param {(number|string)} pOptions.version This is the version (could be a hash) of the model definition. The value
     *   is opaque to the model. It is sent in all requests; fetch, save etc. If the server detects that the version is
     *   different than it expects then it returns an error. This is to ensure that the client and server agree on the
     *   general model and field definitions. The default is 1. This option currently has no effect and is reserved
     *   for future use.
     * @param {model.ModelId} pOptions.parentModel Model identifier of parent (master) model or null if there is no parent.
     *   The default is null.
     * @param {string} pOptions.parentRecordId Only applies if parentModel is given. The record id of the record in the
     *   parent model that this model is associated with. Typically this model's ModelId instance and the parentRecordId
     *   are the same. The default is null.
     * @param {boolean} pOptions.editable If true the model is editable and false otherwise. The default is false.
     * @param {boolean} pOptions.onlyMarkForDelete If false deleted records are removed from the collection.
     *   If true then deleted records are marked as deleted but remain in the collection. The default is true.
     * @param {(string|string[])} pOptions.identityField Name of identity field or an array of identity field names if the
     *   records have a multi valued primary key. Required if editable is true. It is a best practice to specify the
     *   identityField even if the model is not editable as it can be useful for pagination, selection, and fetching
     *   additional data. The default is null.
     * @param {string} pOptions.childrenField This only applies for tree shape models. The name of the field that
     *   contains an array of node children. The default is null.
     * @param {string} pOptions.parentIdentityField This only applies for tree shape models. The name of parent node
     *   identity field. The default is null.
     * @param {string} pOptions.metaField The name of meta field. The meta field stores metadata about the record and
     *   possibly record fields The default is null.
     * @param {model.CheckCallback} pOptions.check A function that is called to do additional permission checking.
     * @param {string} pOptions.paginationType One of "none", "one", "progressive".
     * <ul>
     * <li>none: No paging. The server has given all the data it has (it may be capped but you can't get more)</li>
     * <li>one: The model contains just one page at a time. When it asks the server for a new page it
     *  replaces the previous one.</li>
     * <li>progressive: The model will keep adding to its collection as it gets additional pages from
     *   the server</li>
     * </ul>
     * <p>This only applies to table shape models. The default is "none".</p>
     * @param {integer} pOptions.pageSize This is the number of table rows (records) to fetch from the server.
     *   This only applies to table shape models. The default is 100.
     *
     * @param {(array|object)} [pData] Initial data to add to the model. For table shape data it is an array of
     *   {@link model.Record}. For tree shape models it is a {@link model.Node} for the root. For record shape data it
     *   is a single {@link model.Record}. If null or not given there is no initial data.
     * @param {integer} [pTotal] Total number of records in the servers collection. Only applies for table shape models.
     * @param {boolean} [pMoreData] If true there is more data available on the server for this model. If false
     *   <code class="prettyprint">pData</code> contains all the data. If omitted or null determine if there is more
     *   data based on <code class="prettyprint">pData</code> and <code class="prettyprint">pTotal</code>.
     *   If <code class="prettyprint">pTotal</code> is not given assume there is more data on server.
     *   Only applies for table shape models and only if <code class="prettyprint">paginationType</code> is not "none".
     * @param {boolean} [pDataOverflow] If true there is more than the maximum allowed records for this model.
     *   Only applies for table shape models.
     * @return {model}
     * @example <caption>This example creates a very simple local table shape model called "people" that stores name and age.
     * The records are arrays and the model is given some initial data. The model is editable and the ID field
     * is the record identity.</caption>
     * var fields = {
     *         ID: {
     *             index: 0
     *         },
     *         NAME: {
     *             index: 1
     *         },
     *         AGE: {
     *             index: 2
     *         }
     *     },
     *     data = [
     *         ["00010", "Mark", "32"],
     *         ["00091", "Mary", "27"],
     *         ...
     *     ];
     * apex.model.create("people", {
     *     shape: "table",
     *     recordIsArray: true,
     *     fields: fields,
     *     identityField: "ID",
     *     editable: true,
     *     paginationType: "none"
     * }, data, data.length );
     */
    /* TODO
     *
     * @param {boolean} pOptions.saveSelection If true all selected records will be saved as well as any changed records.
     *   The selection state metadata property "sel": true will be included on any selected record. The default is false.
     *   It is up to the view layer to call the {@link model#setSelectionState} method to actually save the selection
     *   in the model.
     * @param {string} pOptions.sequenceField This only applies to models that support reordering.
     *   The name of the sequence field. The sequence field value should be a floating point number (or string representation of a number).
     *   This value will be updated when adding, copying, or moving records. The default is null. TODO finish implementing
     * @param {number} pOptions.sequenceStep Only used if sequenceField is given. This is the preferred distance between sequence values
     *  of adjacent records. The default is 10.
     * @param {string} pOptions.typeField Name of type field. The type field associates a record with type information
     *   provided in the type option. The default is null. See the <code class="prettyprint">types</code> option for more information.
     * @param {function} pOptions.sortCompare A function to compare two records for the purpose of ordering.
     *   The function signature is the same as the array sort method argument. This should not be used when the server
     *   does the sorting. This is most useful for tree shape models so that newly added records/nodes are
     *   put in the right order. TODO
     * @param {boolean} pOptions.preFetch If true additional data will start to be fetched before all of the existing data
     *   has been read by forEachInPage. The default is false. todo not yet implemented
     * @param {integer} pOptions.types todo
     */
    model.create = function( pModelId, pOptions, pData, pTotal, pMoreData, pDataOverflow ) {
        var i, o, fields, myFields, field, pfMap, pField, value, moreData, m, masterRecordMeta, masterModel,
            mId = makeModelId( pModelId ),
            that = Object.create( modelPrototype );

        that.name = mId[0];
        that.instance = mId[1];
        that._requestsInProgress = {};
        that._listeners = [];
        that._waitingPages = [];
        fields = pOptions.fields;
        that._options = extend( true, {}, defaultOptions, pOptions );
        that._options.fields = fields; // it is important that fields map is not copied
        // todo consider using an array wrapper around fields like the grid widget does
        // todo consider if types should also not be copied; trouble is in the merging of defaults
        o = that._options;

        if ( !o.fields ) {
            throw new Error( "The fields option is required" );
        }
        if ( !validShapes[o.shape] ) {
            throw new Error( "Invalid shape option: " + o.shape );
        }
        if ( !validPaginationTypes[o.paginationType] ) {
            throw new Error( "Invalid paginationType option: " + o.paginationType );
        }

        if ( o.editable && !o.identityField ) {
            throw new Error( "An editable model requires an identityField" );
        }

        if ( o.shape === "tree" && !o.childrenField ) {
            throw new Error( "A tree shaped model requires a childrenField" );
        }

        if ( o.shape === "table" && o.paginationType === "none" && pOptions.hasTotalRecords === undefined ) {
            o.hasTotalRecords = true;
        }

        // this is used for inserted records (for an editable model) but also for aggregate records
        that._nextInsertId = 1000;

        if ( o.identityField ) {
            if ( isArray( o.identityField ) ) {
                that._identityKeys = [];
                for (i = 0; i < o.identityField.length; i++) {
                    that._identityKeys.push( that.getFieldKey( o.identityField[i] ) );
                }
            } else {
                that._identityKeys = [that.getFieldKey( o.identityField )];
            }
        }
        if ( o.typeField ) {
            that._typeKey = that.getFieldKey( o.typeField );
            if ( that._typeKey === undefined ) {
                throw new Error( "Type field not found: " + o.typeField );
            }
        }
        if ( o.childrenField ) {
            that._childrenKey = that.getFieldKey( o.childrenField );
            if ( that._childrenKey === undefined ) {
                throw new Error( "Children field not found: " + o.childrenField );
            }
        }
        if ( o.parentIdentityField ) {
            // todo consider supporting multiple keys in the future
            that._parentIdKey = that.getFieldKey( o.parentIdentityField );
            if ( that._parentIdKey === undefined ) {
                throw new Error( "Parent identity field not found: " + o.parentIdentityField );
            }
        }
        if ( o.sequenceField ) {
            that._sequenceKey = that.getFieldKey( o.sequenceField );
            if ( that._sequenceKey === undefined ) {
                throw new Error( "Sequence field not found: " + o.sequenceField );
            }
        }
        if ( o.metaField ) {
            that._metaKey = that.getFieldKey( o.metaField );
            if ( that._metaKey === undefined ) {
                throw new Error( "Meta field not found: " + o.metaField );
            }
        }

        if ( o.shape !== "record" ) {
            if ( o.identityField ) {
                that.getRecord = that._getRecordById;
            } else {
                that.getRecord = that.recordAt;
            }
        } else {
            that.getRecord = function() {
                return that._data;
            };
        }

        that._clear();
        if ( pData ) {
            if ( o.paginationType === "none" ) {
                // when no pagination then must have all data
                moreData = false;
            } else {
                // if given more data flag use it otherwise guess based on pTotal
                if ( pMoreData !== undefined && pMoreData !== null) {
                    moreData = pMoreData;
                } else {
                    // if given data and a total use that to figure out if there is more data
                    // otherwise assume there is more
                    moreData = pTotal !== undefined && pTotal !== null ? pData.length < pTotal : true;
                }
            }
            that._addData( 0, 0, pData, pTotal, moreData, pDataOverflow );
        } else if ( pTotal !== null && pTotal !== undefined ) {
            that._totalRecords = pTotal;
        }

        // if there is no data given and there is a parent model and the parent record is inserted then there
        // can't possibly be any data for this model so create an empty model
        if ( o.parentModel && o.parentRecordId && !pData ) {
            masterModel = model.get( o.parentModel );
            if ( masterModel ) {
                masterRecordMeta = masterModel.getRecordMetadata( o.parentRecordId );
                if ( masterRecordMeta.inserted ) {
                    that._masterRecordIsInserted = true; // will be cleared after the master record has been saved
                    that._clear(); // data is already empty but this will make sure _haveAllData is true
                }
                if ( masterRecordMeta.deleted ) {
                    that._saveDataState();
                    that._masterRecordIsDeleted = true;
                    // force clear. it will be OK because changes were saved in _saveDataState
                    that._clear();
                    that._addData( 0, 0, [], 0, false, false );
                }

                pfMap = that._parentFieldsMap = {};
                for ( i in o.fields ) {
                    if ( o.fields.hasOwnProperty( i ) ) {
                        field = o.fields[i];
                        if ( field.parentField ) {
                            if ( !pfMap[field.parentField] ) {
                                pfMap[field.parentField] = [];
                            }
                            pfMap[field.parentField].push( i );
                        }
                    }
                }

                // Add a listener on the parent model
                that.parentModelViewId = masterModel.subscribe( {
                    onChange: function( type, change ) {
                        var i, ids;

                        if ( type === "delete" || type === "revert" || type === "refreshRecords" || type === "clearChanges" ) {
                            ids = change.recordIds || change.deletedIds;
                            for ( i = 0; i < ids.length; i++ ) {

                                if ( ids[i] === o.parentRecordId ) {
                                    // if master record is deleted then all the records in this model are deleted but allow them to be restored including changes
                                    if ( type === "delete" ) {
                                        that._saveDataState();
                                        that._masterRecordIsDeleted = true;
                                        // force clear. it will be OK because changes were saved in _saveDataState
                                        that._clear();
                                        that._addData( 0, 0, [], 0, false, false );
                                        notifyChange( that, "refresh", {} );
                                    } else if ( ( type === "revert" || type === "refreshRecords" ) && that._masterRecordIsDeleted ) {
                                        delete that._masterRecordIsDeleted;
                                        that._restoreDataState();
                                        notifyChange( that, "refresh", {} );
                                    } else if ( type === "refreshRecords" && change.newIds && change.newIds[that.instance] ) {
                                        // todo need to rename this instance
                                        // model.renameInstance( that.modelId(), change.newIds[that.instance] );
                                    } else if ( type === "clearChanges" && that._masterRecordIsDeleted ) {
                                        // in this case the model will never be used again someone should clean the model out
                                        // but at least get rid of the saved state
                                        delete that._saveState;
                                    }
                                    break;
                                }
                            }
                            if ( type === "clearChanges" && that._masterRecordIsInserted ) {
                                delete that._masterRecordIsInserted;
                            }
                        } else if ( type === "set" && ( change.oldIdentity || change.recordId ) === o.parentRecordId ) {
                            // if any master record copied fields are modified then must re-copy the values if not edited (matches old value of parent change)
                            pField = change.field;
                            if ( pField in pfMap ) {
                                myFields = pfMap[pField];
                                value = masterModel.getValue( change.record, pField );
                                that.forEach(function( rec ) {
                                    var i, f;
                                    // don't process aggregates here
                                    if ( that._metaKey && rec[that._metaKey].agg ) {
                                        return;
                                    }
                                    for ( i = 0; i < myFields.length; i++ ) {
                                        f = myFields[i];
                                        if ( change.oldValue === that.getValue( rec, f ) ) {
                                            // The field can be readonly but cell must otherwise be writeable
                                            that.setValue( rec, f, value );
                                        }
                                    }
                                });
                            }
                            if ( change.oldIdentity ) {
                                o.parentRecordId = change.recordId;
                                model.renameInstance( that.modelId(), change.recordId );
                            }
                        } else if ( type === "refresh" && that._masterRecordIsDeleted ) {
                            delete that._masterRecordIsDeleted;
                            that._restoreDataState();
                            notifyChange( that, "refresh", {} );
                        }
                    }
                } );

                model.release( o.parentModel );
            }
        }

        // check to see if there are too many unused, unchanged models laying around
        if ( gModelsLRU.length >= gMaxCachedModels ) {
            m = getModelLRU();
            if ( m ) {
                debug.info( "Model: cache overflow; remove model from cache: " + m.modelId() );
                model.destroy( makeModelId( m.modelId() ) ); // Be specific; never remove all instances (bug 28298408)
            }
        }

        // add that model
        m = gModels[mId[0]];
        if ( !m ) {
            m = {
                instances: {},
                instancesRef: {}
            };
            gModels[mId[0]] = m;
        }
        if ( mId[1] ) {
            // there is an instance
            m.instancesRef[mId[1]] = 1;
            m.instances[mId[1]] = that;
        } else {
            // no instance just save it under the name
            m.modelRef = 1;
            m.model = that;
        }
        debug.info( "Model: created model: " + pModelId + " refCount: 1" );
        return that;
    };

    function lookup( modelId ) {
        var m,
            mId = makeModelId( modelId );

        m = gModels[mId[0]];
        if ( m ) {
            if ( mId[1] ) {
                m = m.instances[mId[1]];
            } else {
                m = m.model;
            }
        }
        return m;
    }

    function list( type, includeRelated, pIncludeLocal, modelId ) {
        var m, mName,
            mId = modelId ? makeModelId( modelId ) : null,
            result = [];

        function isRelated( model ) {
            var pm,
                m = model,
                curId = makeModelId( m.modelId() );

            while ( curId ) {
                if ( curId[0] === mId[0] && ( curId[1] === mId[1] || mId[1] === null ) ) {
                    return true;
                }
                curId = null;
                pm = m.getOption( "parentModel" );
                if ( pm ) {
                    m = lookup( pm );
                    if ( m ) {
                        curId = makeModelId( pm );
                    }
                }
            }
            return false;
        }

        function matches( model ) {
            var match = !!( pIncludeLocal || model._options.regionId );

            if ( match ) {
                if ( type === "change" ) {
                    match = model.isChanged();
                } else if ( type === "error" ) {
                    match = model.hasErrors();
                }
                if ( match && includeRelated ) {
                    match = isRelated( model );
                }
            }
            return match;
        }

        function add( name, model ) {
            result.push( {
                id: name,
                model: model
            } );
        }

        function addInstances( m, name ) {
            var instName;
            if ( m.model ) {
                if ( matches( m.model ) ) {
                    add( name, m.model );
                }
            }
            for ( instName in m.instances ) {
                if ( m.instances.hasOwnProperty( instName ) ) {
                    if ( matches( m.instances[ instName ] ) ) {
                        add( [name, instName], m.instances[ instName ] );
                    }
                }
            }
        }

        if ( !mId ) {
            // if including all then include related makes no sense
            includeRelated = false;
        }

        if ( !includeRelated && mId && mId[0] ) {
            mName = mId[0];
            m = gModels[mName];
            if ( m ) {
                if ( mId[1] ) {
                    if ( m.instances[mId[1]] && matches( m.instances[mId[1]] ) ) {
                        add( [mName, mId[1]], m.instances[ mId[1] ] );
                    }
                } else {
                    addInstances( m, mName );
                }
            }
        } else {
            for ( mName in gModels ) {
                if ( gModels.hasOwnProperty( mName ) ) {
                    m = gModels[mName];
                    addInstances( m, mName );
                }
            }
        }
        return result;
    }

    /**
     * <p>Returns an array of all the currently defined model identifiers in no particular order.
     * If <code class="prettyprint">pModelId</code> is null or not provided all models are listed.
     * If <code class="prettyprint">pModelId</code> contains just a model name then just that model if any and all
     * instances with the same model name if any are returned.
     * If <code class="prettyprint">pModelId</code> contains a model and an instance then just that model instance is included.
     * Specifying <code class="prettyprint">pModelId</code> is most useful when <code class="prettyprint">pIncludeRelated</code> is true.
     *
     * @function list
     * @memberof apex.model
     * @param {boolean} [pIncludeLocal] If true models that don't have a regionId will be included.
     * @param {model.ModelId} [pModelId] Model identifier as given in call to {@link apex.model.create} or just a model name.
     * @param {boolean} [pIncludeRelated] If true then any dependents of any listed models are included.
     * @return {model.ModelId[]} Array of model identifiers
     */
    model.list = function( pIncludeLocal, pModelId, pIncludeRelated ) {
        var mList = list( null, pIncludeRelated, pIncludeLocal, pModelId );

        return mList.map( function( i ) {
            return i.id;
        } );
    };

    /**
     * Returns true if any of the specified models have changes.
     *
     * @function anyChanges
     * @memberof apex.model
     * @param {boolean} [pIncludeLocal] If true models that don't have a <code class="prettyprint">regionId</code>
     *   will be included in the check for changes.
     * @param {model.ModelId} [pModelId] Model identifier as given in call to {@link apex.model.create} or just a model name.
     *  See {@link apex.model.list} for how this parameter is used to select which models to operate on.
     * @param {boolean} [pIncludeRelated] If true then any dependents of any selected models are included in check
     * @return {boolean} true if any of the specified models have changed.
     * @example <caption>This example displays an alert message if any (non-local) models on the page have unsaved changes.</caption>
     * if ( apex.model.anyChanges() ) {
     *     apex.message.alert("Save Changes");
     * }
     */
    model.anyChanges = function( pIncludeLocal, pModelId, pIncludeRelated ) {
        var mList = list( "change", pIncludeRelated, pIncludeLocal, pModelId );
        return mList.length > 0;
    };

    /**
     * Returns true if any of the specified models have errors.
     *
     * @function anyErrors
     * @memberof apex.model
     * @param {boolean} [pIncludeLocal] If true models that don't have a <code class="prettyprint">regionId</code>
     *   will be included in check for errors.
     * @param {model.ModelId} [pModelId] Model identifier as given in call to {@link apex.model.create} or just a model name.
     *  See {@link apex.model.list} for how this parameter is used to select which models to operate on.
     * @param {boolean} [pIncludeRelated] If true then any dependents of any selected models are included in check.
     * @return {boolean} true if any of the specified models have errors.
     * @example <caption>This example displays an alert message if any (non-local) models on the page have errors.</caption>
     * if ( apex.model.anyErrors() ) {
     *     apex.message.alert("Fix Errors");
     * }
     */
    model.anyErrors = function( pIncludeLocal, pModelId, pIncludeRelated ) {
        var mList = list( "error", pIncludeRelated, pIncludeLocal, pModelId );
        return mList.length > 0;
    };

    /**
     * <p>Low level function to add changes for any of the specified models to a request.
     * Changes are added to the provided request data. This doesn't actually send the request to the server.
     * In most cases {@link apex.model.save} should be used rather than this function.</p>
     *
     * @function addChangesToSaveRequest
     * @memberof apex.model
     * @param {object} pRequestData An initial request object that will have all changes for the specified models added to it.
     * @param {model.ModelId} [pModelId] Model identifier as given in call to {@link apex.model.create} or just a model name.
     *  See {@link apex.model.list} for how this parameter is used to select which models to operate on.
     * @param {boolean} [pIncludeRelated] If true then any dependents of any selected models are included if they have changes.
     * @return {function} A function that must be called with the promise returned from the save request.
     */
    model.addChangesToSaveRequest = function( pRequestData, pModelId, pIncludeRelated ) {
        var i, cb,
            callbacks = [],
            mList = list( "change", pIncludeRelated, false, pModelId );

        if ( mList.length <= 0 ) {
            return null;
        }
        for ( i = 0; i < mList.length; i++ ) {
            cb = mList[i].model.addChangesToSaveRequest( pRequestData );
            if ( cb ) {
                callbacks.push( cb );
            }
        }
        return function( promise ) {
            var i;
            for (i = 0; i < callbacks.length; i++ ) {
                callbacks[i]( promise );
            }
        };
    };

    /**
     * <p>Save any of the specified models that have changes. This consolidates all the model data to save into a single
     * request.</p>
     *
     * @function save
     * @memberof apex.model
     * @param {object} [pRequestData] An initial request object that will have all changes for the specified models added to it.
     * @param {object} [pOptions] Options to pass on to {@link apex.server.plugin} API.
     * @param {model.ModelId} [pModelId] Model identifier as given in call to {@link apex.model.create} or just a model name.
     * @param {boolean} [pIncludeRelated] If true then any dependents of any selected models are included in check.
     * @return {promise} The promise from {@link apex.server.plugin} if a save request is sent or null if there are no
     * changed models to save.
     * @example <caption>This example saves all the models on the page that have changes.</caption>
     * apex.model.save();
     */
    model.save = function( pRequestData, pOptions, pModelId, pIncludeRelated ) {
        var updateModelsCallback, p;

        pRequestData = pRequestData || {};
        pOptions = pOptions || {};
        updateModelsCallback = apex.model.addChangesToSaveRequest( pRequestData, pModelId, pIncludeRelated );

        if ( updateModelsCallback ) {
            // todo allow this to use same code as _callServer or custom code
            p = server.plugin( pRequestData, pOptions );
            updateModelsCallback( p );
            return p;
        } // else
        return null;
    };

    /**
     * Get a model by its model identifier.
     *
     * @function get
     * @memberof apex.model
     * @param {model.ModelId} pModelId Model identifier as given in call to {@link apex.model.create}.
     * @return {model} The model identified by pModelId.
     * @example <caption>Get access to a model with model id MyModel and release it when done.</caption>
     * var myModel = apex.model.get("MyModel");
     * // ... do something with myModel
     * apex.model.release("MyModel");  // release it when done
     */
    model.get = function( pModelId ) {
        var m, model, refCount,
            mId = makeModelId( pModelId );

        m = gModels[mId[0]];
        if ( m ) {
            if ( mId[1] ) {
                model = m.instances[mId[1]];
                if ( model ) {
                    refCount = m.instancesRef[mId[1]] += 1;
                }
            } else {
                model = m.model;
                if ( model ) {
                    refCount = m.modelRef += 1;
                }
            }
            if ( model ) {
                removeFromModelLRU( model );
                debug.info( "Model: get model: " + pModelId + " refCount: " + refCount );
            }
        }
        return model;
    };

    function removeFromModelLRU( model ) {
        var i;

        i = gModelsLRU.indexOf( model );
        if ( i >= 0 ) {
            gModelsLRU.splice( i, 1 );
        }
    }

    function addToModelLRU( model ) {
        var i;

        i = gModelsLRU.indexOf( model );
        if ( i >= 0 ) {
            gModelsLRU.splice( i, 1 );
        }
        gModelsLRU.push( model );
    }

    function getModelLRU() {
        var i, model;

        for ( i = 0; i < gModelsLRU.length; i++ ) {
            model = gModelsLRU[i];
            if ( !model.isChanged() ) {
                return model;
            }
        }
        return null;
    }

    /**
     * todo xxx
     * @ignore
     * @function renameInstance
     * @memberof apex.model
     * @param pOldId
     * @param pNewInstance
     */
    model.renameInstance = function( pOldId, pNewInstance ) {
        var m, curModel,
            mId = makeModelId( pOldId );

        m = gModels[mId[0]];
        if ( m ) {
            if ( mId[1] ) {
                curModel = m.instances[mId[1]];
                curModel.instance = pNewInstance;
                delete m.instances[mId[1]];
                m.instances[pNewInstance] = curModel;
                debug.info( "Model: rename model " + mId[0] + " instance: " + mId[1] + " to " + pNewInstance );
                notifyChange( curModel, "instanceRename", {
                    oldInstance: mId[1],
                    newInstance: pNewInstance
                } );
            }
        }
    };

    /**
     * <p>Release a model if it is not being used but may be used again in the future. This allows the model
     * to be destroyed if needed to conserve memory.</p>
     * <p>Models are reference counted. For every call to get or create a call to release with the same model id is
     * required. When the reference count is zero the model is destroyed unless it is changed or if it has a
     * parent model, in which case it is cached.</p>
     *
     * @function release
     * @memberof apex.model
     * @param {model.ModelId} pModelId Model identifier as given in call to {@link apex.model.create}.
     * @example <caption>Get access to a model with model id MyModel and release it when done.</caption>
     * var myModel = apex.model.get("MyModel");
     * // ... do something with myModel
     * apex.model.release("MyModel");  // release it when done
     */
    model.release = function( pModelId ) {
        var m, refCount,
            mId = makeModelId( pModelId );

        m = gModels[mId[0]];
        if ( m ) {
            if ( mId[1] ) {
                refCount = m.instancesRef[mId[1]] -= 1;
                m = m.instances[mId[1]];
            } else {
                refCount = m.modelRef -= 1;
                m = m.model;
            }
            debug.info( "Model: release model: " + pModelId + " refCount: " + refCount );
            // if refcount is 0 and the model has no changes and (it is not an instance or the parent model doesn't exist) then destroy it now
            if ( refCount <= 0 ) {
                if ( m._options.parentModel && lookup( m._options.parentModel ) ) {
                    // it is an instance which could be used again or could be destroyed later if there are too many
                    debug.info( "Model: save in cache model: " + pModelId );
                    addToModelLRU( m );
                } else if ( !m.isChanged() ) {
                    model.destroy( pModelId );
                }
                // otherwise it has changes and can't be destroyed
            }
        }
    };

    /**
     * <p>Destroy and remove a model by its identifier. This bypasses reference counting and caching. This method should
     * not be used unless you are sure that no one else is using the model.</p>
     * <p>If <code class="prettyprint">pModelId</code> is a string model name and there are one or more instances
     * they will all be destroyed.</p>
     *
     * @function destroy
     * @memberof apex.model
     * @param {model.ModelId} pModelId Model identifier as given in call to {@link apex.model.create} or just a model name.
     * @example <caption>Destroy the model with model id MyModel.</caption>
     * apex.model.destroy("MyModel");
     */
    model.destroy = function( pModelId ) {
        var m, instName,
            mId = makeModelId( pModelId );

        function remove( m ) {
            var masterModel, pm;
            if ( m ) {
                removeFromModelLRU( m );
                if ( m.parentModelViewId ) {
                    pm = m._options.parentModel;
                    masterModel = model.get( pm );
                    if ( masterModel ) {
                        masterModel.unSubscribe( m.parentModelViewId );
                        model.release( pm );
                    }
                }
                m._data = null;
                m._index = null;
                m._selection = null;
                debug.info( "Model: destroy model: " + pModelId );
            }
        }

        m = gModels[mId[0]];
        if ( m ) {
            if ( mId[1] ) {
                remove( m.instances[mId[1]] );
                delete m.instancesRef[mId[1]];
                delete m.instances[mId[1]];
            } else {
                remove( m.model );
                delete m.model;
                delete m.modelRef;
                if ( typeof pModelId === "string" && !mId[1] ) {
                    // delete all the instances
                    for ( instName in m.instances ) {
                        if ( m.instances.hasOwnProperty( instName ) ) {
                            remove( m.instances[instName] );
                            delete m.instancesRef[instName];
                            delete m.instances[instName];
                        }
                    }
                }
            }
            if ( Object.keys(m.instances).length === 0 && !m.model ) {
                delete gModels[mId[0]];
            }
        }
    };

    /*
    // for debugging
    model.dumpRefs = function() {
        var name, m, instName, im;

        for (name in gModels) {
            if ( gModels.hasOwnProperty( name ) ) {
                m = gModels[name];
                if ( m.model ) {
                    console.log("Model: " + name + ", ref: " + m.modelRef );
                } else {
                    console.log("Model: " + name );
                }
                for (instName in m.instances) {
                    if ( m.instances.hasOwnProperty( instName ) ) {
                        console.log("     : " + instName + ", ref: " + m.instancesRef[instName] );
                    }
                }
            }
        }
        console.log("LRU: " + gModelsLRU.map(function(m) { return m.modelId(); }).join(", ") );
        return gModels;
    };
    */

    /**
     * Get the max number of cached detail instance models.
     *
     * @function getMaxCachedModels
     * @memberof apex.model
     * @return {integer} Max cached detail instance models.
     */
    model.getMaxCachedModels = function() {
        return gMaxCachedModels;
    };

    /**
     * Set the max number of cached unreferenced, unchanged detail instance models that will be kept.
     *
     * @function setMaxCachedModels
     * @memberof apex.model
     * @param {integer} n Number of unreferenced, unchanged detail instance models that will be kept.
     */
    model.setMaxCachedModels = function( n ) {
        gMaxCachedModels = parseInt( n, 10 ) || DEFAULT_MAX_MODELS;
    };

})( apex.model, apex.server, apex.debug, apex.jQuery );
