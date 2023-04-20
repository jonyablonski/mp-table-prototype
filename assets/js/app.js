(function() {

  'use strict';


  /**
   * Selectors
   */

  const tables = document.querySelectorAll('[data-table]');
  const tabs = document.querySelectorAll('[data-tab]');
  const tabPanes = document.querySelectorAll('[data-tab-pane]');
  let segments = tables[0].querySelectorAll('[data-col="segment"]');
  let metrics = tables[0].querySelectorAll('[data-col="metric"]');
  

  /**
   * Variables
   */

  let segmentDefault = 'minmax(24ch, max-content)';
  let metricDefault = 'minmax(24ch, 1fr)';
  let target;
  let targetTable;
  let orgWidth;
  let orgMouseX;
  let colMinWidth = '231';
  let gridMatrix = [segmentDefault, metricDefault];



  /**
   * Methods
   */


  // Handle click events globally
  const clickEventHandler = (e) => {
    
    // Table Utility Events
    if (e.target.matches('[data-table-util]')) {
      let action = e.target.getAttribute('data-table-util');

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
        case action = 'new-session':
          if (!e.target.disabled) {
            e.target.setAttribute('disabled', true);
            convertColsToRel();
          }
          break;
      }
    }

    // Tabs Events
    if (e.target.matches('[data-tab]')) {

      // Get target pane
      let target = e.target.hash;

      // Update active state
      tabs.forEach(tab => {
        tab.classList.toggle('is-active', tab.hash === target);
      });

      // Switch visible tab pane
      switchTab(target);
    
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

    // Store target and parent table
    target = getClosest(e.target, '[data-col]');
    targetTable = getClosest(target, '[data-table]')

    // Get target values
    orgWidth = target.offsetWidth;
    orgMouseX = e.pageX;

    // Update resizing state on table
    targetTable.classList.add('is-resizing');

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
      targetTable.classList.remove('is-resizing');

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
    let tableWidth = tables[0].offsetWidth;

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
    segments = tables[0].querySelectorAll('[data-col="segment"]');

    // Update table settings
    updateTableGrid(newSegment, segmentDefault, 'add');

    // Check for table overflow
    checkTableOverflow();

    // Sync all table content with report table
    syncTables();
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
    segments = tables[0].querySelectorAll('[data-col="segment"]');

    // Update table settings
    updateTableGrid(lastSegment, null, 'remove');

    // Check for table overflow
    checkTableOverflow();

    // Sync all table content with report table
    syncTables();
  }

  // Add new metric
  const addMetric = () => {

    // Get last metric in table and clone it
    let lastMetric = metrics[metrics.length - 1];
    let newMetric = lastMetric.cloneNode(true);

    // Insert cloned segment after last metric
    lastMetric.after(newMetric);
  
    // Update metric collection
    metrics = tables[0].querySelectorAll('[data-col="metric"]');

    // Update table settings
    updateTableGrid(newMetric, metricDefault, 'add');

    // Check for table overflow
    checkTableOverflow();

    // Sync all table content with report table
    syncTables();
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
    metrics = tables[0].querySelectorAll('[data-col="metric"]');

    // Update table settings
    updateTableGrid(lastMetric, null, 'remove');

    // Check for table overflow
    checkTableOverflow();

    // Sync all table content with report table
    syncTables();
  }

  // Update Table Grid
  const updateTableGrid = (target, width, fn) => {

    // Set targetTable to table report table if table function isn’t set
    if (fn) targetTable = tables[0];

    // Get index of target elem
    let index = [...targetTable.children].indexOf(target);

    // Update grid matrix segments
    if (fn === 'add') {
      gridMatrix.splice(index - 1, 0, width);
    } else if (fn === 'remove') {
      gridMatrix.splice(index - 1, 1);
    } else {
      gridMatrix[index] = width;
    }

    // If targetTable is report table
    // Apply new grid settings to all tables
    // Otherwise only apply settings to that specific table
    if (targetTable === tables[0]) {
      tables.forEach(table => {
        table.style.gridTemplateColumns = gridMatrix.join(" ");
      });
    } else {
      targetTable.style.gridTemplateColumns = gridMatrix.join(" ");
    }

  }

  // Check when table is overflowing container
  const checkTableOverflow = () => {
    tables[0].classList.toggle('is-overflow', tables[0].scrollWidth > tables[0].parentNode.offsetWidth);
  }

  // Reset column width to default
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

  // Apply relative width to previous cols
  const convertColsToRel = () => {
    
    // Get all columns
    let cols = document.querySelectorAll('[data-col]');

    // Get table width including overflow
    let tableWidth = tables[0].scrollWidth;

    // Set explicit width on table so col calc is accurate
    tables[0].style.width = tableWidth + 'px';

    // Get segment widths
    let segmentWidths = Array.from(segments).map(function (segment) {
      return segment.offsetWidth;
    });

    // Get sum of segment widths
    let totalSegmentWidth = segmentWidths.reduce((accumulator, value) => {
      return accumulator + value;
    }, 0);

    // Loop through cols and translate each to rel width
    // Then update grid matrix
    cols.forEach(col => {
      let type = col.getAttribute('data-col');
      let width = type === 'segment' 
        ? `${parseInt(col.offsetWidth, 10)}px`
        : `minmax(24ch, ${parseInt(col.offsetWidth, 10) / (tableWidth - totalSegmentWidth) * 100}fr)`;
      updateTableGrid(col, width);
    });
  }

  // Switch active tab
  const switchTab = (target) => {
    tabPanes.forEach(pane => {
      pane.classList.toggle('is-active', `#${pane.id}` === target);
    });
  }

  // Synchronize all tables to report table
  const syncTables = () => {

    // Clone report table content
    let reportTable = tables[0].cloneNode(true).innerHTML;

    tables.forEach((table, index) => {
      if (index !== 0) {
        table.innerHTML = reportTable;
        table.style.gridTemplateColumns = tables[0].style.gridTemplateColumns;
      }
    });

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