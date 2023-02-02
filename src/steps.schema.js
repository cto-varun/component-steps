export const schema = {
    title: 'Template settings',
    type: 'object',
    required: [],
    properties: {
        styles: {
            title: 'CSS Styles',
            type: 'string',
            default: '',
        },
    },
};

export const ui = {
    styles: {
        'ui:widget': 'textarea',
    },
};
