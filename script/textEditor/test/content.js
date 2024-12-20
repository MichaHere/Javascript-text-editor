// Maybe use AI to generate some more examples

var sample_delta = {
    input_1: [
        {
            "type": "insert",
            "position": 0,
            "content_type": "break",
            "break": "paragraph"
        },
        {
            "type": "insert",
            "position": 6,
            "content_type": "break",
            "break": "line"
        },
        
        {
            "type": "insert",
            "position": 33,
            "content_type": "break",
            "break": "ordered_list"
        },
        {
            "type": "delete",
            "position": 29,
            "count": 6
        },
        {
            "type": "delete",
            "position": 36,
            "count": 3
        },
        {
            "type": "insert",
            "position": 34,
            "content_type": "text",
            "text": "one",
            "format": []
        },
        {
            "type": "insert",
            "position": 37,
            "content_type": "break",
            "break": "ordered_list"
        },
        {
            "type": "insert",
            "position": 1,
            "content_type": "text",
            "text": "Hello",
            "format": ["bold"]
        },
        {
            "type": "insert",
            "position": 38,
            "content_type": "text",
            "text": "two",
            "format": ["italic", "bold"]
        },
        {
            "type": "insert",
            "position": 41,
            "content_type": "break",
            "break": "paragraph"
        },
        {
            "type": "insert",
            "position": 7,
            "content_type": "text",
            "text": "This is a second paragraph",
            "format": []
        },
        {
            "type": "insert",
            "position": 42,
            "content_type": "text",
            "text": "The end",
            "format": []
        }
    ]
}

export default sample_delta;