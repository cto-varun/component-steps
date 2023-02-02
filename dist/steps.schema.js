"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ui = exports.schema = void 0;
const schema = {
  title: 'Template settings',
  type: 'object',
  required: [],
  properties: {
    styles: {
      title: 'CSS Styles',
      type: 'string',
      default: ''
    }
  }
};
exports.schema = schema;
const ui = {
  styles: {
    'ui:widget': 'textarea'
  }
};
exports.ui = ui;