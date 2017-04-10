"use strict";
var schemas = {
    object:  {
        "$schema":    "http://json-schema.org/draft-04/schema#",
        "type":       "object",
        "properties": {
            "title":         {
                "type":    "string",
                "default": ""
            },
            "description":   {
                "type":    "string",
                "default": ""
            },
            "propertyOrder": {
                "type":    "integer",
                "default": "1000"
            },
            "options":       {
                "type":       "object",
                "required":   ["hidden"],
                "properties": {
                    "hidden": {
                        "type":    "boolean",
                        "default": false
                    }
                }
            },
            "type":          {
                "type":    "string",
                "default": "object",
                "options": {
                    "hidden": true
                }
            }
        }
    },
    boolean: {
        "$schema":    "http://json-schema.org/draft-04/schema#",
        "type":       "object",
        "properties": {
            "title":         {
                "type":    "string",
                "default": ""
            },
            "description":   {
                "type":    "string",
                "default": ""
            },
            "default":       {
                "type":    "boolean",
                "default": false
            },
            "readOnly":      {
                "type":    "boolean",
                "default": false
            },
            "propertyOrder": {
                "type":    "integer",
                "default": "1000"
            },
            "options":       {
                "type":       "object",
                "required":   ["hidden"],
                "properties": {
                    "hidden": {
                        "type":    "boolean",
                        "default": false
                    }
                }
            },
            "type":          {
                "type":    "string",
                "default": "boolean",
                "options": {
                    "hidden": true
                }
            }
        }
    },
    string:  {
        "$schema":    "http://json-schema.org/draft-04/schema#",
        "type":       "object",
        "properties": {
            "title":         {
                "type":    "string",
                "default": ""
            },
            "description":   {
                "type":    "string",
                "default": ""
            },
            "default":       {
                "type":    "string",
                "default": ""
            },
            "format":        {
                "type":    "string",
                "enum":    [
                    "upload", "color", "date", "datetime", "datetime-local", "email", "month", "number", "range", "tel", "text", "textarea", "time", "url", "week"
                ],
                "default": "text"
            },
            "required":      {
                "type":    "boolean",
                "default": false
            },
            "readOnly":      {
                "type":    "boolean",
                "default": false
            },
            "enum":          {
                "type":   "array",
                "format": "table",
                "items":  {
                    "type": "string"
                }
            },
            "pattern":       {
                "type":    "string",
                "default": ""
            },
            "propertyOrder": {
                "type":    "integer",
                "default": "1000"
            },
            "minLength":     {
                "type":      "integer",
                "default":   "",
                "minLength": 0
            },
            "maxLength":     {
                "type":    "integer",
                "default": 140
            },
            "options":       {
                "type":       "object",
                "required":   ["hidden"],
                "properties": {
                    "hidden": {
                        "type":    "boolean",
                        "default": false
                    }
                }
            },
            "type":          {
                "type":    "string",
                "default": "string",
                "options": {
                    "hidden": true
                }
            }
        },
        "required":   ["required", "readOnly", "format", "propertyOrder"]
    },
    number:  {
        "$schema":    "http://json-schema.org/draft-04/schema#",
        "type":       "object",
        "properties": {
            "title":            {
                "type":    "string",
                "default": ""
            },
            "format":           {
                "type":    "string",
                "enum":    [
                    "color", "date", "datetime", "datetime-local", "email", "month", "number", "range", "tel", "text", "textarea", "time", "url", "week"
                ],
                "default": "text"
            },
            "readOnly":         {
                "type":    "boolean",
                "default": false
            },
            "multipleOf":       {
                "type": "integer"
            },
            "maximum":          {
                "type":    "integer",
                "default": 99999999
            },
            "minimum":          {
                "type":    "integer",
                "default": 0
            },
            "enum":             {
                "type":   "array",
                "format": "table",
                "items":  {
                    "type": "number"
                }
            },
            "exclusiveMaximum": {
                "type":        "boolean",
                "description": `If "exclusiveMaximum" is true, then a numeric instance SHOULD NOT be equal to the value specified in "maximum". If "exclusiveMaximum" is false (or not specified), then a numeric instance MAY be equal to the value of "maximum"`
            },
            "exclusiveMinimum": {
                "type": "boolean"
            },
            "propertyOrder":    {
                "type":    "integer",
                "default": "1000"
            },
            "options":          {
                "type":       "object",
                "required":   ["hidden"],
                "properties": {
                    "hidden": {
                        "type":    "boolean",
                        "default": false
                    }
                }
            },
            "type":             {
                "type":    "string",
                "default": "number",
                "options": {
                    "hidden": true
                }
            }
        }
    },
    integer: {
        "$schema":    "http://json-schema.org/draft-04/schema#",
        "type":       "object",
        "properties": {
            "title":            {
                "type":    "string",
                "default": ""
            },
            "format":           {
                "type":    "string",
                "enum":    [
                    "color", "date", "datetime", "datetime-local", "email", "month", "number", "range", "tel", "text", "textarea", "time", "url", "week"
                ],
                "default": "text"
            },
            "readOnly":         {
                "type":    "boolean",
                "default": false
            },
            "multipleOf":       {
                "type": "integer"
            },
            "maximum":          {
                "type":    "integer",
                "default": "999999"
            },
            "enum":             {
                "type":   "array",
                "format": "table",
                "items":  {
                    "type": "integer"
                }
            },
            "minimum":          {
                "type": "integer"
            },
            "exclusiveMaximum": {
                "type":        "boolean",
                "description": `If "exclusiveMaximum" is true, then a numeric instance SHOULD NOT be equal to the value specified in "maximum". If "exclusiveMaximum" is false (or not specified), then a numeric instance MAY be equal to the value of "maximum"`
            },
            "exclusiveMinimum": {
                "type": "boolean"
            },
            "propertyOrder":    {
                "type":    "integer",
                "default": "1000"
            },
            "options":          {
                "type":       "object",
                "required":   ["hidden"],
                "properties": {
                    "hidden": {
                        "type":    "boolean",
                        "default": false
                    }
                }
            },
            "type":             {
                "type":    "string",
                "default": "integer",
                "options": {
                    "hidden": true
                }
            }
        }
    },
    array:   {
        "$schema":    "http://json-schema.org/draft-04/schema#",
        "type":       "object",
        "properties": {
            "title":         {
                "type":    "string",
                "default": ""
            },
            "uniqueItems":   {
                "type":    "boolean",
                "default": false
            },
            "items":         {
                "type":       "object",
                "required":   ["type"],
                "properties": {
                    "title":      {
                        "type":    "string",
                        "default": ""
                    },
                    "type":       {
                        "type":    "string",
                        "enum":    [
                            "string", "integer", "number", "array", "object"
                        ],
                        "default": "string"
                    },
                    "enum":       {
                        "type":   "array",
                        "format": "table"
                    },
                    "properties": {
                        "type": "object"
                    }
                },
                "options":    {
                    "hidden": true
                }
            },
            "propertyOrder": {
                "type":    "integer",
                "default": "1000"
            },
            "options":       {
                "type":       "object",
                "required":   ["hidden"],
                "properties": {
                    "hidden": {
                        "type":    "boolean",
                        "default": false
                    }
                }
            },
            "type":          {
                "type":    "string",
                "default": "array",
                "options": {
                    "hidden": true
                }
            }
        }
    }
};

