"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Confirmation;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var AntIcons = _interopRequireWildcard(require("@ant-design/icons"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _jsonata = _interopRequireDefault(require("jsonata"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const handleStateChange = (events, failureEvents, currentEventData, setEventData) => (susbcriptioId, topic, eventData) => {
  if (eventData && eventData.value && events) {
    const event = eventData.value;
    let matchingState = events.find(s => s === event);
    let result;
    if (matchingState) {
      result = 'success';
    } else if (failureEvents) {
      matchingState = failureEvents.find(s => s === event);
      if (matchingState) {
        result = 'failure';
      }
    }
    if (matchingState) {
      setEventData(currentEventData ? {
        ...currentEventData,
        ...eventData,
        result
      } : {
        ...eventData,
        result
      });
    }
  }
};
const sendEvent = (topic, data) => {
  if (topic && topic !== '') {
    const body = {
      data: data || {}
    };
    if (topic.startsWith('WF.')) {
      const workflowTopicParts = topic.split('.');
      _componentMessageBus.MessageBus.send(topic, {
        header: {
          registrationId: workflowTopicParts[1],
          workflow: workflowTopicParts[1],
          eventType: workflowTopicParts[2]
        },
        body
      });
    } else {
      _componentMessageBus.MessageBus.send(topic, body);
    }
  }
};
function Confirmation(props) {
  const {
    Title,
    Paragraph
  } = _antd.Typography;
  const {
    params,
    data,
    asyncData,
    workflow,
    context = {}
  } = props;
  const {
    icon,
    message,
    title,
    description,
    justify = 'center',
    align = 'middle',
    span = 4,
    loadingTitle,
    successEvents,
    failureEvents = [],
    failureIcon,
    failureMessage,
    failureObject,
    failureDescription,
    buttonText,
    buttonEvents
  } = params;
  const [loading, setLoading] = (0, _react.useState)(successEvents || false);
  const [eventData, setEventData] = (0, _react.useState)(undefined);
  const CheckIcon = AntIcons[icon];
  const FailureIcon = AntIcons[failureIcon || icon];
  (0, _react.useEffect)(() => {
    _componentMessageBus.MessageBus.subscribe(workflow.concat('.confirmation'), 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleStateChange(successEvents, failureEvents, eventData, setEventData));
    return () => {
      _componentMessageBus.MessageBus.unsubscribe(workflow.concat('.confirmation'));
    };
  }, []);
  (0, _react.useEffect)(() => {
    if (eventData) {
      setLoading(false);
    }
  }, [eventData]);
  const evaluationData = eventData ? {
    ...eventData,
    ...context
  } : context;
  return /*#__PURE__*/_react.default.createElement(_antd.Row, {
    justify: justify,
    align: align
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: span
  }, /*#__PURE__*/_react.default.createElement(_antd.Spin, {
    spinning: loading
  }, /*#__PURE__*/_react.default.createElement(_antd.Card, {
    className: "confirmation"
  }, eventData && eventData.result === 'failure' ? /*#__PURE__*/_react.default.createElement(FailureIcon, {
    className: "failureIcon"
  }) : /*#__PURE__*/_react.default.createElement(CheckIcon, {
    className: "icon"
  }), /*#__PURE__*/_react.default.createElement(Title, {
    level: 4
  }, loading ? loadingTitle : (0, _jsonata.default)(title).evaluate(evaluationData)), !loading && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, description && eventData.result === 'success' && /*#__PURE__*/_react.default.createElement(Paragraph, null, (0, _jsonata.default)(description).evaluate(evaluationData)), failureDescription && eventData.result === 'failure' && /*#__PURE__*/_react.default.createElement(Paragraph, null, (0, _jsonata.default)(failureDescription).evaluate(evaluationData)), message && eventData.result === 'success' && /*#__PURE__*/_react.default.createElement(Title, {
    type: "success",
    level: 3
  }, (0, _jsonata.default)(message).evaluate(evaluationData)), failureMessage && eventData.result === 'failure' && /*#__PURE__*/_react.default.createElement(Title, {
    type: "failure",
    level: 3
  }, evaluationData?.event?.data[failureObject]?.data?.causedBy[0]?.message), buttonText && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    onClick: () => (0, _jsonata.default)(buttonEvents).evaluate(evaluationData).forEach(be => sendEvent(be, evaluationData))
  }, (0, _jsonata.default)(buttonText).evaluate(evaluationData))))))));
}
module.exports = exports.default;