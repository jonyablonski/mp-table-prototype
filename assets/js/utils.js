const getSiblings = function (elem) {

  // Setup siblings array and get the first sibling
  var siblings = [];
  var sibling = elem.parentNode.firstChild;

  // Loop through each sibling and push to the array
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== elem) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling
  }

  return siblings;

};


const getPreviousSibling = function (elem, selector) {

  // Get the next sibling element
  let sibling = elem.previousElementSibling;

  // If there's no selector, return the first sibling
  if (!selector) return sibling;

  // If the sibling matches our selector, use it
  // If not, jump to the next sibling and continue the loop
  while (sibling) {
    if (sibling.matches(selector)) return sibling;
    sibling = sibling.previousElementSibling;
  }

};


const getNextSibling = function (elem, selector) {

  // Get the next sibling element
  let sibling = elem.nextElementSibling;

  // If there's no selector, return the first sibling
  if (!selector) return sibling;

  // If the sibling matches our selector, use it
  // If not, jump to the next sibling and continue the loop
  while (sibling) {
    if (sibling.matches(selector)) return sibling;
    sibling = sibling.nextElementSibling
  }

};


const getClosest = function (elem, selector) {
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (elem.matches(selector)) return elem;
  }
  return null;
};


const getNextUntil = function (elem, selector) {

  // Setup siblings array and get next sibling
  var siblings = [];
  var next = elem.nextElementSibling;

  // Loop through all siblings
  while (next) {

    // If the matching item is found, quit
    if (selector && next.matches(selector)) break;

    // Otherwise, push to array
    siblings.push(next);

    // Get the next sibling
    next = next.nextElementSibling

  }

  return siblings;

};