(function() {

  'use strict';


  /**
   * Selectors
   */

  const table = document.querySelector('[data-table]');
  let segments = document.querySelectorAll('[data-col="segment"]');
  let metrics = document.querySelectorAll('[data-col="metric"]');


  /**
   * Variables
   */

  let segmentDefault = 'minmax(max-content, 10vw)';
  let metricDefault = 'minmax(max-content, 1fr)';
  let target;
  let orgWidth;
  let orgMouseX;
  let colMinWidth = '150';
  let gridMatrix = [segmentDefault, metricDefault];



  /**
   * Methods
   */


  // Handle click events globally
  const clickEventHandler = (e) => {
    
    // Table Utility Events
    if (e.target.matches('[data-table]')) {
      let action = e.target.getAttribute('data-table');

      // Respond to card actions
      switch (action) {
        case action = 'add-segment':
          addSegment();
          break;
        case action = 'remove-segment':
          removeSegment();
          break;
        case action = 'add-metric':
          addMetric();
          break;
        case action = 'remove-metric':
          removeMetric();
          break;
      }
    }
    
  }


  // Handle doubleclick events globally
  const dblclickEventHandler = (e) => {
    
    // Column drag handle
    if (e.target.matches('[data-drag-handle]')) {

      // Target column
      let col = getClosest(e.target, '[data-col]');

      // Reset width
      resetColWidth(col)
    }
    
  }


  // Handle mousedown events globally
  const mousedownEventHandler = (e) => {

    // Column drag handle
    if (e.target.matches('[data-drag-handle]')) {
      initColResize(e);
    }
  }

  // Initize column resizing
  const initColResize = (e) => {

    // Store target
    target = getClosest(e.target, '[data-col]');

    // Get target values
    orgWidth = target.offsetWidth;
    orgMouseX = e.pageX;

    // Update resizing state on table
    table.classList.add('is-resizing');

    // Freeze columns to left of resize columns
    freezeCols(target);

    // Resize column
    document.addEventListener('mousemove', calcResize, false);
    
    // Resizing end
    document.addEventListener('mouseup', function() {

      // Remove event listener
      document.removeEventListener('mousemove', calcResize, false);

      // Unfreeze previous cols
      unfreezeCols(target);

      // Update resizing state on table
      table.classList.remove('is-resizing');
    }, false);
  }

  // Resize Column
  const calcResize = (e) => {
    
    // Calculate new width
    let width = parseInt(orgWidth + (e.pageX - orgMouseX), 10);

    // Enforce minimum column width
    if (width <= colMinWidth) return;
    
    // Apply new width
    updateTableGrid(target, width + 'px');
    
    // Check for table overflow
    checkTableOverflow();
  }

  // Freeze columns on resize
  const freezeCols = (e) => {
    
    // Get previous cols
    let cols = getPreviousUntil(target, '[data-table]');

    // Loop through previous cols
    cols.forEach(col => {

      // Apply fixed width to previous cols
      updateTableGrid(col, col.offsetWidth + 'px');
    });
  }

  // Unfreeze columns after resize
  const unfreezeCols = (e) => {
    
    // Get previous cols
    let cols = getPreviousUntil(target, '[data-table]');

    // Get table width
    let tableWidth = table.offsetWidth;

    // Apply relative width to previous cols
    cols.forEach(col => {
      let relWidth = parseInt(col.offsetWidth, 10) / tableWidth * 100 + '%';
      updateTableGrid(col, relWidth);
    });
  }

  // Add new segment
  const addSegment = () => {

    // Get last segment in table and clone it
    let lastSegment = segments[segments.length - 1];
    let newSegment = lastSegment.cloneNode(true);

    // Insert cloned segment after last segment
    lastSegment.after(newSegment);
  
    // Update segment collection
    segments = document.querySelectorAll('[data-col="segment"]');

    // Update table settings
    updateTableGrid(newSegment, segmentDefault, 'add');

    // Check for table overflow
    checkTableOverflow();
  }

  // Remove last segment
  const removeSegment = () => {

    // Return if only 1 segment
    if (segments.length === 1) return;

    // Get last segment in table
    let lastSegment = segments[segments.length - 1];

    // Insert cloned segment after last segment
    lastSegment.remove();
  
    // Update segment collection
    segments = document.querySelectorAll('[data-col="segment"]');

    // Update table settings
    updateTableGrid(lastSegment, null, 'remove');

    // Check for table overflow
    checkTableOverflow();
  }

  // Add new metric
  const addMetric = () => {

    // Get last metric in table and clone it
    let lastMetric = metrics[metrics.length - 1];
    let newMetric = lastMetric.cloneNode(true);

    // Insert cloned segment after last metric
    lastMetric.after(newMetric);
  
    // Update metric collection
    metrics = document.querySelectorAll('[data-col="metric"]');

    // Update table settings
    updateTableGrid(newMetric, metricDefault, 'add');

    // Check for table overflow
    checkTableOverflow();
  }

  // Remove last metric
  const removeMetric = () => {

    // Return if only 1 metric
    if (metrics.length === 1) return;

    // Get last metric in table
    let lastMetric = metrics[metrics.length - 1];

    // Insert cloned segment after last segment
    lastMetric.remove();
  
    // Update segment collection
    metrics = document.querySelectorAll('[data-col="metric"]');

    // Update table settings
    updateTableGrid(lastMetric, null, 'remove');

    // Check for table overflow
    checkTableOverflow();
  }

  // Update Table Grid
  const updateTableGrid = (target, width, fn) => {
  
    // Get index of target elem
    let index = [...table.children].indexOf(target);

    // Update grid matrix array
    if (fn === 'add') {
      gridMatrix.splice(index - 1, 0, width);
    } else if (fn === 'remove') {
      gridMatrix.splice(index - 1, 1);
    } else {
      gridMatrix[index] = width;
    }

    // Apply new width to table element
    table.style.gridTemplateColumns = gridMatrix.join(" ");

  }

  // Check when table is overflowing container
  const checkTableOverflow = () => {
    table.classList.toggle('is-overflow', table.scrollWidth > table.parentNode.offsetWidth);
  }

  const resetColWidth = (col) => {
    
    // Get column type
    let colType = col.getAttribute('data-col');

    // Apply default width
    if (colType === 'segment') {
      updateTableGrid(target,segmentDefault);
    } else {
      updateTableGrid(target,metricDefault);
    }

  }


  /**
   * Events/APIs/init
   */


  // Replace 'no-js' w/ 'js' on document element
  document.documentElement.className = "js";

  // Listen for click events
  document.addEventListener('click', clickEventHandler, false);

  // Listen for double click events
  document.addEventListener('dblclick', dblclickEventHandler, false);

  // Listen for mouse events
  document.addEventListener('mousedown', mousedownEventHandler, false);
  
})();