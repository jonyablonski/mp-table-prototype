// (function() {

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

  let segmentDefault = `minmax(var(--table-col-min-width), var(--table-col-max-width))`;
  let metricDefault = `minmax(var(--table-col-min-width), 1fr)`;
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
            convertColsToRel(tables[0]);
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
    targetTable = getClosest(target, '[data-table]');
    
    // Update gridMatrix based on target table
    // Split column data string at each space not preceded by comma
    let targetTableGrid = targetTable.style.gridTemplateColumns;
    gridMatrix = targetTableGrid.split(/(?<!,)\s/g);

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
    document.addEventListener('mouseup', function(e) {

      // Remove event listener
      document.removeEventListener('mousemove', calcResize, false);

      // Update resizing state on table
      targetTable.classList.remove('is-resizing');

      // Bail if target is not drag handle
      if (!e.target.matches('[data-drag-handle]')) return;

      // Unfreeze previous cols
      unfreezeCols(target);

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
    let prevCols = getPreviousUntil(target, '[data-table]');

    // Loop through previous cols
    prevCols.forEach(col => {

      // Get index of target elem
      let index = [...targetTable.children].indexOf(col);

      // Store prev width
      col.setAttribute('data-prev-width', gridMatrix[index]);

      // Apply fixed width to previous cols
      updateTableGrid(col, col.offsetWidth + 'px');

    });

  }

  // Unfreeze columns after resize
  const unfreezeCols = (e) => {

    // Get previous cols
    let cols = getPreviousUntil(target, '[data-table]');

    // Apply prev width to each column
    cols.forEach(col => {
      let width;
      if (col.getAttribute('data-col') === 'segment') {
        width = col.getAttribute('data-prev-width');
      } else {
        width = (col.offsetWidth / targetTable.offsetWidth) * 100 + '%';
      }
      updateTableGrid(col, width);
    });
  }

  // Update Table Grid
  const updateTableGrid = (target, width, fn) => {

    // Set targetTable to table report table if table function isn’t set
    if (fn) targetTable = tables[0];

    // Get table width including overflow
    // let tableWidth = targetTable.scrollWidth;

    // Set explicit width on table so col calc is accurate
    // targetTable.style.width = tableWidth + 'px';

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
        table.style.gridTemplateColumns = gridMatrix.join(' ');
      })
    } else {
      targetTable.style.gridTemplateColumns = gridMatrix.join(' ');
    }

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
      updateTableGrid(target, segmentDefault);
    } else {
      updateTableGrid(target, metricDefault);
    }

  }

  // Apply relative width to previous cols
  const convertColsToRel = (table) => {

    // Update gridMatrix based on target table
    // Split column data string at each space not preceded by comma
    let targetTableGrid = table.style.gridTemplateColumns;
    gridMatrix = targetTableGrid.split(/(?<!,)\s/g);

    // Set explicit width on table
    table.style.width = table.scrollWidth + 'px';

    // Loop through cols and translate each to rel width
    // Then update grid matrix
    gridMatrix.forEach((width, index) => {
      if (width.includes('px', -1)) {
        width = parseInt(width, 10);
        gridMatrix[index] = `minmax(var(--table-col-min-width), ${parseInt((width / table.offsetWidth) * 100, 10)}%)`;
        console.log(gridMatrix)
      }
    });

    // Apply updated table column sizing
    table.style.gridTemplateColumns = gridMatrix.join(' ');
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
  
// })();