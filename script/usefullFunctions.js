/**
 * @description Find an ancestor element  in the text editor 
 *              of the provided element with the given class. 
 * @param {Element} element Element to look from
 * @param {Srting} withClass Class to look for
 * @param {Element} maxSearch Element to stop look after
 */
export function findAncestor(element, withClass, maxSearch) {
    if (!maxSearch.contains(element)) return false;

    let currentElement = element;
    while (!currentElement.classList.contains(withClass)
            && currentElement !== maxSearch) {
        currentElement = currentElement.parentElement;
    }

    return currentElement;
}

/**
 * @description Get a list of all the ancesters of a provided node. 
 * @param {Node} node The node to get the ancestors of
 * @returns {Array} A list with all the ancestor elements of the provided node
 */
export function getAncestors(node) {
    var nodes = [ ];
    while (node.parentElement) {
        nodes.unshift(node);
        node = node.parentElement;
    }
    return nodes;
}

/**
 * @description Get the first ancestor in common of two nodes. 
 * @param {Node} node1 The first node to get the common ancestor of
 * @param {Node} node2 The second node to get the common ancestor of
 * @returns {Element} The common ancestor element of the provided nodes
 */
export function getCommonAncestor(node1, node2) {
    if (node1 === node2) return node1.parentElement;
    if (node1.contains(node2)) return node1;
    if (node2.contains(node1)) return node2;

    let ancestorsNode1 = getAncestors(node1).reverse();
    let ancestorsNode2 = getAncestors(node2).reverse();
    for (var i = 0; i < ancestorsNode1.length; i++) {
        for (var j = 0; j < ancestorsNode2.length; j++) {
            if (ancestorsNode1[i] === ancestorsNode2[j]) return ancestorsNode1[i];
        }
    }
}

/**
 * @description Get the position of an element relative to its parent or any provided element. 
 * @param {Node} node The node to get the position of
 * @param {Node} parent [Optional] The element to take the position relative to
 * @returns {Array} A list of indexes from the provided parent to the child. 
 */
export function getNodePosition(node, parent = node.parentElement) {
    if (!parent.contains(node)) {
        return [ ];
    }
    
    if ([...parent.childNodes].includes(node)) {
        return [ Object.values(parent.childNodes).findIndex(child => child === node) ];
    }
    
    let indexes = [ ];
    let searchNode = node;
    while (searchNode !== parent) {
        indexes.unshift(Object.values(searchNode.parentElement.childNodes).findIndex(child => child === searchNode))
        searchNode = searchNode.parentElement;
    }

    return indexes;
}

/**
 * @description Pauses the script for given amount of miliseconds. 
 *              This function must be used with await for it to function.
 * @param {Number} ms 
 */
export function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

/**
 * @description Set a cursor selection, or change the cursor position 
 *              if the end is not given or equal to the start position. 
 * @param {Node} beginNode The node to start the selection in
 * @param {Number} start Where to start the selection
 * @param {Node} endNode [Optional] The node to end the selection in
 * @param {Number} end [Optional] Where to end the selection
 */
export function setSelection (beginNode, start, endNode = beginNode, end = start) {
    let selection =  window.getSelection();
    let range = document.createRange();

    range.collapse();
    range.setStart(beginNode, (isDefined(start) ? start : 0));
    range.setEnd(endNode, (isDefined(end) ? end : isDefined(start) ? start : 0))

    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * @description Returns whether the type of the variable is not 'undefined'.
 * @param {any} variable The variable to be evaluated
 * @returns True if the variable is defined and false if it is not 
 */
export function isDefined(variable) {
    if (typeof variable === 'undefined') return false;
    return true;
}

/**
 * @description Insert a node after a different node. 
 * @param {Element} parentElement Element to insert in
 * @param {Node} newNode Node to be inserted
 * @param {Node} referenceNode Sibling node after which the node is going to be inserted
 * @param {String} filter [Optional] filter for node tags
 * @returns The appended element
 */
export function insertAfter(parentElement, newNode, referenceNode, filter = null) {
    if (referenceNode === parentElement.lastChild) {
        let appended = parentElement.appendChild(newNode);
        return appended;
    }

    filter = (filter) ? parentElement.getElementsByTagName(filter) : parentElement.childNodes;

    let referenceIndex = Object.values(filter).findIndex(child => child === referenceNode);
    let nextSibling = filter[referenceIndex + 1];

    let appended = parentElement.insertBefore(newNode, nextSibling);
    return appended;
}

export function sameArray(array1, array2) {
    if (array1.length !== array2.length) return false;
    if (!array1.sort().every((value, index) => {
        return value === array2.sort()[index];
    })) { return false; }
    return true;
}



/**
 * @description Searches for the target node in the parent element. 
 * @param {Element} parent Element to look in
 * @param {Node} target node to look for
 * @returns {Boolean} True if the target was found in the parent
 */
// FIX NOTHING: DON'T USE THIS FUNCTION; USE parent.contains(target) INSTEAD!!!
function relativeOf(parent, target) {
    // for (let child of parent.getElementsByTagName('*')) {
    //     if (child == target) {
    //         return true;
    //     }
    // }
    // return false;
}

/**
 * @description Searches for the node that is above the given node. 
 * @param {Node} node The node to find the previous child of
 * @returns The child above the current node. 
 */
// FIX NOTHING: DON'T USE THIS FUNCTION; USE node.previousSibling INSTEAD!!!
function findPreviousChild (node) {
    // let parent = node.parentElement;  
    // let index = Object.values(parent.children).findIndex(
    //     child => child == node
    // );

    // if (!index > 0) {
    //     return false;
    // }

    // return parent.children[index - 1];
}
