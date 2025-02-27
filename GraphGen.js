/* This file contains the functionality to add the graph windows and generate graphs in it, and also calling applicable methods on graphs. */

let graphCount = 0;
let availableGraphs = [];
function addGraph() { // Core function will all functionalities
    // Graph name details
    const thisInstance = graphCount.toString(); // Unique identifier for this graph
    const graphName = document.getElementById('graphName').value;
    let displayName = graphName ? graphName : `Graph`; // Give a default name if the name field is empty
    let baseName = displayName;

    let counter = 1;
    while (availableGraphs.includes(displayName)) {
        displayName = `${baseName}.${String(counter).padStart(3, '0')}`;
        counter++;
    }
    availableGraphs.push(displayName); // Add the graph to the list of available graphs
    const titleName = displayName.length > 10 ? displayName.substring(0, 7) + '...' : displayName;

    // Graph value details
    const edgesInput = document.getElementById('edges').value;
    const directed = document.getElementById('directed').checked;
    const weighted = document.getElementById('weighted').checked;

    // New style details
    const edgeColor = '#666666'; // Color of the links between nodes
    const hoverColor = '#4772b3'; // Color of nodes when hovered on
    const nodeColor = '#1a1a1a'; // Color of the nodes
    const nodeLabelColor = '#cccccc'; // Color of the text on the nodes
    const edgeWeightColor = '#cccccc'; // Color of the edge weights
    const gridLineColor = '#bbbbbb22'; // Color of the grid lines
    const dragNodeColor = '#4772b3'; // Color of the nodes when dragged

    const outliner = document.querySelector('.outliner'); // Outliner

    // container is the graph window, and it contains the graph and svg functionalities.
    const container = document.createElement('div');
    container.className = 'graphContainer';
    // Create the resize handles for the container
    const resizeHandleElements = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    resizeHandleElements.forEach(corner => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.classList.add(corner);
        handle.setAttribute('data-corner', corner);
        container.appendChild(handle);
    });
    // Defining position and dimensions of the graph window here because inline styles are only supported
    container.style.position = 'absolute';
    container.style.width = '37.5%';
    container.style.height = '50%';
    if (view9gen) {
        const twoThird = 2 / 3;
        container.style.transform = `scale(${twoThird})`; // Initial scale of the graph window
    } else {
        container.style.transform = 'scale(1)';
    }
    // Container that is interacted with will have the highest z-index
    container.addEventListener('mousedown', () => {
        document.querySelectorAll('.graphContainer').forEach(c => {
            c.style.zIndex = 1;
            container.style.zIndex = 999;
        });
    });

    // Focus on the graph
    function focusGraph() {
        // Scale is applied from top-left corner
        const currentScale = parseFloat(container.style.transform.replace('scale(', '').replace(')', ''));
        const offsetLeft = parseFloat(container.style.width) * currentScale / 2;
        const offsetTop = parseFloat(container.style.height) * currentScale / 2;
        console.log(offsetLeft, offsetTop)
        container.style.left = container.style.width.endsWith('%') ? `calc(37.5% - ${offsetLeft}%)` : `calc(37.5% - ${offsetLeft}px)`;
        container.style.top = container.style.height.endsWith('%') ? `calc(50% - ${offsetTop}%)` : `calc(50% - ${offsetTop}px)`;

        document.querySelectorAll('.graphContainer').forEach(c => {
            c.style.zIndex = 1;
        });
        container.style.zIndex = 999;
    }
    focusGraph(); // Focus on the graph when it is created

    /* Content of container */
    // Create the graphHeader div - contains the graph name, use force checkbox, show grid checkbox, auto-rearrange radius input, and auto-rearrange button, fullScreen button, and close button (The entire window functionality)
    const graphHeader = document.createElement('div');
    graphHeader.className = 'graphHeader';

    /* Graph Header content */
    // Create the span element - contains the graph name, use force checkbox, show grid checkbox, auto-rearrange radius input, and auto-rearrange button
    const headerSpan = document.createElement('span');

    /* Header span content */
    // Create a new span for the graph name
    const graphNameSpan = document.createElement('span');
    graphNameSpan.style.fontWeight = 'bold';
    graphNameSpan.style.cursor = 'default';
    graphNameSpan.textContent = titleName;
    graphNameSpan.title = displayName; // Add title attribute to display full name on hover
    headerSpan.appendChild(graphNameSpan);

    // Create the "Use Force" checkbox
    const useForceCheckbox = document.createElement('input');
    useForceCheckbox.type = 'checkbox';
    useForceCheckbox.title = 'Apply a force when dragging a node to affect other nodes';
    useForceCheckbox.checked = false;
    headerSpan.appendChild(useForceCheckbox);
    headerSpan.appendChild(document.createTextNode('Use Force'));

    // Create the "Show grid" checkbox
    const gridCheckbox = document.createElement('input');
    gridCheckbox.type = 'checkbox';
    gridCheckbox.title = 'Show/Hide grid';
    gridCheckbox.checked = true;
    headerSpan.appendChild(gridCheckbox);
    headerSpan.appendChild(document.createTextNode('Show grid'));

    // Create a div for the auto-rearrange and button
    const autoRearrangeDiv = document.createElement('div');
    autoRearrangeDiv.className = 'dropdownMenu';
    autoRearrangeDiv.style.marginLeft = '30px';

    /* Auto-rearrange nodes */
    // Create the "Auto-rearrange nodes" button
    const centerGraphButton = document.createElement('button');
    centerGraphButton.title = 'Rearrange nodes as they first appeared in the graph';
    centerGraphButton.textContent = 'Rearrange nodes';
    autoRearrangeDiv.appendChild(centerGraphButton);

    // Append the autoRearrange div to the headerSpan
    headerSpan.appendChild(autoRearrangeDiv);
    /* End of auto-rearrange nodes */

    /* Applicable methods */
    // Available methods
    const algorithms = [
        { name: 'bfs', text: 'BFS', title: 'Breadth-First Search' },
        { name: 'dfs', text: 'DFS', title: 'Depth-First Search' },
        { name: 'dijkstra', text: 'Dijkstra\'s', title: 'Dijkstra\'s Shortest Path' },
        { name: 'floydWarshall', text: 'Floyd Warshall', title: 'Floyd-Warshall Algorithm' },
        { name: 'bellmanFord', text: 'Bellman Ford', title: 'Bellman-Ford Algorithm' },
        { name: 'mst', text: 'MST', title: 'Minimum Spanning Tree' },
        { name: 'topologicalSort', text: 'Topological Sort', title: 'Topological Sorting' },
        { name: 'scc', text: 'SCC', title: 'Strongly Connected Components' },
        { name: 'bcc', text: 'BCC', title: 'Biconnected Components' }
    ];
    // Filter the algorithms based on the graph properties
    const applicableAlgorithms = algorithms.filter(algorithm => {
        if (!directed) {
            // If the graph is undirected, exclude algorithms that only work on directed graphs
            if (algorithm.name === 'topologicalSort' || algorithm.name === 'scc') {
                return false;
            }
        }
        if (!weighted) {
            // If the graph is unweighted, exclude algorithms that require weighted graphs
            if (algorithm.name === 'dijkstra' || algorithm.name === 'floydWarshall' || algorithm.name === 'bellmanFord') {
                return false;
            }
        }
        return true;
    });
    /* End of Applicable methods */

    // Getting edge data from input for algorithms
    /* Input Validation - Parse edges */
    let edges = edgesInput.split(',').map(edge => {
        edge = edge.trim();

        // Validate the edge format
        const simpleFormat = /^([a-zA-Z0-9]{2})(\d+)$/; // Matches 'ab5'
        const parenFormat = /^\(([a-zA-Z0-9]+)_([a-zA-Z0-9]+)_(\d+)\)$/; // Matches '(a_b_5)'

        let source, target, weight;

        if (simpleFormat.test(edge)) {
            const match = edge.match(simpleFormat);
            source = match[1][0];
            target = match[1][1];
            weight = parseFloat(match[2]);
        } else if (parenFormat.test(edge)) {
            const match = edge.match(parenFormat);
            source = match[1];
            target = match[2];
            weight = parseFloat(match[3]);
        } else {
            alert("Invalid edge format: " + edge);
            return null;
        }

        if (isNaN(weight)) {
            alert(`Invalid weight in edge: ${edge}`);
            return null;
        }

        return { source, target, weight };
    }).filter(edge => edge !== null); // Remove invalid edges
    // If there are no valid edges, return
    if (edges.length === 0) {
        return;
    }
    /* End of Input Validation */

    // Create new div for available methods button
    /* Available methods */
    const methodsDiv = document.createElement('div');
    methodsDiv.className = 'methodsDiv';
    methodsDiv.style.display = 'none';

    // Create buttons for each applicable algorithm
    applicableAlgorithms.forEach(algorithm => {
        const button = document.createElement('button');
        button.id = algorithm.id;
        button.textContent = algorithm.text;
        button.title = algorithm.title;
        methodsDiv.appendChild(button);
    });

    methodsDiv.addEventListener('mouseleave', (event) => {
        methodsDiv.style.display = 'none';
    });

    headerSpan.appendChild(methodsDiv);

    // Right click to display available methods
    container.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        // Get the container's position relative to the viewport
        const containerRect = container.getBoundingClientRect();

        // Calculate the position of the methodsDiv relative to the container
        const x = event.clientX - containerRect.left - 90;
        const y = event.clientY - containerRect.top - 15;

        // Ensure the methodsDiv stays within the container's boundaries
        const maxX = containerRect.width - methodsDiv.offsetWidth;
        const maxY = containerRect.height - methodsDiv.offsetHeight;

        methodsDiv.style.left = `${Math.min(Math.max(x, 0), maxX)}px`;
        methodsDiv.style.top = `${Math.min(Math.max(y, 0), maxY)}px`;

        methodsDiv.style.display = 'block';
    });
    // Prevent right click context menu on the button itself
    methodsDiv.addEventListener('contextmenu', (event) => {
        event.stopPropagation();
    });

    headerSpan.appendChild(methodsDiv);
    /* End of Available methods */
    /* End of header span content */

    // Append the headerSpan to the graphHeader
    graphHeader.appendChild(headerSpan);

    // Create the controls div - contains the fullScreen button and close button
    /* Controls */
    const controlsSpan = document.createElement('span');

    // Create the fullScreen button
    const fullScreenButton = document.createElement('button');
    fullScreenButton.innerHTML = '<b>&#9744;</b>';
    fullScreenButton.title = 'Toggle full screen';
    controlsSpan.appendChild(fullScreenButton);

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&#10005;';
    closeButton.title = 'Close graph';
    controlsSpan.appendChild(closeButton);
    /* End of Controls */

    // Append the controls div to the graphHeader
    graphHeader.appendChild(controlsSpan);
    /* End of graph header content */

    // Append the graphHeader to the container
    container.appendChild(graphHeader);

    /* Create the graphContent div - contains the SVG element */
    const graphContent = document.createElement('div');
    graphContent.className = 'graphContent';

    // Create the SVG element
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    graphContent.appendChild(svgElement);
    /* End of graphContent div */

    // Append the graphContent to the container
    container.appendChild(graphContent);
    /* End of content of container */

    const resizeHandles = container.querySelectorAll('.resize-handle');

    /* Container elements' functionality */
    /* Drag functionality */
    // Supporting function to snap the positon of the graph window
    function snapPosition(x, y) { // Snapping positions for 4 and 9 graph views
        let parentWidth = container.parentElement.clientWidth;
        let parentHeight = container.parentElement.clientHeight;

        if (view4gen) {
            let snapX = (x / parentWidth) < 0.1875 ? 0 : 0.375 * parentWidth;
            let snapY = (y / parentHeight) < 0.25 ? 0 : 0.5 * parentHeight;
            return [snapX, snapY];
        }
        else if (view9gen) {
            let snapXValues = [0, 0.25, 0.50].map(val => val * parentWidth);
            let snapYValues = [0, 0.3333, 0.6666].map(val => val * parentHeight);

            let snapX = snapXValues.reduce((prev, curr) => Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev);
            let snapY = snapYValues.reduce((prev, curr) => Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev);
            return [snapX, snapY];
        }
        return [x, y];
    }

    graphHeader.addEventListener('mousedown', (e) => {
        // Prevent dragging if the clicked element is an input field or a button
        if (e.target.tagName.toLowerCase() === 'input' || e.target.closest('button')) return;

        e.preventDefault();
        let offsetX = e.clientX - container.offsetLeft;
        let offsetY = e.clientY - container.offsetTop;

        function onMouseMove(event) {
            let [snapX, snapY] = snapPosition(event.clientX - offsetX, event.clientY - offsetY);
            container.style.left = snapX + 'px';
            container.style.top = snapY + 'px';
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });
    /* End of drag functionality */


    /* Resize functionality */
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();

            let startX = e.clientX;
            let startY = e.clientY;
            let startWidth = container.offsetWidth;
            let startHeight = container.offsetHeight;
            let startLeft = container.offsetLeft;
            let startTop = container.offsetTop;
            let corner = handle.getAttribute('data-corner');

            function onMouseMove(event) {
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;

                if (corner.includes('right')) {
                    newWidth = startWidth + (event.clientX - startX);
                }
                if (corner.includes('left')) {
                    newWidth = startWidth - (event.clientX - startX);
                    newLeft = startLeft + (event.clientX - startX);
                }
                if (corner.includes('bottom')) {
                    newHeight = startHeight + (event.clientY - startY);
                }
                if (corner.includes('top')) {
                    newHeight = startHeight - (event.clientY - startY);
                    newTop = startTop + (event.clientY - startY);
                }

                if (newWidth > 50) {
                    container.style.width = newWidth + 'px';
                    container.style.left = newLeft + 'px';
                }
                if (newHeight > 50) {
                    container.style.height = newHeight + 'px';
                    container.style.top = newTop + 'px';
                }
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    });
    /* End of resize functionality */

    // Full screen button
    fullScreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    document.body.appendChild(container);
    /* End of container elements' functionality - Use force and show grid implemented after creation of the elements */

    /* Outliner elements */
    // Div for the show/hide graph button and delete button
    const showHideDeleteDiv = document.createElement('div');
    showHideDeleteDiv.className = 'showHideDeleteDiv';
    // Show container on click
    showHideDeleteDiv.addEventListener('click', function (event) {
        if (event.button === 0) { // Only left mouse button
            document.querySelectorAll('.graphContainer').forEach(c => {
                c.style.zIndex = 1;
            });
            container.style.zIndex = 999;
        }
    });

    /* Graph name functionality */
    // TODO: Avoid duplicate names
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = displayName;
    nameInput.title = displayName;
    nameInput.autocomplete = 'off';
    nameInput.spellcheck = false;
    // Initially disable input
    nameInput.setAttribute('readonly', true);

    // Enable editing on double-click and apply styling
    nameInput.addEventListener('dblclick', () => {
        nameInput.removeAttribute('readonly');
        nameInput.classList.add('editable'); // Add class
        nameInput.focus();
    });

    // Disable editing on blur
    nameInput.addEventListener('blur', () => {
        nameInput.setAttribute('readonly', true);
        nameInput.classList.remove('editable'); // Remove class
    });

    // Update the graph name on input
    nameInput.addEventListener('input', () => {
        graphNameSpan.textContent = nameInput.value.length > 10 ? nameInput.value.substring(0, 7) + '...' : nameInput.value;
        graphNameSpan.title = nameInput.value;
    });
    showHideDeleteDiv.appendChild(nameInput);
    /* End of graph name functionality */

    /* Outliner graph functionalities */
    // Show/hide graph functionality
    const showHideGraph = document.createElement('button');
    showHideGraph.title = 'Show/hide graph';
    const showHideImg = document.createElement('img');
    showHideImg.src = 'show.png';
    showHideGraph.appendChild(showHideImg);
    showHideGraph.addEventListener('click', function () {
        container.style.display === 'none' ? container.style.display = 'block' : container.style.display = 'none';
        showHideImg.src = container.style.display === 'none' ? 'hide.png' : 'show.png';
        zoomInButton.style.display = container.style.display === 'none' ? 'none' : 'inline-block';
        zoomOutButton.style.display = container.style.display === 'none' ? 'none' : 'inline-block';
        resetScaleButton.style.display = container.style.display === 'none' ? 'none' : 'inline-block';
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    });

    // Focus on graph functionality
    const focusButton = document.createElement('button');
    focusButton.title = 'Focus on this graph';
    const focusImg = document.createElement('img');
    focusImg.src = 'focus.png';
    focusButton.appendChild(focusImg);
    focusButton.addEventListener('click', focusGraph);
    focusButton.addEventListener('click', () => {
        if (container.style.display === 'none') showHideGraph.click();
    })

    // Enlarge window functionality
    const zoomInButton = document.createElement('button');
    zoomInButton.innerHTML = '<b>+</b>';
    zoomInButton.title = 'Enlarge window';
    zoomInButton.addEventListener('click', () => {
        if (view4gen || view9gen) return;
        const currentScale = parseFloat(container.style.transform.replace('scale(', '').replace(')', '')); // Get the current scale
        container.style.transform = `scale(${Math.min(currentScale + 0.05, 1.5)})`;
    });

    // Shrink window functionality
    const zoomOutButton = document.createElement('button');
    zoomOutButton.innerHTML = '<b>-</b>';
    zoomOutButton.title = 'Shrink window';
    zoomOutButton.addEventListener('click', () => {
        if (view4gen || view9gen) return;
        const currentScale = parseFloat(container.style.transform.replace('scale(', '').replace(')', ''));
        container.style.transform = `scale(${Math.max(currentScale - 0.05, 0.45)})`;
    });

    // Bind to ctrl + mousewheel for zooming
    container.addEventListener('wheel', (event) => {
        if (event.ctrlKey) {
            event.preventDefault();
            const currentScale = parseFloat(container.style.transform.replace('scale(', '').replace(')', ''));
            if (event.deltaY < 0) {
                container.style.transform = `scale(${Math.min(currentScale + 0.05, 1.5)})`;
            } else {
                container.style.transform = `scale(${Math.max(currentScale - 0.05, 0.45)})`;
            }
        }
    });

    // Reset scale functionality
    const resetScaleButton = document.createElement('button');
    resetScaleButton.title = 'Reset window scale';
    const resetImg = document.createElement('img');
    resetImg.src = 'reset.png';
    resetScaleButton.appendChild(resetImg);
    resetScaleButton.addEventListener('click', () => {
        container.style.transform = 'scale(1)';
    });

    /* General graph methods div */
    const graphOptions = document.createElement('div');
    graphOptions.className = 'graphOptions';
    graphOptions.style.display = 'none';

    const duplicateGraph = document.createElement('button'); // Duplicate graph with weights and directions turned on/off
    duplicateGraph.textContent = 'Duplicate graph';
    duplicateGraph.title = 'Duplicate this graph';

    const deleteThisGraph = document.createElement('button'); // Delete this graph
    deleteThisGraph.textContent = 'Delete graph';
    deleteThisGraph.title = 'Delete this graph';

    // If the graph is a tree, add the Visualize as tree button
    const visualizeAsTree = document.createElement('button');
    visualizeAsTree.textContent = 'Visualize as tree';
    visualizeAsTree.title = 'Visualize this graph as a tree';

    graphOptions.appendChild(duplicateGraph);
    if (!directed) graphOptions.appendChild(visualizeAsTree);
    graphOptions.appendChild(deleteThisGraph);
    outliner.appendChild(graphOptions);
    /* End of general graph methods div */

    /* Modify graph functionality */
    const graphmodifierButton = document.createElement('button');
    graphmodifierButton.innerHTML = '<b>...</b>';
    graphmodifierButton.title = 'Modify graph';
    graphmodifierButton.addEventListener('click', () => {
        graphOptions.style.display = graphOptions.style.display === 'none' ? 'block' : 'none';
        graphOptions.style.left = `${graphmodifierButton.offsetLeft - 100}px`;
        graphOptions.style.top = `${graphmodifierButton.offsetTop + graphmodifierButton.offsetHeight}px`;
    });

    graphmodifierButton.addEventListener('mouseleave', (event) => {
        if (!graphOptions.contains(event.relatedTarget)) {
            graphOptions.style.display = 'none';
        }
    });

    graphOptions.addEventListener('mouseleave', (event) => {
        if (!graphmodifierButton.contains(event.relatedTarget)) {
            graphOptions.style.display = 'none';
        }
    });
    /* End of modify graph functionality */
    /* End of outliner graph functionalities */

    // Span for the buttons
    const showHideSpanButtons = document.createElement('span');
    showHideSpanButtons.appendChild(focusButton);
    showHideSpanButtons.appendChild(zoomInButton);
    showHideSpanButtons.appendChild(zoomOutButton);
    showHideSpanButtons.appendChild(resetScaleButton);
    showHideSpanButtons.appendChild(showHideGraph);
    showHideSpanButtons.appendChild(graphmodifierButton);
    showHideDeleteDiv.appendChild(showHideSpanButtons);

    // Close Button
    closeButton.addEventListener('click', () => {
        showHideGraph.click();
    });

    // Div that contains operations of the outliner
    const outMethods = document.createElement('div');
    outMethods.className = 'outMethods';
    outMethods.style.padding = '50px';
    /* End of outliner elements */

    outliner.appendChild(showHideDeleteDiv);

    // Clear previous graph
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    /* SVG general functionalities */
    /* Zoom functionality and mousewheel binding */
    // Zoom functionality
    function zoom(zoomFactor) {
        let viewBox = svg.attr('viewBox').split(' ').map(Number);
        let [minX, minY, viewWidth, viewHeight] = viewBox;

        const newWidth = viewWidth * zoomFactor;
        const newHeight = viewHeight * zoomFactor;
        const offsetX = (viewWidth - newWidth) / 2;
        const offsetY = (viewHeight - newHeight) / 2;

        svg.attr('viewBox', `${minX + offsetX} ${minY + offsetY} ${newWidth} ${newHeight}`);
        drawGrid(); // Update grid size dynamically
    }

    function zoomIn() {
        zoom(0.9); // 10% zoom-in
    }

    function zoomOut() {
        zoom(1.1); // 10% zoom-out
    }

    // Attach zoom to mousewheel
    container.addEventListener('wheel', event => {
        event.preventDefault();
        if (event.ctrlKey) {
            const zoomFactor = 0.1; // Increase/decrease step
            if (event.deltaY < 0) {
                scale = Math.min(scale + zoomFactor, 1.5);
            } else {
                scale = Math.max(scale - zoomFactor, 0.45);
            }

            container.style.transform = `scale(${scale})`;
        } else {
            event.deltaY < 0 ? zoomIn() : zoomOut();
        }

    });
    /* End of zoom functionality */

    /* Pan functionality to right mouse hold and drag */
    let isPanning = false;
    let startX, startY;

    svg.on('mousedown', (event) => {
        if (event.button !== 1) return; // Middle mouse button
        isPanning = true;
        startX = event.clientX;
        startY = event.clientY;
        document.body.style.cursor = 'grabbing';
    });

    svg.on('mousemove', (event) => {
        if (!isPanning) return;

        let viewBox = svg.attr('viewBox').split(' ').map(Number);
        let [minX, minY, viewWidth, viewHeight] = viewBox;

        let dx = (startX - event.clientX) * (viewWidth / 600); // Scale movement
        let dy = (startY - event.clientY) * (viewHeight / 400);

        svg.attr('viewBox', `${minX + dx} ${minY + dy} ${viewWidth} ${viewHeight}`);
        startX = event.clientX;
        startY = event.clientY;
        drawGrid(); // Update grid position
    });

    svg.on('mouseup', () => {
        isPanning = false;
        document.body.style.cursor = 'default';
    });
    /* End of pan functionality */

    /* Viewbox adjustment to center the graph */
    // Adjust viewbox to fit the graph
    function adjustViewBox() {
        const xValues = nodes.map(d => d.x);
        const yValues = nodes.map(d => d.y);
        const padding = 50;
        const minX = Math.min(...xValues) - padding;
        const maxX = Math.max(...xValues) + padding;
        const minY = Math.min(...yValues) - padding;
        const maxY = Math.max(...yValues) + padding;

        const viewWidth = maxX - minX;
        const viewHeight = maxY - minY;

        svg.attr('viewBox', `${minX} ${minY} ${viewWidth} ${viewHeight}`);
        drawGrid();
    }
    svg.on('dblclick', () => adjustViewBox());
    /* End of viewbox adjustment */
    /* End of SVG general functionalities */

    // Get the dimensions of the container of the SVG
    const width = container.getBoundingClientRect().width;
    const height = container.getBoundingClientRect().height;

    // Set SVG viewbox - It acts like a camera, and the viewBox attribute defines the position and dimension of the SVG content
    svg.attr('width', width).attr('height', height);
    const SVGwidth = svg.attr('width');
    const SVGheight = svg.attr('height');
    svg.attr('viewBox', `0 0 ${SVGwidth} ${SVGheight}`);

    /* Functions to draw grid */
    // Grid settings
    const gridSize = 40; // Defines the distance between lines
    const grid = svg.append('g') // Append a group element to the SVG for the grid
    // Function to draw infinite grid
    function drawGrid() {
        const viewBox = svg.attr('viewBox').split(' ').map(Number);
        const [minX, minY, width, height] = viewBox;

        const startX = Math.floor(minX / gridSize) * gridSize;
        const startY = Math.floor(minY / gridSize) * gridSize;
        const endX = minX + width;
        const endY = minY + height;

        // Buffer size based on viewBox dimensions
        const buffer = Math.max(width, height);

        // Remove existing grid lines
        grid.selectAll('*').remove();

        // Draw vertical grid lines
        for (let x = startX - buffer; x < endX + buffer; x += gridSize) {
            grid.append('line')
                .attr('x1', x).attr('y1', minY - buffer)
                .attr('x2', x).attr('y2', endY + buffer)
                .attr('stroke', gridLineColor).attr('stroke-width', 1);
        }

        // Draw horizontal grid lines
        for (let y = startY - buffer; y < endY + buffer; y += gridSize) {
            grid.append('line')
                .attr('x1', minX - buffer).attr('y1', y)
                .attr('x2', endX + buffer).attr('y2', y)
                .attr('stroke', gridLineColor).attr('stroke-width', 1);
        }
    }
    /* End of infinite grid */

    // /* Function to draw finite grid */
    // function drawGrid(width=1000, height=1000) {
    //     // Remove any existing grid lines
    //     grid.selectAll('*').remove();

    //     // Draw vertical grid lines
    //     for (let x = 0; x <= width; x += gridSize) {
    //         grid.append('line')
    //             .attr('x1', x).attr('y1', 0)
    //             .attr('x2', x).attr('y2', height)
    //             .attr('stroke', '#cccccc77').attr('stroke-width', 1);
    //     }

    //     // Draw horizontal grid lines
    //     for (let y = 0; y <= height; y += gridSize) {
    //         grid.append('line')
    //             .attr('x1', 0).attr('y1', y)
    //             .attr('x2', width).attr('y2', y)
    //             .attr('stroke', '#cccccc77').attr('stroke-width', 1);
    //     }
    // }
    /* End of function to draw finite grid */
    /* End of functions to draw grid */

    drawGrid(); // Initial grid draw

    // Show/hide grid
    gridCheckbox.addEventListener('change', function () {
        grid.style('display', this.checked ? 'block' : 'none');
    });

    /* Graph elements creation */
    // Mark bidirectional Edges
    const edgeMap = new Set(edges.map(e => `${e.source}-${e.target}`));
    edges.forEach(edge => {
        if (edgeMap.has(`${edge.target}-${edge.source}`)) {
            edge.bidirectional = true;
        }
    });

    // Create nodes from edges
    const nodes = Array.from(
        new Set(edges.flatMap(edge => [edge.source, edge.target]))
    ).map(id => ({ id }));
    /* End of graph elements creation */

    /* Force simulation values */
    // D3 force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(edges).id(d => d.id).distance(300)) // Link force makes nodes connected by edges stay within a distance
        .force('charge', d3.forceManyBody().strength(-300)) // Charge force makes nodes repel each other
        .force('center', d3.forceCenter(width / 2, height / 2)); // Center force makes nodes gravitate towards the center

    // Function to enable force
    function enableForceSimulation() {
        simulation.force('charge', d3.forceManyBody().strength(-300));
        simulation.force('link', d3.forceLink(edges).id(d => d.id).distance(300));
        simulation.force('center', d3.forceCenter(width / 2, height / 2));
    }

    // Function to disable force
    function disableForceSimulation() {
        // Setting forces to null will disable them
        simulation.force('charge', null);
        simulation.force('link', null);
        simulation.force('center', null);
    }
    /* End of Force simulation values */

    // Control simulation forces with the use force checkbox
    useForceCheckbox.addEventListener('change', function (event) {
        if (event.target.checked) {
            enableForceSimulation();
        } else {
            disableForceSimulation();
        }
    });

    /* Drag Functions - Move nodes */
    function dragStarted(event, d) {
        d3.select(this).attr('fill', dragNodeColor);
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d3.select(this).attr('fill', dragNodeColor);
        document.body.style.cursor = 'grabbing';
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {
        d3.select(this).attr('fill', nodeColor);
        document.body.style.cursor = 'default';
        if (!useForceCheckbox.checked) {
            simulation.alphaDecay(1);
        } else {
            simulation.alphaDecay(0.0228); // 0.0228 is the default alphaDecay value used in D3.
        }
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    /* End of Drag Functions */

    /* Drawing the graph */
    const arrowId = `arrowHead${thisInstance}`; // Creating separate arrow heads for each graph, while also grouping the similar ones

    // Draw links
    const link = svg.selectAll('path')
        .data(edges)
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', edgeColor)
        .attr('stroke-width', 2)
        .attr('marker-end', directed ? `url(#${arrowId})` : null);

    // Draw arrowhead markers (Directed edges)
    if (directed) {
        svg.append('defs')
            .append('marker')
            .attr('id', arrowId)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 25)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', edgeColor);
    }

    // Draw nodes - Drawing nodes after links so that they appear in front
    const node = svg.selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', 20)
        .attr('fill', nodeColor)
        .on('mouseover', function () {
            d3.select(this).attr('fill', hoverColor);
        })
        .on('mouseout', function () {
            d3.select(this).attr('fill', nodeColor);
        })
        .call(
            d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded)
        );

    // Add labels for nodes
    const label = svg.selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('dy', 3)
        .attr('text-anchor', 'middle')
        .text(d => d.id)
        .attr('font-size', 16)
        .attr('fill', nodeLabelColor)
        .style('pointer-events', 'none');

    // Add labels for edges (weights) if weighted
    let edgeLabel;
    if (weighted) {
        edgeLabel = svg.selectAll('.edge-label')
            .data(edges)
            .enter()
            .append('text')
            .attr('class', 'edge-label')
            .attr('font-size', 14)
            .attr('fill', edgeWeightColor)
            .text(d => d.weight);
    }
    /* End of graph drawing */

    /* Functions to update positions */
    // Function to even spaces nodes in a circle
    function positionNodesInCircle(nodes) {
        disableForceSimulation(); // Disable force simulation when auto-rearranging nodes
        simulation.alphaDecay(1);
        simulation.alphaTarget(0);
        radius = 30 * nodes.length;
        const angleStep = (2 * Math.PI) / nodes.length;

        nodes.forEach((node, index) => {
            node.x = width / 2 + radius * Math.cos(index * angleStep);
            node.y = height / 2 + radius * Math.sin(index * angleStep);
        });
    }
    positionNodesInCircle(nodes); // Initial call to generate the graph
    // Apply positions to nodes
    node.attr('cx', d => d.x).attr('cy', d => d.y);
    adjustViewBox(); // Initial call to center the graph

    // Supporting function that will be used to rotate arrows based on edge direction
    function smoothFunction(x, k = 0.02, c = 275) {
        const exponent = -k * (x - c);
        const denominator = 1 + Math.exp(exponent);
        const result = 10 - (2 / denominator);
        return result;
    }

    /* Function to align edges */
    function setEdgePositions() {
        link.attr('d', d => {
            // Arc bidirectional edges
            if (d.bidirectional) {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy) * 1.2; // Arc radius
                return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
            }
            return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
        });

        if (directed) {
            link.each(function (d) {
                if (d.bidirectional) {
                    const path = d3.select(this);
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const length = Math.sqrt(dx * dx + dy * dy); // Arc radius

                    // Calculate the tangent angle at the end of the arc - used to rotate directed markers based on the edge curving
                    const angle = Math.atan2(dy, dx) + Math.PI / (smoothFunction(length));

                    // Create a unique marker ID for each arrow
                    const uniqueArrowId = `${arrowId}-${d.source.id}-${d.target.id}`;

                    // Append a unique marker for this edge if it doesn't already exist
                    if (!svg.select(`#${uniqueArrowId}`).node()) {
                        svg.append('defs')
                            .append('marker')
                            .attr('id', uniqueArrowId)
                            .attr('viewBox', '0 -5 10 10')
                            .attr('refX', 25)
                            .attr('refY', 0)
                            .attr('markerWidth', 6)
                            .attr('markerHeight', 6)
                            .attr('orient', 'auto')
                            .append('path')
                            .attr('d', 'M0,-5L10,0L0,5')
                            .attr('fill', edgeColor);
                    }

                    // Update the marker-end attribute of the path to use the unique marker to match the curve of bidirectional edge
                    path.attr('marker-end', `url(#${uniqueArrowId})`);

                    // Update the orient attribute of the unique marker
                    svg.select(`#${uniqueArrowId}`)
                        .attr('orient', angle * (180 / Math.PI)); // Convert radians to degrees
                } else {
                    // For non-bidirectional edges, use the default marker
                    const path = d3.select(this);
                    path.attr('marker-end', `url(#${arrowId})`);
                }
            });
        }

        // Add weights if weighted
        if (weighted) {
            edgeLabel
                .attr('x', d => {
                    const midpointX = (d.source.x + d.target.x) / 2;
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    if (d.bidirectional) {
                        const offsetX = Math.sin(angle) * length / 10;
                        return midpointX + offsetX;
                    }
                    return midpointX;
                })
                .attr('y', d => {
                    const midpointY = (d.source.y + d.target.y) / 2;
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    if (d.bidirectional) {
                        const offsetY = -Math.cos(angle) * length / 10;
                        return midpointY + offsetY;
                    }
                    return midpointY;
                });
        }

        node.attr('cx', d => d.x).attr('cy', d => d.y);
        label.attr('x', d => d.x).attr('y', d => d.y);
    }
    /* End of align edges */

    // Update positions on simulation
    simulation.on('tick', setEdgePositions);

    /* Auto-rearrange nodes functionality */
    centerGraphButton.addEventListener('click', () => {
        positionNodesInCircle(nodes);
        // Apply positions to nodes
        node.attr('cx', d => d.x).attr('cy', d => d.y);

        // Update link positions
        setEdgePositions();
        adjustViewBox();
        drawGrid();

        // positionNodesInCircle sets the simulation forces to null, enabling it based on use force checkbox
        simulation.alphaDecay(1);
        simulation.alphaTarget(0);
        if (useForceCheckbox.checked) {
            enableForceSimulation();
        };
    });
    /* End of auto-rearrange nodes functionality */
    /* End of functions to update positions */
    graphCount++; // Incrementing global graphCount
};
