(function() {

  'use strict';


  /**
   * Selectors
   */

  const table = document.querySelector('[data-table]');
  let segments = document.querySelectorAll('[data-segment]');
  let metrics = document.querySelectorAll('[data-metric]');


  /**
   * Variables
   */

  let segmentDefault = 'minmax(max-content, 10vw) ';
  let metricDefault = '1fr ';
  let target;
  let orgWidth;
  let orgMouseX;


  /**
   * States
   */

  let activeClass = 'is-active';
  let inactiveClass = 'is-inactive';


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

    // Resize column
    document.addEventListener('mousemove', resizeCol, false);
    
    // Resizing end
    document.addEventListener('mouseup', function() {

      // Remove event listener
      document.removeEventListener('mousemove', resizeCol, false);

      // Update resizing state on table
      table.classList.remove('is-resizing');
    }, false);
  }

  // Resize Column
  const resizeCol = (e) => {
    
    // Calculate new width
    let width = parseInt(orgWidth + (e.pageX - orgMouseX), 10) + 'px';
    
    // Apply new width
    target.style.width = width;
    
    // Check for table overflow
    checkTableOverflow();
  }

  // Check when table is overflowing container
  const checkTableOverflow = () => {
    table.classList.toggle('is-overflow', table.scrollWidth > table.parentNode.offsetWidth);
  }

  // Add new segment
  const addSegment = () => {

    // Get last segment in table and clone it
    let lastSegment = segments[segments.length - 1];
    let newSegment = lastSegment.cloneNode(true);

    // Insert cloned segment after last segment
    lastSegment.after(newSegment);
  
    // Update segment collection
    segments = document.querySelectorAll('[data-segment]');

    // Update table settings
    let gridConfig = `${segmentDefault.repeat(segments.length)} ${metricDefault.repeat(metrics.length)}`;
    table.style.gridTemplateColumns = gridConfig;

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
    segments = document.querySelectorAll('[data-segment]');

    // Update table settings
    let gridConfig = `${segmentDefault.repeat(segments.length)} ${metricDefault.repeat(metrics.length)}`;
    table.style.gridTemplateColumns = gridConfig;

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
    metrics = document.querySelectorAll('[data-metric]');

    // Update table settings
    let gridConfig = `${segmentDefault.repeat(segments.length)} ${metricDefault.repeat(metrics.length)}`;
    table.style.gridTemplateColumns = gridConfig;

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
    metrics = document.querySelectorAll('[data-metric]');

    // Update table settings
    let gridConfig = `${segmentDefault.repeat(segments.length)} ${metricDefault.repeat(metrics.length)}`;
    table.style.gridTemplateColumns = gridConfig;

    // Check for table overflow
    checkTableOverflow();
  }



  /**
   * Events/APIs/init
   */


  // Replace 'no-js' w/ 'js' on document element
  document.documentElement.className = "js";

  // Listen for click events
  document.addEventListener('click', clickEventHandler, false);

  // Listen for mouse events
  document.addEventListener('mousedown', mousedownEventHandler, false);
  
})();