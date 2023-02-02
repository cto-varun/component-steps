import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Spin, Button } from 'antd';
import * as AntIcons from '@ant-design/icons';
import { MessageBus } from '@ivoyant/component-message-bus';
import jsonata from 'jsonata';
import './styles.css';

const handleStateChange = (
    events,
    failureEvents,
    currentEventData,
    setEventData
) => (susbcriptioId, topic, eventData) => {
    if (eventData && eventData.value && events) {
        const event = eventData.value;
        let matchingState = events.find((s) => s === event);
        let result;
        if (matchingState) {
            result = 'success';
        } else if (failureEvents) {
            matchingState = failureEvents.find((s) => s === event);
            if (matchingState) {
                result = 'failure';
            }
        }
        if (matchingState) {
            setEventData(
                currentEventData
                    ? { ...currentEventData, ...eventData, result }
                    : { ...eventData, result }
            );
        }
    }
};

const sendEvent = (topic, data) => {
    if (topic && topic !== '') {
        const body = {
            data: data || {},
        };

        if (topic.startsWith('WF.')) {
            const workflowTopicParts = topic.split('.');
            MessageBus.send(topic, {
                header: {
                    registrationId: workflowTopicParts[1],
                    workflow: workflowTopicParts[1],
                    eventType: workflowTopicParts[2],
                },
                body,
            });
        } else {
            MessageBus.send(topic, body);
        }
    }
};

export default function Confirmation(props) {
    const { Title, Paragraph } = Typography;
    const { params, data, asyncData, workflow, context = {} } = props;

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
        buttonEvents,
    } = params;
    const [loading, setLoading] = useState(successEvents || false);
    const [eventData, setEventData] = useState(undefined);
    const CheckIcon = AntIcons[icon];
    const FailureIcon = AntIcons[failureIcon || icon];

    useEffect(() => {
        MessageBus.subscribe(
            workflow.concat('.confirmation'),
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleStateChange(
                successEvents,
                failureEvents,
                eventData,
                setEventData
            )
        );
        return () => {
            MessageBus.unsubscribe(workflow.concat('.confirmation'));
        };
    }, []);

    useEffect(() => {
        if (eventData) {
            setLoading(false);
        }
    }, [eventData]);

    const evaluationData = eventData ? { ...eventData, ...context } : context;

    return (
        <Row justify={justify} align={align}>
            <Col span={span}>
                <Spin spinning={loading}>
                    <Card className="confirmation">
                        {eventData && eventData.result === 'failure' ? (
                            <FailureIcon className="failureIcon" />
                        ) : (
                            <CheckIcon className="icon" />
                        )}
                        <Title level={4}>
                            {loading
                                ? loadingTitle
                                : jsonata(title).evaluate(evaluationData)}
                        </Title>
                        {!loading && (
                            <>
                                {description &&
                                    eventData.result === 'success' && (
                                        <Paragraph>
                                            {jsonata(description).evaluate(
                                                evaluationData
                                            )}
                                        </Paragraph>
                                    )}
                                {failureDescription &&
                                    eventData.result === 'failure' && (
                                        <Paragraph>
                                            {jsonata(
                                                failureDescription
                                            ).evaluate(evaluationData)}
                                        </Paragraph>
                                    )}
                                {message && eventData.result === 'success' && (
                                    <Title type="success" level={3}>
                                        {jsonata(message).evaluate(
                                            evaluationData
                                        )}
                                    </Title>
                                )}

                                {failureMessage &&
                                    eventData.result === 'failure' && (
                                        <Title type="failure" level={3}>
                                            {evaluationData?.event?.data[failureObject]?.data?.causedBy[0]?.message}
                                        </Title>
                                    )}

                                {buttonText && (
                                    <div>
                                        <Button
                                            onClick={() =>
                                                jsonata(buttonEvents)
                                                    .evaluate(evaluationData)
                                                    .forEach((be) =>
                                                        sendEvent(
                                                            be,
                                                            evaluationData
                                                        )
                                                    )
                                            }
                                        >
                                            {jsonata(buttonText).evaluate(
                                                evaluationData
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </Spin>
            </Col>
        </Row>
    );
}
