const arrayOptionsEnum = {
    singleSchema: 'singleSchema',
    arraySchema:  'schemaArray',
    emptySchema:  'emptySchema',
    anyOf:        'anyOf',
    oneOf:        'oneOf',
    allOf:        'allOf'
};

const defaultOptions = {
    url:                  'http://jsonschema.net',
    json:                 '',
    // Array options.
    arrayOptions:         arrayOptionsEnum.singleSchema,
    // General options.
    includeDefaults:      false,
    includeEnums:         false,
    forceRequired:        true,
    absoluteIds:          false,
    numericVerbose:       false,
    stringsVerbose:       false,
    objectsVerbose:       false,
    arraysVerbose:        false,
    metadataKeywords:     false,
    additionalItems:      true,
    additionalProperties: true
};

function getType(aValue) {
    let type;

    if (Array.isArray(aValue)) {
        type = 'array';
    } else if (typeof(aValue) === 'object') {
        type = 'object';
    } else if (typeof(aValue) === 'number') {
        let isInt = (aValue % 1 === 0);
        if (isInt) {
            type = 'integer';
        } else {
            type = 'number';
        }
    } else if (typeof(aValue) === 'string') {
        type = 'string';
    } else if (null === aValue) {
        type = 'null';
    } else if (typeof aValue === 'boolean') {
        type = 'boolean';
    }
    return type;
}

const getEmptySchema = function () {
    let schema = {};
    let key = 'auto-generated-schema-' + Math.floor((Math.random() * 1000) + 1);

    schema.__key__ = key;
    schema.id = key;

    return schema;
};

class Schema {
    constructor(aKey, aValue) {
        // console.log('aKey', aKey);
        let isPrimitiveType = (
            (!Array.isArray(aValue)) && (typeof(aValue) !== 'object')
        );

        // Root object's key is undefined.
        this.root = aKey === undefined;
        // console.log('root', this.root);

        // These values are copied from 'src' to 'dst' in Schemaservice.
        this.key = this.root ? '/' : String(aKey);
        this.name = this.root ? '/' : String(aKey);
        this.id = this.root ? defaultOptions.url : String(aKey);
        this.type = getType(aValue);
        this.title = this.root ? 'Root schema.' : String(aKey)[0].toUpperCase() + String(aKey).slice(1) + ' schema.';
        this.description = 'An explanation about the purpose of this instance described by this schema.';

        if (isPrimitiveType) {
            this.defaultValue = aValue;
        }

        this.subSchemas = [];
    }

    addSubSchema(aSchema) {
        this.subSchemas.push(aSchema);
        // Allow sub-schemas to reference parent schemas.
        aSchema.parent = this;
    }

    isObject(aSchema) {
        return this.type === 'object';
    }

    isArray(aSchema) {
        return this.type === 'array';
    }

    isString(aSchema) {
        return this.type === 'string';
    }

    isNumber(aSchema) {
        return (this.type === 'number');
    }

    isInteger(aSchema) {
        return (this.type === 'integer');
    }
}

class SchemaFactory {
    constructor(json, opts) {
        this.json = json;
        this.userDefinedOptions = opts || defaultOptions;
    }

    schemalize() {
        // try {
        this.json = JSON.parse(this.json);
        this.intermediateResult = this.schema4Object(undefined, this.json);
        // console.log('this.intermediateResult', this.intermediateResult);

        this.editableSchema = this.constructSchema(this.intermediateResult);
        // console.log('this.editableSchema', this.editableSchema);

        this.clean(this.editableSchema);
        this.clean(this.editableSchema, true);
        return JSON.stringify(this.editableSchema, null, 4);
        // } catch (ex) {
        //     console.error(ex);
        //     return '';
        // }
    }

