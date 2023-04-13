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


  /**
   * States
   */

  let activeClass = 'is-active';
  let inactiveClass = 'is-inactive';
  let rowStartClass = 'row-start';
  let dragClass = 'is-dragging';
  let dragHoverClass = 'is-dragHovered';
  let hasDragChild = 'is-dragActive';


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

    // Table Drag Events
    if (e.target.matches('[data-drag-handle]')) {
      resizeElem(e)
    }

  }

  const resizeElem = (e) => {

    // Get elements
    let handle = e.target;
    let target = handle.parentNode;

    // Get initial values
    let orgMouseX = handle.getBoundingClientRect().left;
    let orgTargetWidth = target.offsetWidth;

    // Listen for drag event on handle 
    document.addEventListener('mousemove', function(e) {
      let resizeDiff = Math.round(Math.abs(orgMouseX - e.pageX));
      target.style.width = orgTargetWidth + resizeDiff + 'px';
    }, false);

    document.addEventListener('mouseup', function(e) {
      
    }, false);
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
  }



  /**
   * Events/APIs/init
   */


  // Replace 'no-js' w/ 'js' on document element
  document.documentElement.className = "js";

  // Listen for click events
  document.addEventListener('click', clickEventHandler, false);

  // Listen for mousedown events
  document.addEventListener('mousedown', mousedownEventHandler, false);
  
})();