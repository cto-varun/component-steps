import React, { useState, useEffect, useRef } from 'react';
import {
    Alert,
    Skeleton,
    Space,
    Steps,
    Row,
    Col,
    Button,
    Modal,
    Typography,
} from 'antd';
import { useLocation } from 'react-router-dom';
import { MessageBus } from '@ivoyant/component-message-bus';

import BreadCrumb from '@ivoyant/component-breadcrumb';
import * as Icons from '@ant-design/icons';
import plugin from 'js-plugin';
import Confirmation from './confirmation';
import jsonata from 'jsonata';
import LinkButton from '@ivoyant/component-link-button';

import './styles.css';

const { Step } = Steps;
const { Title, Text } = Typography;

const getSkelelton = () => {
    return (
        <Space>
            <Skeleton.Button active={true} size={'small'} shape={'default'} />
            <Skeleton.Button active={true} size={'small'} shape={'default'} />
            <Skeleton.Avatar active={true} size={'small'} shape={'square'} />
            <Skeleton.Input
                style={{ width: 200 }}
                active={true}
                size={'small'}
            />
        </Space>
    );
};

const handleStateChange = (
    states,
    setCurrent,
    eventsToMatch,
    setEventMatched
) => (susbcriptioId, topic, eventData) => {
    if (eventData && eventData.value && states) {
        const event = eventData.value;
        if (eventsToMatch.includes(event)) {
            setEventMatched(true);
        }
        const matchingState = states.find((s) => s.state === event);
        if (matchingState) {
            setCurrent(matchingState.step - 1);
        }
    }
};

const getFeatureData = (featureFlagKey) => {
    const featureFlag = plugin.invoke('features.evaluate', featureFlagKey);
    return featureFlag[0];
};