function getDefaultValueFromSchema(schema) {
    console.log('getDefaultValueFromSchema', schema);
    let ret = {};
    if (!schema.properties) return ret;
    for (var prop in schema.properties) {
        if (!schema.properties.hasOwnProperty(prop)) continue;
        if (schema.properties[prop].default)
            ret[prop] = schema.properties[prop].default;
        else
            ret[prop] = '';
    }
    return ret;
}

// chinh sua lai property cho phu hop voi tung type
function cleanUpProperties(configType, configValue) {
    console.log('cleanUpProperties', configType, configValue);
    // remove tat ca key ngoai allowed
    var allowedKeys = _.keys(schemas[configType].properties);
    _.forOwn(configValue, (value, key) => {
        if (allowedKeys.indexOf(key) === -1) {
            console.log('delete', key);
            delete configValue[key];
        }
    });

    // old cleanup code
    configValue.type = configType;
    switch (configType) {
        case 'string':
            delete configValue.properties;
            break;
        case 'number':
            delete configValue.properties;
            break;
        case 'integer':
            delete configValue.properties;
            break;
        case 'object':
            if (!configValue.properties || typeof(configValue.properties) != 'object' || Array.isArray(configValue.properties))
                configValue.properties = {};
            // insert default type string for property
            for (var key in configValue.properties) {
                if (!configValue.properties.hasOwnProperty(key)) continue;
                if (configValue.properties[key] == null)
                    configValue.properties[key] = {type: 'string'};
            }
            break;
        case 'array':
            delete configValue.properties;
            break;
    }
    return configValue;
}

