modelData = '';
storeData = '';
viewData = '';

chrome.extension.onMessage.addListener(function (request, sender) {
    var root = Ext.ComponentQuery.query('#rootFld')[0].getValue();
    //console.log(root);
    var jsonObj = request.source;
    var nested = root.split('.');

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
    var url = '';
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
    var appName = 'bbom';
    var compName = 'boomer';

    var model = 'Ext.define(\'' + appName + '.model.' + compName + '\',\'' + JSON.stringify(model, null, 2) + ');';
    modelData = model;
    Ext.ComponentQuery.query('#modelFld')[0].setValue(modelData);
    console.log(fields);
    console.log(request.extraParams);
});

function onWindowLoad() {
    //document.getElementById('submitBtn').addEventListener('click', click);

    Ext.onReady(function () {
        console.log('ExtJS Definition Builder Loaded.');
        Ext.create('Ext.panel.Panel', {
            renderTo: Ext.getBody(),
            layout:'border',
            title: 'ExtJS Definition Builder',
            height: 500,
            width:750,
            items: [{
                xtype: 'panel',
                collapsible: true,
                title: 'Settings',
                region: 'north',
                tbar: [{
                    xtype: 'textfield',
                    itemId: 'rootFld',
                    emptyText: 'Root...',
                    value:Ext.util.Cookies.get('rootFld'),
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
                    text: 'Download Files'
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
                        resizable: true,
                        height: 287,
                        width: 730,
                        padding: 5
                    }]
                }, {
                    title: 'Store',
                    xtype: 'panel',
                    items:[{
                        xtype:'textarea',
                        itemId: 'storeFld',
                        resizable: true,
                        height: 287,
                        width: 730,
                        padding:5
                    }]
                }, {
                    title: 'View',
                    xtype: 'panel',
                    items:[{
                        xtype:'textarea',
                        itemId: 'viewFld',
                        resizable: true,
                        height: 287,
                        width: 730,
                        padding: 5
                    }]
                }]
            }]
        });
    });
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