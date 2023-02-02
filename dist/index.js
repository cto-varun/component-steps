"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _steps = _interopRequireDefault(require("./steps"));
var _steps2 = require("./steps.schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  component: _steps.default,
  schema: _steps2.schema,
  ui: _steps2.ui
};
exports.default = _default;
module.exports = exports.default;