var modelData = '';
var storeData = '';
var viewData = '';
var root = '';
var appName = '';
var compName = '';

chrome.extension.onMessage.addListener(function (request, sender) {

    //check if error occured in parsing data
    if (!request.source) {
        Ext.Msg.alert('Unknown Error', 'An error occured parsing the data.');
        return;
    }

    //fill out required field variables.
    root = Ext.ComponentQuery.query('#rootFld')[0].getValue();
    appName = Ext.ComponentQuery.query('#appNameFld')[0].getValue();
    compName = Ext.ComponentQuery.query('#compNameFld')[0].getValue();

    //make sure required fields were provided.
    if (root == '' || appName == '' || compName == '') {
        Ext.Msg.alert('Missing Fields', 'Required fields were not completed.');
        return;
    }

    //console.log(root);
    var jsonObj = request.source;
    var nested = root.split('.');
    //console.log(nested);
    for (var x = 0; x <= nested.length - 1; x++) {
        jsonObj = jsonObj[nested[x]];
    }

    if (jsonObj.length > 1) {
        jsonObj = jsonObj[0];
    }

    var fields = [];
    for (var property in jsonObj) {
        if (jsonObj.hasOwnProperty(property)) {
            fields.push(property);
        }
    }
    var type = 'Ajax';
    if(request.isJsonP)
        type = 'JsonP';
    var url = request.url;
    var model = {
        extend: 'Ext.data.Model',
        fields: [],
        proxy: {
            type: type,
            url: url,
            extraParams: request.extraParams,
            headers: { 'Content-type': 'text/json;  charset=utf-8', 'Accepts': 'text/json' },
            reader: {
                type: 'json',
                root: root,
                successProperty: 'success'
            }
        }
    };

    for (var property in fields) {
        if (fields.hasOwnProperty(property)) {
            model.fields.push({ name: fields[property], type: 'auto' });
        }   
    }
    

    model = 'Ext.define(\'' + appName + '.model.' + compName + '\',' + JSON.stringify(model, null, 2) + ');';

    //http://stackoverflow.com/questions/11233498/json-stringify-without-quotes-on-properties
    modelData = model.replace(/\"([^(\")"]+)\":/g, "$1:");
    Ext.ComponentQuery.query('#modelFld')[0].setValue(modelData);

    var store = {
        extend: 'Ext.data.Store',
        model: appName + '.model.' + compName,
        autoLoad: true
    };

    store = 'Ext.define(\'' + appName + '.store.' + compName + 's' + '\',' + JSON.stringify(store, null, 2) + ');';
    storeData = store.replace(/\"([^(\")"]+)\":/g, "$1:");;
    Ext.ComponentQuery.query('#storeFld')[0].setValue(storeData);

    var view = {
        extend: 'Ext.grid.Panel',
        requires: [],
        controllers: [],
        store: compName + 's',
        xtype: compName,
        viewConfig: {
            //enableTextSelection: true,
        },
        features: [
        ],
        plugins: [
            //'bufferedrenderer',
        ],
        tbar: {
            items: [
            ]
        },
        columns: [
        ]
    };

    for (var property in fields) {
        if (fields.hasOwnProperty(property)) {
            view.columns.push({ header: fields[property], dataIndex: fields[property] });
        }
    }

    view = 'Ext.define(\'' + appName + '.view.' + compName + '\',' + JSON.stringify(view, null, 2) + ')';
    viewData = view.replace(/\"([^(\")"]+)\":/g, "$1:");
    Ext.ComponentQuery.query('#viewFld')[0].setValue(viewData);
    //console.log(fields);
    //console.log(request.extraParams);
});