    clean(obj, isRemoveId) {
        isRemoveId = isRemoveId || false;
        let key = obj['__key__'];
        // console.log("clean obj (" + key + ")");
        let count = 0;
        let val;
        for (let k in obj) {
            if (!obj.hasOwnProperty(k)) continue;
            if (isRemoveId && k === 'id')
                delete obj['id'];

            if (typeof obj[k] == "object" && obj[k] !== null) {
                // User removed schema.
                if (obj[k].__removed__) {
                    // Will delete all sub-schemas, which we want.
                    delete obj[k];
                    continue;
                }

                // Recursive call parsing in parent object this time.

                this.clean(obj[k], isRemoveId);
                //return;
            }
            else {
                switch (String(k)) {
                    /*
                     Metadata keywords.
                     */
                    case '__required__':
                        let isRequired = obj[k];

                        let parentSchema = this.getSchema(obj.__parent__);
                        // console.log('obj.__parent__', obj.__parent__);
                        // console.log('__required__', isRequired, parentSchema, obj);
                        if (parentSchema) {

                            if (isRequired) {
                                if (!parentSchema.required) {
                                    parentSchema.required = [];
                                }
                                let index = parentSchema.required.indexOf(key);
                                if (index < 0) {
                                    parentSchema.required.push(key);
                                }
                            } else {
                                if (parentSchema.required) {
                                    // $log.debug('key:' + key);
                                    // $log.debug(parentSchema);
                                    let index = parentSchema.required.indexOf(key);
                                    // $log.debug(parentSchema.required);
                                    if (index > -1) {
                                        parentSchema.required.splice(index, 1);
                                        // $log.debug("Splice: " + parentSchema.required);

                                    }
                                }
                            }
                        }

                        // delete obj['id'];
                        break;
                    case '__parent__':
                    //console.log('obj.__parent__' + '=' + obj.__parent__);
                    case '__removed__':
                        break;
                    /*
                     Keywords for arrays.
                     */
                    case 'maxItems':
                    case 'minItems':
                        break;
                    case 'uniqueItems':
                        val = Boolean(obj[k]);
                        obj[k] = val;

                        if (!this.userDefinedOptions.arraysVerbose) {
                            // if (!UserDefinedOptions.arraysVerbose) {
                            if (!val) {
                                delete obj[k];
                            }
                        }
                        break;
                    case 'additionalItems':
                        val = Boolean(obj[k]);
                        obj[k] = val;

                        if (!this.userDefinedOptions.arraysVerbose) {
                            //   if (!UserDefinedOptions.arraysVerbose) {
                            if (val) {
                                // true is default
                                delete obj[k];
                            }
                        }
                        break;
                    /*
                     Keywords for numeric instances (number and
                     integer).
                     */
                    case 'minimum':
                    case 'maximum':
                    case 'multipleOf':
                        val = parseInt(obj[k]);
                        obj[k] = val;

                        if (!this.userDefinedOptions.numericVerbose) {

                            //  if (!UserDefinedOptions.numericVerbose) {

                            // Only delete if defaut value.
                            if (!val && val != 0) {
                                delete obj[k];
                            }
                        }
                        break;
                    case 'exclusiveMinimum':
                    case 'exclusiveMaximum':
                        val = Boolean(obj[k]);
                        obj[k] = val;

                        if (!this.userDefinedOptions.numericVerbose) {

                            //   if (!UserDefinedOptions.numericVerbose) {

                            if (!val) {
                                delete obj[k];
                            }
                        }
                        break;
                    /*
                     Metadata keywords.
                     */
                    case 'name':
                    case 'title':
                    case 'description':
                        val = String(obj[k]).trim();
                        obj[k] = val;

                        if (!this.userDefinedOptions.metadataKeywords) {

                            //    if (!UserDefinedOptions.metadataKeywords) {

                            if (!val) {
                                delete obj[k];
                            }
                        }
                        break;
                    /*
                     Keywords for objects.
                     */
                    case 'additionalProperties':
                        val = Boolean(obj[k]);
                        obj[k] = val;

                        if (!this.userDefinedOptions.objectsVerbose) {

                            //    if (!UserDefinedOptions.objectsVerbose) {

                            if (val) {
                                // true is default
                                delete obj[k];
                            }
                        }
                        break;
                }

                // General logic.
                // Remove __meta data__ from Code schema, but don't change
                // editable schema.
                let metaKey = k.match(/^__.*__$/g);
                if (metaKey) {
                    delete obj[k];
                }

            }

        }
    };

    getSchemaById(obj, id) {
        // console.log("object: " + obj.__key__ + ', ' + typeof obj);
        for (let k in obj) {
            if (!obj.hasOwnProperty(k)) continue;
            if (typeof obj[k] == "object" && obj[k] !== null) {
                return this.getSchemaById(obj[k], id);
            }

            switch (String(k)) {
                case 'id':
                    if (String(obj[k]) == String(id)) {
                        // console.log('found: ' + obj.__key__);
                        return obj;
                    }
            }
        }
    };

    getSchema(id) {
        return this.getSchemaById(this.editableSchema, id);
    };

    schema4Object(aKey, aValue) {
        // Schema() instance.
        let schema = new Schema(aKey, aValue);


        for (let key in aValue) {
            if (!aValue.hasOwnProperty(key)) continue;
            let value = aValue[key];

            let subSchema = null;
            if (Array.isArray(value) || typeof(value) === 'object') {
                // object, array
                subSchema = this.schema4Object(key, value);
            } else {
                // number, integer, string, null, boolean
                subSchema = new Schema(key, value);
            }
            // This also sets the subSchema parent to schema.
            schema.addSubSchema(subSchema);
        }

        return schema;
    };

