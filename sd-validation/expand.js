/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const {URL} = require('url');
const jsonld = require('jsonld');
// @ts-ignore
const schemaOrgContext = require('./assets/jsonldcontext.json');
const SCHEMA_ORG_HOST = 'schema.org';

/**
 * Custom loader that prevents network calls and allows us to return local version of the
 * schema.org document
 * @param {string} schemaUrl
 * @param {function(null|Error, Object|undefined):void} callback
 */
function documentLoader(schemaUrl, callback) {
  let urlObj = null;

  try {
    urlObj = new URL(schemaUrl, 'http://example.com');
  } catch (e) {
    return callback(Error('Error parsing URL: ' + schemaUrl), undefined);
  }

  if (urlObj && urlObj.host === SCHEMA_ORG_HOST && urlObj.pathname === '/') {
    callback(null, {
      document: schemaOrgContext,
    });
  } else {
    // We only process schema.org, for other schemas we return an empty object
    callback(null, {
      document: {},
    });
  }
}

/**
 * Takes JSON-LD object and normalizes it by following the expansion algorithm
 * (https://json-ld.org/spec/latest/json-ld-api/#expansion).
 *
 * @param {Object} inputObject
 * @returns {Promise<Object>}
 */
module.exports = async function expand(inputObject) {
  try {
    return await jsonld.expand(inputObject, {documentLoader});
  } catch (err) {
    // jsonld wraps real errors in a bunch of junk, so see we have an underlying error first
    if (err.details && err.details.cause) throw err.details.cause;
    throw err;
  }
};