export default function Stepper(props) {
    function usePrevious(value) {
        const ref = useRef();
        useEffect(() => {
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
        context = {},
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
        clickable = false,
    } = properties;

    const featureFlagParams =
        featureFlag?.key && getFeatureData(featureFlag?.key);
    const isComponentStepsDisabled =
        featureFlag?.key && !featureFlagParams?.enabled;

    const { childComponents } = component;
    const [current, setCurrent] = useState(undefined);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [eventMatched, setEventMatched] = useState(false);
    const location = useLocation();
    const prevResult = usePrevious({ current });
    const [showEbbQualifiedWarning, setShowEbbQualifiedWarning] = useState(
        false
    );

    const confirmationProps = { params: { title: 'Test' }, styles: {} };

    const breadCrumbTitle = title ? { ...title } : undefined;

    if (breadCrumbTitle?.textExpr && location.state?.src) {
        breadCrumbTitle.text = jsonata(breadCrumbTitle?.textExpr).evaluate({
            src: location.state?.src,
        });
    }

    let shouldShowPopUpForEBB = false;

    const handleOkForEbbQualifiedWarning = () => {
        setShowEbbQualifiedWarning(false);
        // remove src from the history/location state object
        window.history.replaceState(
            { routeData: window?.history?.state?.state?.routeData },
            document.title
        );
    };

    useEffect(() => {
        if (
            checkForEbbQualified &&
            ebbQualifiedPlans.length > 0 &&
            location?.state?.routeData?.[0].plan.currentRatePlan?.length > 0 &&
            window?.history?.state?.state?.hasOwnProperty('src')
        ) {
            const ebbData = ebbDetails?.associations?.find(
                ({ type }) => type === 'Subscriber'
            );
            const ebbLine = ebbDetails?.associations?.find(
                ({ type }) => type === 'BroadbandBenefit'
            )?.id;

            const ebbPlanMatch = ebbQualifiedPlans?.find((ebbPlan) =>
                location?.state?.routeData?.[0]?.plan?.currentRatePlan?.find(
                    (currentPlan) => currentPlan?.soc === ebbPlan?.name
                )
            );

            let shouldShowPopUpForEBB =
                ebbPlanMatch &&
                ebbLine ===
                    location?.state?.routeData?.[0]?.telephoneData
                        ?.telephoneNumber;

            if (shouldShowPopUpForEBB) {
                setShowEbbQualifiedWarning(true);
            }
        }
    }, []);

    const getStepChild = (stepIdx) => {
        if (steps[stepIdx]?.type === 'confirmation') {
            return (
                <div>
                    <Confirmation
                        params={steps[stepIdx].params}
                        workflow={workflow}
                        data={data}
                        context={context}
                    />
                </div>
            );
        }
        const matchingChildComponent = childComponents.find(
            (cc) => cc.stepIndex === stepIdx + 1
        );

        const childToClone = matchingChildComponent
            ? children.find(
                  (child) =>
                      child?.props?.component?.id === matchingChildComponent.id
              )
            : null;

        if (childToClone) {
            const child = React.cloneElement(childToClone, {
                parentProps: props,
                routeData: location.state?.routeData,
                routeContext: { src: location.state?.src },
            });

            const enableOnEvents = steps[stepIdx]?.enableOnEvents;

            return enableOnEvents ? (
                <>
                    {eventMatched ? (
                        child
                    ) : (
                        <>
                            {getSkelelton()}
                            <br />
                            {getSkelelton()}
                        </>
                    )}
                </>
            ) : (
                child
            );
        }

        return (
            <div>
                <span>Content not configured</span>
            </div>
        );
    };

    const getIcon = (icon, index) => {
        const SelectedIcon = Icons[icon];
        return (
            <SelectedIcon
                style={
                    current >= index
                        ? { color: stepperColor, fontSize: 'xx-large' }
                        : { color: 'gray', fontSize: 'xx-large' }
                }
            />
        );
    };

    const getSteps = () => {
        return steps.map((step, idx) => (
            <Step
                title={
                    <div className="step-title">
                        {step?.icon && getIcon(step.icon, idx)}
                        <div className="step-title-text">
                            <Text disabled>{step.title}</Text>
                            <br />
                            <Title level={5}>
                                {step.subTitle.toUpperCase()}
                            </Title>
                        </div>
                    </div>
                }
            />
        ));
    };

    const onChange = (newStep) => {
        if (clickable && completedSteps.indexOf(newStep) != -1) {
            setCurrent(newStep);
        }
    };

    useEffect(() => {
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

        if (
            prevResult?.current !== undefined &&
            prevResult?.current !== current
        ) {
            setEventMatched(steps[current]?.enableOnEvents === undefined);
        }

        if (prevResult?.current === undefined && current === 0) {
            setEventMatched(steps[current]?.enableOnEvents === undefined);
            const eventsToMatch = [];
            steps.forEach((step) => {
                if (step?.enableOnEvents) {
                    eventsToMatch.push(...step.enableOnEvents);
                }
            });

            MessageBus.subscribe(
                workflow,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleStateChange(
                    states,
                    setCurrent,
                    eventsToMatch,
                    setEventMatched
                )
            );

            const body = {
                data: data?.data,
                routeData: location.state?.routeData,
                routeContext: { src: location.state?.src },
                context,
            };

            if (datasources) {
                const endPointDefs =
                    props?.datasources || parentProps?.datasources;
                body.datasources = datasources.map((ds) => endPointDefs[ds]);
            }
            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: 'INIT',
                },
                body,
            });
        }
    }, [current]);

    useEffect(() => {
        return () => {
            MessageBus.unsubscribe(workflow);

            if (current < steps.length - 1) {
                MessageBus.send('WF.'.concat(workflow).concat('.CANCEL'), {
                    header: {
                        registrationId: workflow,
                        workflow,
                        eventType: 'CANCEL',
                    },
                });
            }

            if (exitEvent) {
                MessageBus.send(
                    'WF.'.concat(workflow).concat('.').concat(exitEvent),
                    {
                        header: {
                            registrationId: workflow,
                            workflow,
                            eventType: exitEvent,
                        },
                    }
                );
            }
        };
    }, []);

    const setPosition = (action) => {
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
            return (
                <Row justify={buttonAlign}>
                    {steps[current].buttons &&
                        steps[current].buttons.map((button) => (
                            <Col
                                span={button.props.span}
                                offset={button.props.offset || 0}
                            >
                                <Button
                                    onClick={() => setPosition(button.action)}
                                    form={button.props.form}
                                >
                                    {button.props.text}
                                </Button>
                            </Col>
                        ))}
                </Row>
            );
        }
        return <></>;
    };

    return (
        <>
            {(breadcrumbs || breadCrumbTitle) && (
                <BreadCrumb title={breadCrumbTitle} breadcrumbs={breadcrumbs} />
            )}

            {isComponentStepsDisabled ? (
                <>
                    <Alert
                        message={`${
                            featureFlag?.title || featureFlag?.key
                        } is disabled ${
                            featureFlagParams?.reasons?.length > 0
                                ? `due to ${featureFlagParams?.reasons.toString()}`
                                : ''
                        }`}
                        type="info"
                        showIcon
                    />
                </>
            ) : (
                <>
                    <Modal
                        open={showEbbQualifiedWarning}
                        onOk={handleOkForEbbQualifiedWarning}
                        onCancel={handleOkForEbbQualifiedWarning}
                        footer={[
                            <>
                                <Button
                                    key="back"
                                    onClick={() =>
                                        handleOkForEbbQualifiedWarning()
                                    }
                                >
                                    Yes
                                </Button>
                                ,
                                <LinkButton
                                    size="small"
                                    href={ebbWarningModal?.link}
                                    type="text"
                                >
                                    <Button>Cancel</Button>
                                </LinkButton>
                            </>,
                        ]}
                        closable={false}
                    >
                        <p>
                            {(userMessages &&
                                userMessages.find(
                                    (row) =>
                                        row.name ==
                                        ebbWarningModal?.warningMessageKeyName
                                )?.message) ||
                                'This subscriber is in a restricted promo period.'}
                        </p>
                    </Modal>
                    <Steps
                        progressDot={progressDot}
                        direction={direction}
                        size={size}
                        current={current}
                        labelPlacement="horizontal"
                        type={type}
                    >
                        {getSteps()}
                    </Steps>
                    <div className="steps-content">{getStepChild(current)}</div>
                    <div className="steps-action">{getButtons()}</div>
                </>
            )}
        </>
    );
}