function onWindowLoad() {
    //document.getElementById('submitBtn').addEventListener('click', click);

    Ext.onReady(function () {
        console.log('ExtJS Definition Builder Loaded.');
        Ext.create('Ext.panel.Panel', {
            renderTo: Ext.getBody(),
            layout:'border',
            title: 'ExtJS Definition Builder',
            height: 525,
            width: 750,
            bbar: ['->',{
                text: 'About',
                handler: function (btn) {
                    Ext.create('Ext.window.Window', {
                        title: 'ExtJS Definition Builder',
                        bbar: [{
                            xtype: 'component',
                            padding:'0 10 0',
                            html: '<a href="https://github.com/weeksdev/ExtJS-Def-Build" target="_blank">GitHub</a>'
                        }, '->', {
                            text: 'close',
                            handler: function (btn) {
                                btn.up('window').close();
                            }
                        }],
                        items: [{
                            xtype: 'fieldset',
                            border:0,
                            items: [{
                                xtype: 'displayfield',
                                fieldLabel: 'By',
                                value:'Andrew Weeks'
                            }, {
                                xtype: 'displayfield',
                                fieldLabel: 'Created',
                                value:'2/27/2014'
                            }, {
                                xtype: 'displayfield',
                                fieldLabel: 'GitHub',
                                value:'This project is open and available on GitHub'
                            }]
                        }],
                        width: 400,
                        height:200
                    }).show()   ;
                }
            }],
            items: [{
                xtype: 'panel',
                collapsible: true,
                title: 'Settings',
                region: 'north',
                tbar: [{
                    xtype: 'textfield',
                    itemId: 'rootFld',
                    emptyText: 'Root...',
                    value: Ext.util.Cookies.get('rootFld'),
                    allowBlank:false,
                    listeners: {
                        change: function (fld) {
                            Ext.util.Cookies.set(fld.itemId, fld.getValue());
                        }
                    }
                }, {
                    xtype: 'textfield',
                    itemId: 'appNameFld',
                    emptyText: 'App Name...',
                    value: Ext.util.Cookies.get('appNameFld'),
                    allowBlank: false,
                    listeners: {
                        change: function (fld) {
                            Ext.util.Cookies.set(fld.itemId, fld.getValue());
                        }
                    }
                }, {
                    xtype: 'textfield',
                    itemId: 'compNameFld',
                    emptyText: 'Component Name...',
                    value: Ext.util.Cookies.get('compNameFld'),
                    allowBlank: false,
                    listeners: {
                        change: function (fld) {
                            Ext.util.Cookies.set(fld.itemId, fld.getValue());
                        }
                    }
                },{
                    xtype: 'button',
                    text: 'Submit',
                    handler: click
                }, '->', {
                    xtype: 'button',
                    text: 'Download Files',
                    handler: download
                }]
            }, {
                xtype: 'panel',
                layout: 'accordion',
                title: 'Defitions',
                region:'center',
                items: [{
                    title: 'Model',
                    xtype: 'panel',
                    items:[{
                        xtype:'textarea',
                        itemId: 'modelFld',
                        //resizable: true,
                        fieldStyle: 'background-color:#eeeeee !important; background-image:none !important;',
                        height: 287,
                        width: 730,
                        padding: 5,
                        listeners: {
                            change: function (fld) {
                                modelData = fld.getValue();
                            }
                        }
                    }]
                }, {
                    title: 'Store',
                    xtype: 'panel',
                    items:[{
                        xtype:'textarea',
                        itemId: 'storeFld',
                        //resizable: true,
                        fieldStyle: 'background-color:#eeeeee !important; background-image:none !important;',
                        height: 287,
                        width: 730,
                        padding: 5,
                        listeners: {
                            change: function (fld) {
                                storeData = fld.getValue();
                            }
                        }
                    }]
                }, {
                    title: 'View',
                    xtype: 'panel',
                    items:[{
                        xtype:'textarea',
                        itemId: 'viewFld',
                        //resizable: true,
                        fieldStyle: 'background-color:#eeeeee !important; background-image:none !important;',
                        height: 287,
                        width: 730,
                        padding: 5,
                        listeners: {
                            change: function (fld) {
                                viewData = fld.getValue();
                            }
                        }
                    }]
                }]
            }]
        });
    });
}
function download (btn) {
    console.log('got here');
    var zip = new JSZip();
    var model = zip.folder('model');
    model.file(compName + '.js', modelData);
    var store = zip.folder('store');
    store.file(compName + 's.js', storeData);
    var view = zip.folder('view');
    view.file(compName + '.js', viewData);
    var content = zip.generate();
    window.open("data:application/zip;base64," + content);
    //chrome.tabs.getSelected(null, function (tab) {
    //    chrome.tabs.create({ url: "data:application/zip;base64," + content, index: tab.id });
    //});
    
}

function click() {

    var message = document.querySelector('#message');

    chrome.tabs.executeScript(null, {
        file: "getPagesSource.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.extension.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
        }
    });
}

window.onload = onWindowLoad;