function removeAt(index, count, string) {
    return string.slice(0, index) + string.slice(index + count);
}

class Delta {
    constructor(operations = []) {
        this.operations = operations;

        this.formats = {
            "bold": {
                "tags": ["strong"],
                "mergeIndex": [0],
            },
            "italic": {
                "tags": ["i"],
                "mergeIndex": [0],
            }
        }

        this.blocks = {
            "paragraph": {
                "tags": ["p"],
                "mergeIndex": [],
            },
            "ordered_list": {
                "tags": ["ol", "li"],
                "mergeIndex": [0],
            },
            "unordered_list": {
                "tags": ["ul", "li"],
                "mergeIndex": [0],
            },
        }
    }

    get_HTML_tags(tags) {
        var start = "";
        var end = "";

        for (let tag of tags) {
            start = start + `<${tag}>`;
            end = `</${tag}>` + end;
        }

        return {
            "start": start,
            "end": end,
        }
    }

    filter_operations(type, delta = this) {
        return delta.operations.reduce((output, operation, index) => {
            if (operation.type === type) {
                output.push(index);
            }
            return output;
        }, [])
    }

    get_closest_integer(goal, array) {
        return array.reduce((previous, current) => {
            return (current > goal) ? previous : current
        })
    }

    apply_delete(operation_index, delta = this) {
        var delete_operation = delta.operations[operation_index];
        var insert_indexes = this.filter_operations("insert", delta);
        var closest_insert = this.get_closest_integer(operation_index, insert_indexes)
        
        let total_delete_count = delete_operation.count;
        for (let i = insert_indexes.indexOf(closest_insert); i < insert_indexes.length; i++) {
            let index = insert_indexes[i];
            let insert_operation = delta.operations[index];
            let delete_position = Math.max(0, delete_operation.position - insert_operation.position);

            if (insert_operation.content_type === "text") {
                let delete_count = insert_operation.text.length - delete_position;
                if (total_delete_count <= delete_count) {
                    insert_operation.text = removeAt(delete_position, total_delete_count, insert_operation.text);
                    break;
                };

                insert_operation.text = removeAt(delete_position, total_delete_count, insert_operation.text);
                total_delete_count = total_delete_count - delete_count;
            }

            if (insert_operation.content_type === "break") {
                /*FIX:
                The paragraph becomes a list item */
                i--;
                total_delete_count--;
                delta.operations.splice(index, 1);
            }
        }

        delta.operations.splice(operation_index, 1);
    }

    apply_operations(delta = this) {


        /* TODO:
        Applies the delete operations, leaving only insert operations in order,  
        in as much as that the position property does not matter. */

        delta.operations.sort((a, b) => {
            return parseFloat(a.position) - parseFloat(b.position);
        })

        var delete_operation_indexes = this.filter_operations("delete", delta);

        for (let i = 0; i < delete_operation_indexes.length; i++) {
            let delete_operation_index = delete_operation_indexes[i];
            this.apply_delete(delete_operation_index, delta);
        }

        /* TODO: 
        Remove any insert operations without any text inside*/

        /*TODO:
        Merge consecutive operations into one */
        
        return delta;
    }

    get HTML() {
        var delta = this.apply_operations();
        var HTML = "";
        var buffer = "";

        for (let index = 0; index < delta.operations.length; index++) {
            let operation = delta.operations[index];
            if (operation.content_type === "text") {
                let formatBuffer = operation.text;
    
                var supported_formats = Object.keys(this.formats);
                for (let format_index = 0; format_index < supported_formats.length; format_index++) {
                    let format = supported_formats[format_index];
                    if (!operation.format.includes(format)) continue;
                    
                    format = this.formats[format];
                    formatBuffer = this.get_HTML_tags(format.tags).start + formatBuffer + this.get_HTML_tags(format.tags).end;
                }

                buffer += formatBuffer;
            }

            if (operation.content_type === "break") {
                if (operation.break === "line") {
                    buffer += "<br>";
                    continue;
                }

                var supported_blocks = Object.keys(this.blocks);
                for (let block_index = 0; block_index < supported_blocks.length; block_index++) {
                    let block = supported_blocks[block_index];
                    if (operation.break !== block) continue;
                    
                    block = this.blocks[block];
                    buffer = this.get_HTML_tags(block.tags).start + buffer + "<br>" + this.get_HTML_tags(block.tags).end;
                }

                HTML += buffer;
                buffer = "";
            }
        }

        HTML = this.merge_sequential_HTML_tags(HTML);

        return HTML;
    }

    merge_sequential_HTML_tags(HTML) {
        var checks = {...this.formats, ...this.blocks};
        var checkNames = Object.keys(checks);

        for (let checkName of checkNames) {
            let check = checks[checkName];
            
            for (let i of check.mergeIndex) {
                let mergeTag = check.tags[i];
                
                HTML = HTML.replaceAll(`</${mergeTag}><${mergeTag}>`, "");
            }
        }

        return HTML;
    }
}

