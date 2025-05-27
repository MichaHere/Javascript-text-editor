export function flat_child_nodes(element, filter = () => true) {
    let child_nodes = filter(element) ? [element] : [];

    for (let i = 0; i < element.childNodes.length; i++) {
        child_nodes.push(...flat_child_nodes(element.childNodes[i], filter));
    }

    return child_nodes;
}