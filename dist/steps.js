"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Stepper;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _reactRouterDom = require("react-router-dom");
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _componentBreadcrumb = _interopRequireDefault(require("@ivoyant/component-breadcrumb"));
var Icons = _interopRequireWildcard(require("@ant-design/icons"));
var _jsPlugin = _interopRequireDefault(require("js-plugin"));
var _confirmation = _interopRequireDefault(require("./confirmation"));
var _jsonata = _interopRequireDefault(require("jsonata"));
var _componentLinkButton = _interopRequireDefault(require("@ivoyant/component-link-button"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Step
} = _antd.Steps;
const {
  Title,
  Text
} = _antd.Typography;
const getSkelelton = () => {
  return /*#__PURE__*/_react.default.createElement(_antd.Space, null, /*#__PURE__*/_react.default.createElement(_antd.Skeleton.Button, {
    active: true,
    size: 'small',
    shape: 'default'
  }), /*#__PURE__*/_react.default.createElement(_antd.Skeleton.Button, {
    active: true,
    size: 'small',
    shape: 'default'
  }), /*#__PURE__*/_react.default.createElement(_antd.Skeleton.Avatar, {
    active: true,
    size: 'small',
    shape: 'square'
  }), /*#__PURE__*/_react.default.createElement(_antd.Skeleton.Input, {
    style: {
      width: 200
    },
    active: true,
    size: 'small'
  }));
};
const handleStateChange = (states, setCurrent, eventsToMatch, setEventMatched) => (susbcriptioId, topic, eventData) => {
  if (eventData && eventData.value && states) {
    const event = eventData.value;
    if (eventsToMatch.includes(event)) {
      setEventMatched(true);
    }
    const matchingState = states.find(s => s.state === event);
    if (matchingState) {
      setCurrent(matchingState.step - 1);
    }
  }
};
const getFeatureData = featureFlagKey => {
  const featureFlag = _jsPlugin.default.invoke('features.evaluate', featureFlagKey);
  return featureFlag[0];
};
function Stepper(props) {
  function usePrevious(value) {
    const ref = (0, _react.useRef)();
    (0, _react.useEffect)(() => {
      ref.current = value;
    });
    return ref.current;
  }
  const {
    properties,
    children,
    component,
    parentProps,
    data,
    context = {}
  } = props;
  const ebbQualifiedPlans = data?.data?.ebbQualifiedPlans?.ebbQualifiedPlans;
  const ebbDetails = data?.data?.ebbDetails;
  const userMessages = data?.data?.userMessages?.userMessages;
  const {
    title,
    breadcrumbs,
    progressDot = false,
    direction = 'horizontal',
    size = 'small',
    buttonAlign = 'start',
    stepperColor = '#52C41A',
    checkForEbbQualified = false,
    ebbWarningModal = {},
    steps,
    workflow,
    exitEvent,
    states,
    datasources,
    featureFlag,
    type = 'default',
    clickable = false
  } = properties;
  const featureFlagParams = featureFlag?.key && getFeatureData(featureFlag?.key);
  const isComponentStepsDisabled = featureFlag?.key && !featureFlagParams?.enabled;
  const {
    childComponents
  } = component;
  const [current, setCurrent] = (0, _react.useState)(undefined);
  const [completedSteps, setCompletedSteps] = (0, _react.useState)([]);
  const [eventMatched, setEventMatched] = (0, _react.useState)(false);
  const location = (0, _reactRouterDom.useLocation)();
  const prevResult = usePrevious({
    current
  });
  const [showEbbQualifiedWarning, setShowEbbQualifiedWarning] = (0, _react.useState)(false);
  const confirmationProps = {
    params: {
      title: 'Test'
    },
    styles: {}
  };
  const breadCrumbTitle = title ? {
    ...title
  } : undefined;
  if (breadCrumbTitle?.textExpr && location.state?.src) {
    breadCrumbTitle.text = (0, _jsonata.default)(breadCrumbTitle?.textExpr).evaluate({
      src: location.state?.src
    });
  }
  let shouldShowPopUpForEBB = false;
  const handleOkForEbbQualifiedWarning = () => {
    setShowEbbQualifiedWarning(false);
    // remove src from the history/location state object
    window.history.replaceState({
      routeData: window?.history?.state?.state?.routeData
    }, document.title);
  };
  (0, _react.useEffect)(() => {
    if (checkForEbbQualified && ebbQualifiedPlans.length > 0 && location?.state?.routeData?.[0].plan.currentRatePlan?.length > 0 && window?.history?.state?.state?.hasOwnProperty('src')) {
      const ebbData = ebbDetails?.associations?.find(_ref => {
        let {
          type
        } = _ref;
        return type === 'Subscriber';
      });
      const ebbLine = ebbDetails?.associations?.find(_ref2 => {
        let {
          type
        } = _ref2;
        return type === 'BroadbandBenefit';
      })?.id;
      const ebbPlanMatch = ebbQualifiedPlans?.find(ebbPlan => location?.state?.routeData?.[0]?.plan?.currentRatePlan?.find(currentPlan => currentPlan?.soc === ebbPlan?.name));
      let shouldShowPopUpForEBB = ebbPlanMatch && ebbLine === location?.state?.routeData?.[0]?.telephoneData?.telephoneNumber;
      if (shouldShowPopUpForEBB) {
        setShowEbbQualifiedWarning(true);
      }
    }
  }, []);
  const getStepChild = stepIdx => {
    if (steps[stepIdx]?.type === 'confirmation') {
      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_confirmation.default, {
        params: steps[stepIdx].params,
        workflow: workflow,
        data: data,
        context: context
      }));
    }
    const matchingChildComponent = childComponents.find(cc => cc.stepIndex === stepIdx + 1);
    const childToClone = matchingChildComponent ? children.find(child => child?.props?.component?.id === matchingChildComponent.id) : null;
    if (childToClone) {
      const child = /*#__PURE__*/_react.default.cloneElement(childToClone, {
        parentProps: props,
        routeData: location.state?.routeData,
        routeContext: {
          src: location.state?.src
        }
      });
      const enableOnEvents = steps[stepIdx]?.enableOnEvents;
      return enableOnEvents ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, eventMatched ? child : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, getSkelelton(), /*#__PURE__*/_react.default.createElement("br", null), getSkelelton())) : child;
    }
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", null, "Content not configured"));
  };
  const getIcon = (icon, index) => {
    const SelectedIcon = Icons[icon];
    return /*#__PURE__*/_react.default.createElement(SelectedIcon, {
      style: current >= index ? {
        color: stepperColor,
        fontSize: 'xx-large'
      } : {
        color: 'gray',
        fontSize: 'xx-large'
      }
    });
  };
  const getSteps = () => {
    return steps.map((step, idx) => /*#__PURE__*/_react.default.createElement(Step, {
      title: /*#__PURE__*/_react.default.createElement("div", {
        className: "step-title"
      }, step?.icon && getIcon(step.icon, idx), /*#__PURE__*/_react.default.createElement("div", {
        className: "step-title-text"
      }, /*#__PURE__*/_react.default.createElement(Text, {
        disabled: true
      }, step.title), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(Title, {
        level: 5
      }, step.subTitle.toUpperCase())))
    }));
  };
  const onChange = newStep => {
    if (clickable && completedSteps.indexOf(newStep) != -1) {
      setCurrent(newStep);
    }
  };
  (0, _react.useEffect)(() => {
    if (current === undefined) {
      setCurrent(0);
    }
    if (current) {
      if (completedSteps.indexOf(current) != -1) {
        const newCompletedSteps = [];
        newCompletedSteps.push(completedSteps);
        newCompletedSteps.push(current);
        setCompletedSteps(newCompletedSteps);
      }
    }
    if (prevResult?.current !== undefined && prevResult?.current !== current) {
      setEventMatched(steps[current]?.enableOnEvents === undefined);
    }
    if (prevResult?.current === undefined && current === 0) {
      setEventMatched(steps[current]?.enableOnEvents === undefined);
      const eventsToMatch = [];
      steps.forEach(step => {
        if (step?.enableOnEvents) {
          eventsToMatch.push(...step.enableOnEvents);
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleStateChange(states, setCurrent, eventsToMatch, setEventMatched));
      const body = {
        data: data?.data,
        routeData: location.state?.routeData,
        routeContext: {
          src: location.state?.src
        },
        context
      };
      if (datasources) {
        const endPointDefs = props?.datasources || parentProps?.datasources;
        body.datasources = datasources.map(ds => endPointDefs[ds]);
      }
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: 'INIT'
        },
        body
      });
    }
  }, [current]);
  (0, _react.useEffect)(() => {
    return () => {
      _componentMessageBus.MessageBus.unsubscribe(workflow);
      if (current < steps.length - 1) {
        _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.CANCEL'), {
          header: {
            registrationId: workflow,
            workflow,
            eventType: 'CANCEL'
          }
        });
      }
      if (exitEvent) {
        _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(exitEvent), {
          header: {
            registrationId: workflow,
            workflow,
            eventType: exitEvent
          }
        });
      }
    };
  }, []);
  const setPosition = action => {
    switch (action) {
      case 'next':
        setCurrent(current + 1);
        break;
      case 'prev':
        setCurrent(current - 1);
        break;
      case 'reset':
        setCurrent(0);
        break;
      default:
    }
  };
  const setNext = () => {
    setCurrent(current + 1);
  };
  const getButtons = () => {
    if (current) {
      return /*#__PURE__*/_react.default.createElement(_antd.Row, {
        justify: buttonAlign
      }, steps[current].buttons && steps[current].buttons.map(button => /*#__PURE__*/_react.default.createElement(_antd.Col, {
        span: button.props.span,
        offset: button.props.offset || 0
      }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
        onClick: () => setPosition(button.action),
        form: button.props.form
      }, button.props.text))));
    }
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (breadcrumbs || breadCrumbTitle) && /*#__PURE__*/_react.default.createElement(_componentBreadcrumb.default, {
    title: breadCrumbTitle,
    breadcrumbs: breadcrumbs
  }), isComponentStepsDisabled ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: `${featureFlag?.title || featureFlag?.key} is disabled ${featureFlagParams?.reasons?.length > 0 ? `due to ${featureFlagParams?.reasons.toString()}` : ''}`,
    type: "info",
    showIcon: true
  })) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    open: showEbbQualifiedWarning,
    onOk: handleOkForEbbQualifiedWarning,
    onCancel: handleOkForEbbQualifiedWarning,
    footer: [/*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      key: "back",
      onClick: () => handleOkForEbbQualifiedWarning()
    }, "Yes"), ",", /*#__PURE__*/_react.default.createElement(_componentLinkButton.default, {
      size: "small",
      href: ebbWarningModal?.link,
      type: "text"
    }, /*#__PURE__*/_react.default.createElement(_antd.Button, null, "Cancel")))],
    closable: false
  }, /*#__PURE__*/_react.default.createElement("p", null, userMessages && userMessages.find(row => row.name == ebbWarningModal?.warningMessageKeyName)?.message || 'This subscriber is in a restricted promo period.')), /*#__PURE__*/_react.default.createElement(_antd.Steps, {
    progressDot: progressDot,
    direction: direction,
    size: size,
    current: current,
    labelPlacement: "horizontal",
    type: type
  }, getSteps()), /*#__PURE__*/_react.default.createElement("div", {
    className: "steps-content"
  }, getStepChild(current)), /*#__PURE__*/_react.default.createElement("div", {
    className: "steps-action"
  }, getButtons())));
}
module.exports = exports.default;