// Maybe use AI to generate some more examples
sample_delta_input_1 = [
    {
        "type": "insert",
        "position": 0,
        "content_type": "text",
        "text": "Hello",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 5,
        "content_type": "break",
        "break": "line"
    },
    {
        "type": "insert",
        "position": 6,
        "content_type": "text",
        "text": "This is a second paragraph",
        "format": ["italic", "bold"]
    },
    {
        "type": "insert",
        "position": 32,
        "content_type": "break",
        "break": "paragraph"
    },
    {
        "type": "insert",
        "position": 37,
        "content_type": "text",
        "text": "two",
        "format": []
    },
    {
        "type": "insert",
        "position": 40,
        "content_type": "break",
        "break": "ordered_list"
    },
    {
        "type": "insert",
        "position": 33,
        "content_type": "text",
        "text": "one",
        "format": []
    },
    {
        "type": "insert",
        "position": 36,
        "content_type": "break",
        "break": "ordered_list"
    },
    {
        "type": "delete",
        "position": 28,
        "count": 6
    }
]

sample_delta_input_2 = [
    {
        "type": "insert",
        "position": 0,
        "content_type": "text",
        "text": "The Future of Smart Cities and Urban Development",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 44,
        "content_type": "break",
        "break": "line"
    },
    {
        "type": "insert",
        "position": 45,
        "content_type": "text",
        "text": "As urban populations continue to grow, the concept of smart cities has gained increasing attention worldwide. The integration of cutting-edge technologies like IoT (Internet of Things), AI (artificial intelligence), and data analytics is transforming urban living. These innovations promise to improve everything from transportation and energy efficiency to healthcare and public safety. The vision of a smart city goes beyond just technology; it also focuses on improving the quality of life for residents while creating sustainable and resilient urban environments.",
        "format": []
    },
    {
        "type": "insert",
        "position": 370,
        "content_type": "break",
        "break": "paragraph"
    },
    {
        "type": "insert",
        "position": 371,
        "content_type": "text",
        "text": "Smart infrastructure is the backbone of a connected city. With the rise of connected devices and sensors, urban planners can monitor everything from traffic flow to energy consumption in real-time. This data allows for optimized resource management, reduces waste, and helps in the planning of more efficient public services. One of the key aspects of smart cities is the ",
        "format": []
    },
    {
        "type": "insert",
        "position": 460,
        "content_type": "text",
        "text": "smart grid",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 507,
        "content_type": "text",
        "text": ", which uses digital technology to monitor and manage energy distribution, improving both the reliability and sustainability of electricity supply.",
        "format": []
    },
    {
        "type": "insert",
        "position": 724,
        "content_type": "break",
        "break": "unordered_list"
    },
    {
        "type": "insert",
        "position": 725,
        "content_type": "text",
        "text": "IoT-enabled infrastructure for real-time monitoring",
        "format": []
    },
    {
        "type": "insert",
        "position": 760,
        "content_type": "break",
        "break": "unordered_list"
    },
    {
        "type": "insert",
        "position": 761,
        "content_type": "text",
        "text": "AI-driven traffic management systems",
        "format": []
    },
    {
        "type": "insert",
        "position": 796,
        "content_type": "break",
        "break": "unordered_list"
    },
    {
        "type": "insert",
        "position": 797,
        "content_type": "text",
        "text": "Energy-efficient building systems using smart technologies",
        "format": []
    },
    {
        "type": "insert",
        "position": 830,
        "content_type": "break",
        "break": "paragraph"
    },
    {
        "type": "insert",
        "position": 831,
        "content_type": "text",
        "text": "Another important aspect of smart cities is sustainable transportation. With growing populations, traffic congestion has become a major concern. To tackle this, many cities are adopting ",
        "format": []
    },
    {
        "type": "insert",
        "position": 960,
        "content_type": "text",
        "text": "electric vehicles (EVs)",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 992,
        "content_type": "text",
        "text": ", autonomous vehicles, and integrated public transportation systems. Smart cities use data to predict traffic patterns, optimize routes, and reduce congestion. Cities like Copenhagen and Amsterdam have become pioneers in adopting ",
        "format": []
    },
    {
        "type": "insert",
        "position": 1106,
        "content_type": "text",
        "text": "smart mobility solutions",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 1140,
        "content_type": "text",
        "text": ", which are helping reduce carbon emissions and improving the overall quality of urban life.",
        "format": []
    },
    {
        "type": "insert",
        "position": 1280,
        "content_type": "break",
        "break": "ordered_list"
    },
    {
        "type": "insert",
        "position": 1281,
        "content_type": "text",
        "text": "Electric vehicle charging stations and infrastructure",
        "format": []
    },
    {
        "type": "insert",
        "position": 1316,
        "content_type": "break",
        "break": "ordered_list"
    },
    {
        "type": "insert",
        "position": 1317,
        "content_type": "text",
        "text": "Autonomous vehicle integration with existing transportation systems",
        "format": []
    },
    {
        "type": "insert",
        "position": 1352,
        "content_type": "break",
        "break": "ordered_list"
    },
    {
        "type": "insert",
        "position": 1353,
        "content_type": "text",
        "text": "Data-driven decision-making for traffic management",
        "format": []
    },
    {
        "type": "insert",
        "position": 1387,
        "content_type": "break",
        "break": "paragraph"
    },
    {
        "type": "insert",
        "position": 1388,
        "content_type": "text",
        "text": "The integration of ",
        "format": []
    },
    {
        "type": "insert",
        "position": 1413,
        "content_type": "text",
        "text": "artificial intelligence (AI)",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 1447,
        "content_type": "text",
        "text": " into urban development offers incredible opportunities for improving healthcare and safety. AI systems can monitor public health data, predict potential outbreaks, and even assist in emergency response efforts. Smart cities use AI to analyze public safety issues, predict crime patterns, and deploy resources accordingly. Additionally, AI technologies help in optimizing the delivery of city services, ranging from waste collection to emergency medical services, thus improving overall efficiency.",
        "format": []
    },
    {
        "type": "insert",
        "position": 1760,
        "content_type": "break",
        "break": "unordered_list"
    },
    {
        "type": "insert",
        "position": 1761,
        "content_type": "text",
        "text": "AI-driven healthcare monitoring systems",
        "format": []
    },
    {
        "type": "insert",
        "position": 1795,
        "content_type": "break",
        "break": "unordered_list"
    },
    {
        "type": "insert",
        "position": 1796,
        "content_type": "text",
        "text": "Predictive policing and crime prevention algorithms",
        "format": []
    },
    {
        "type": "insert",
        "position": 1830,
        "content_type": "break",
        "break": "unordered_list"
    },
    {
        "type": "insert",
        "position": 1831,
        "content_type": "text",
        "text": "AI-powered resource allocation for emergency services",
        "format": []
    },
    {
        "type": "insert",
        "position": 1864,
        "content_type": "break",
        "break": "paragraph"
    },
    {
        "type": "insert",
        "position": 1865,
        "content_type": "text",
        "text": "Sustainability is a critical concern in the development of smart cities. The ability to use resources more efficiently and reduce environmental impact is paramount. Smart cities rely on green technologies, such as renewable energy systems and smart grids, to make cities more energy-efficient. Smart buildings, equipped with automated systems for lighting, heating, and cooling, help reduce energy consumption. Moreover, cities are increasingly adopting ",
        "format": []
    },
    {
        "type": "insert",
        "position": 2004,
        "content_type": "text",
        "text": "green urban planning",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 2043,
        "content_type": "text",
        "text": " to create more green spaces, improve air quality, and promote biodiversity.",
        "format": []
    },
    {
        "type": "insert",
        "position": 2210,
        "content_type": "break",
        "break": "unordered_list"
    },
    {
        "type": "insert",
        "position": 2211,
        "content_type": "text",
        "text": "Smart grids for energy distribution",
        "format": []
    },
    {
        "type": "insert",
        "position": 2245,
        "content_type": "break",
        "break": "unordered_list"
    },
    {
        "type": "insert",
        "position": 2246,
        "content_type": "text",
        "text": "Use of renewable energy sources in urban settings",
        "format": []
    },
    {
        "type": "insert",
        "position": 2280,
        "content_type": "break",
        "break": "unordered_list"
    },
    {
        "type": "insert",
        "position": 2281,
        "content_type": "text",
        "text": "Green urban planning for sustainable cities",
        "format": []
    },
    {
        "type": "insert",
        "position": 2315,
        "content_type": "break",
        "break": "paragraph"
    },
    {
        "type": "insert",
        "position": 2316,
        "content_type": "text",
        "text": "In conclusion, the future of smart cities relies on a holistic approach that integrates technology, sustainability, and human well-being. As cities continue to grow, innovations in AI, IoT, and sustainable infrastructure will be key in shaping the cities of tomorrow. The successful implementation of these technologies will create ",
        "format": []
    },
    {
        "type": "insert",
        "position": 2473,
        "content_type": "text",
        "text": "smarter",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 2481,
        "content_type": "text",
        "text": ", more efficient, and more ",
        "format": []
    },
    {
        "type": "insert",
        "position": 2500,
        "content_type": "text",
        "text": "livable",
        "format": ["bold"]
    },
    {
        "type": "insert",
        "position": 2532,
        "content_type": "text",
        "text": " urban environments for generations to come.",
        "format": []
    },
    {
        "type": "insert",
        "position": 2650,
        "content_type": "break",
        "break": "paragraph"
    }
];


const test_delta = new Delta(sample_delta_input_1);

let html = test_delta.HTML;

document.getElementById("textEditor").innerHTML = html;
document.getElementById("plain-html").innerText = html;
document.getElementById("delta").innerHTML = JSON.stringify(test_delta.operations)