var JsonSchemaEditor = function (schema) {
    var me = this;

    var modalTemplate = `
        <div class="ui modal" style="overflow-y: auto;">
            <div class="header">Edit Field <span class="fieldName"></span></div>
            <div class="content bootstrap-iso">        
            </div>
            <div class="actions">
                <div class="ui deny button">Cancel</div>
                <div class="ui blue right labeled icon button saveBtn">Save
                    <i class="save icon"></i>
                </div>
            </div>
        </div>`;


    function mergeConfig(schema, configPath, configValue) {
        console.log('mergeConfig', schema, configPath, configValue);
        var parts = configPath.split('.');
        parts.shift(); // remove root
        var ret = schema;

        return parts.some(function (key, index) {
            if (!ret.properties && !ret.items) return true;
            console.log('key', key, 'index', index, parts.length - 1);
            if (index === parts.length - 1) {
                // // merge value from object configValue to ret.properties[key]
                // for (var configKey in configValue) {
                //     if (!configValue.hasOwnProperty(configKey)) continue;
                //     ret.properties[key][configKey] = configValue[configKey];
                // }
                // simple replace
                if (key == '0') {
                    // edit type of item in array
                    ret.items = configValue;
                } else {
                    ret.properties[key] = configValue;
                }
                return true;
            } else {
                if (key == '0') {
                    ret = ret.items;
                    return false;
                } else if (ret.properties[key]) {
                    ret = ret.properties[key];
                    return false;
                } else {
                    return true;
                }
            }
        })
    }

    function mergeConfigArrayType(schema, configPath, configValue) {
        var parts = configPath.split('.');
        parts.shift(); // remove root
        var ret = schema;

        return parts.some(function (key, index) {
            console.log('some', index, parts.length);
            if (index === parts.length - 1) {
                console.log('set items', configValue);
                ret.items = configValue;
                return true;
            } else {
                ret = ret.properties[key];
            }
            return typeof(ret) !== 'object';
        })
    }

    function getConfig(schema, configPath) {
        var parts = configPath.split('.');
        parts.shift(); // remove root
        var ret = schema;

        if (parts.some(function (key) {
                if (!ret.properties && !ret.items) {
                    return true;
                }
                if (key === '0') {
                    ret = ret.items;
                    return false;
                } else if (ret.properties[key]) {
                    ret = ret.properties[key];
                    return false;
                } else {
                    return true;
                }
            }) == false) {
            return ret;
        }
        return null;
    }

    me.schema = schema;
    me.fieldType;

    me.loadSchema = function (editorElm, fieldType, configPath) {
        console.log('fieldType, configPath', fieldType, configPath);
        me.configPath = configPath;
        me.fieldType = fieldType;
        var config = getConfig(me.schema, configPath);
        var editorSchema = schemas[fieldType];

        var disableProperty = true;
        // if (fieldType === 'string') disableProperty = true;

        me.editor = new JSONEditor(editorElm, {
            schema:                editorSchema,
            theme:                 'bootstrap3',
            iconlib:               'fontawesome4',
            startval:              '',
            disable_edit_json:     true,
            disable_properties:    disableProperty,
            disable_array_add:     false,
            disable_array_delete:  false,
            disable_array_reorder: false,
            disable_collapse:      true,
            disable_config:        true
        });

        var defaultValue = getDefaultValueFromSchema(editorSchema);
        console.log('defaultValue', defaultValue);
        // defaultValue.name = fieldName;
        // chi merge cac config key có trong defaultValue va exists config
        for (var key in config) {
            if (!config.hasOwnProperty(key)) continue;
            if (config[key] != undefined) {
                defaultValue[key] = config[key];
            }
        }
        // remove cac config khac type
        cleanUpProperties(fieldType, defaultValue);
        console.log('defaultValue after merge', defaultValue);
        me.editor.setValue(defaultValue);
    };

    me.getValue = function () {
        var newValue = me.editor.getValue();
        newValue.type = me.fieldType;
        console.log('newValue', newValue);
        // console.log('before clean up', config, newValue);
        newValue = cleanUpProperties(me.fieldType, newValue);
        console.log('newValue after clean', newValue);
        // if (config.type === 'array') {
        //     mergeConfigArrayType(me.schema, configPath, newValue);
        // } else {
        mergeConfig(me.schema, me.configPath, newValue);
        console.log('newValue after merge', me.schema);
        // }

        // remove enum if empty value
        _.map(me.schema.properties, function(prop, key) {
            if (prop.enum && prop.enum.length != undefined && prop.enum.length == 0) {
                delete prop.enum;
            }
        });

        // console.log('new schema', me.schema);
        // console.log('TEST validation', me.editor.validate());
        return me.schema;
    };

    me.showConfigDialog = function (fieldType, configPath, callback) {
        console.log('showConfigDialog', configPath);
        var fieldName = configPath.split('.').pop();

        if (me.modal) {
            me.modal.remove();
            me.modal = null;
            if (me.editor && me.editor.destroy) {
                me.editor.destroy();
                me.editor = null;
            }
        }

        me.modal = $(modalTemplate);
        me.modal.find('.fieldName').html(fieldName);
        me.modal.find('.saveBtn').click(function () {
            var newSchema = me.getValue();
            if (callback) {
                callback(newSchema);
            }
            me.modal.modal('hide');
        });

        me.modal.appendTo('body');

        me.loadSchema(me.modal.find('.content'), fieldType, configPath);

        me.modal.modal('show');
    };

    me.getSchema = function () {
        return me.schema;
    };

    me.destroy = function () {
        if (me.editor)
            me.editor.destroy();
    }
};

window.JsonSchemaEditor = JsonSchemaEditor;
module.exports = JsonSchemaEditor;
