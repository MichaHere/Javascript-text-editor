export function md_to_html(md) {
    return md;
}

function apply_paragraphs(md) {
    var array = md.split("\n\n");
    var html = "";
    
    for (let i = 0; i < array.length; i++) {
        html += `<p>${array[i]}</p>`;
    }

    return html;
}