    constructSchema(intermediate_schema) {
        let schema = {};

        /*
         Set as many values as possible now.
         */
        this.setSchemaRef(intermediate_schema, schema);
        this.constructId(intermediate_schema, schema);
        this.setType(intermediate_schema, schema);
        // this.makeVerbose(intermediate_schema, schema);
        // this.addRequired(intermediate_schema, schema);

        /*
         Subschemas last.
         Don't actually add any properties or items, just initialize
         the object properties so schema properties and schema items may be added.
         */
        this.initObject(intermediate_schema, schema);
        this.initArray(intermediate_schema, schema);

        // Schemas with no sub-schemas will just skip this loop and
        // return the { } object with values set from before this loop.
        for (let key in intermediate_schema.subSchemas) {
            if (!intermediate_schema.subSchemas.hasOwnProperty(key)) continue;
            let value = intermediate_schema.subSchemas[key];

            // Each sub-schema will need its own {} schema object.
            // Recursive call.
            let subSchema = this.constructSchema(value);
            // console.log('set __parent__', schema.id, schema);
            subSchema.__parent__ = schema.id;

            if (intermediate_schema.isObject()) {
                // console.log('property value.key', value.key);
                schema.properties[value.key] = subSchema;

            } else if (intermediate_schema.isArray()) {

                // TODO: Move to this.initItems()
                switch (this.userDefinedOptions.arrayOptions) {
                    case arrayOptionsEnum.emptySchema:
                        schema.items = getEmptySchema();
                        break;
                    case arrayOptionsEnum.singleSchema:
                        schema.items = subSchema;
                        break;
                    case arrayOptionsEnum.arraySchema:
                        //  Use array of schemas, however, still may only be one.
                        if (intermediate_schema.subSchemas.length > 1) {
                            schema.items.push(subSchema);
                        } else {
                            schema.items = subSchema;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        return schema;
    };

    setType(src, dst) {
        dst.type = src.type;
    };

    initObject(src, dst) {
        if (src.isObject()) {
            dst.properties = {};

            if (!this.userDefinedOptions.additionalProperties) {
                // false is not default, so always show.
                dst.additionalProperties = false;
            } else {
                // true is default so don't show it.
                // Only show if objects are verbose (where default values
                // are shown).
                if (this.userDefinedOptions.objectsVerbose) {
                    dst.additionalProperties = true;
                }
            }
        }
    };

    initArray(src, dst) {
        if (src.isArray()) {
            switch (this.userDefinedOptions.arrayOptions) {
                case arrayOptionsEnum.emptySchema:
                    dst.items = {};
                    break;
                case arrayOptionsEnum.singleSchema:
                    dst.items = {};
                    break;

                case arrayOptionsEnum.arraySchema:
                    dst.items = [];
                    break;
            }

            if (!this.userDefinedOptions.additionalItems) {
                // false is not default, so always show.
                dst.additionalItems = false;
            } else {
                // true is default, only show if objects are verbose.
                if (this.userDefinedOptions.arraysVerbose) {
                    dst.additionalItems = true;
                }
            }
        }
    };

    setSchemaRef(src, dst) {
        if (src.root) {
            // Explicitly declare this JSON as JSON schema.
            dst._$schema = 'http://json-schema.org/draft-04/schema#';
            dst.__root__ = true;
        }
    }

    constructId(src, dst) {
        // if (UserDefithis.userDefinedOptionsnedOptions.absoluteIds) {
        //     if (src.root) {
        //         dst.id = this.userDefinedOptions.url;
        //     } else {
        //         /*
        //          First time round, this will the child of root and will
        //          be: (http://jsonschema.net + '/' + address)
        //          */
        //         let asboluteId = (src.parent.id + '/' + src.id);
        //         dst.id = asboluteId;
        //
        //         // We MUST set the parent ID to the ABSOLUTE URL
        //         // so when the child builds upon it, it too is an
        //         // absolute URL.
        //         /*
        //          The current object will be a parent later on. By setting
        //          src.id now, any children of this object will call
        //          src.parent.id when constructing the absolute ID.
        //          */
        //         src.id = asboluteId;
        //     }
        // } else {
        if (src.root) {
            dst.id = '/';
        } else {
            dst.id = src.id;
        }
        // }

        dst.__key__ = src.key;
    };

    addRequired(src, dst) {
        dst.__required__ = this.userDefinedOptions.forceRequired;
    };
}

module.exports = function (json, options) {
    let schemaFactory = new SchemaFactory(json, options);
    return schemaFactory.schemalize();

};
