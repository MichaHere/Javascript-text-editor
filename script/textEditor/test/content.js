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
      "position": 50,
      "content_type": "break",
      "break": "ordered_list"
    },
    {
      "type": "delete",
      "position": 22,
      "count": 3,
    },
    {
      "type": "delete",
      "position": 29,
      "count": 3
    },
    {
      "type": "delete",
      "position": 36,
      "count": 6
    },
    {
      "type": "insert",
      "position": 51,
      "content_type": "text",
      "text": "one",
      "format": []
    },
    {
      "type": "insert",
      "position": 54,
      "content_type": "break",
      "break": "ordered_list"
    },
    {
      "type": "insert",
      "position": 1,
      "content_type": "text",
      "text": "Hello",
      "format": [
        "bold"
      ]
    },
    {
      "type": "insert",
      "position": 55,
      "content_type": "text",
      "text": "two",
      "format": [
        "italic",
        "bold"
      ]
    },
    {
      "type": "insert",
      "position": 58,
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
      "position": 59,
      "content_type": "text",
      "text": "The end",
      "format": []
    },
    {
      "type": "insert",
      "position": 9,
      "content_type": "text",
      "text": " insertion ",
      "format": []
    },
    {
      "type": "insert",
      "position": 25,
      "content_type": "text",
      "text": " bold ",
      "format": []
    }
  ]
}

export default sample_delta;