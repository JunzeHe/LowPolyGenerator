var vertexOrder = 0; //Keeps track of how many vertices have already been collected. A triangle is formed when vertextOrder reaches 3
var currentVertices = []; //An array that stores all the coordinates that have already been selected. Coordinates will be stored as an array of length 2

/**
 * Initiates mesh mode
 * Wrapper to  prevent event from being a parameter of changeMeshMode
 */
function createMesh(event) {
    changeMeshMode();
}

/**
 * Creates another canvas of the same size in the same location as the image canvas.
 * Used to preserve the original image when adding a point or replacing the colors
 */
function createMeshLayer() {
    if (!mesh_not_created) {
        return;
    }
    mesh_not_created = false;

    var original_image = document.getElementById('mainImage');
    var mesh_canvas = document.getElementById('meshLayer');

    var mesh_context = mesh_canvas.getContext('2d');

    mesh_canvas.width = image_canvas.width;
    mesh_canvas.height = image_canvas.height;
    mesh_canvas.style.marginLeft = image_canvas.style.marginLeft;
    mesh_canvas.style.display = "inline";

    mesh_context.beginPath();
    mesh_context.rect(0, 0, mesh_canvas.width, mesh_canvas.height);
    mesh_context.fillStyle = 'rgba(100,255, 2, 0.0)';
    mesh_context.closePath();
    mesh_context.fill();

    mesh_mode = false;
    var mesh_canvas = document.getElementById('meshLayer');
    mesh_canvas.style.display = "none";
}

/**
 * Triggers or disengages the mesh mode and appropriately handles the event listeners.
 * Can be used to set the mesh mode to a specific value as well.
 * @param {[[bool]]} target [[desired value of mesh_mode]]
 */
function changeMeshMode(target) {
    if (typeof target === 'undefined') {
        mesh_mode = !mesh_mode;
    } else
        mesh_mode = target;

    var mesh_button = document.getElementById('enableMesh');
    mesh_button.className = mesh_mode ? 'enabled_button' : 'disabled_button';

    var mesh_layer = document.getElementById('meshLayer');
    if (mesh_mode) {
        mesh_layer.addEventListener('click', getPositionMesh);
    } else {
        mesh_layer.removeEventListener('click', getPositionMesh);
    }

    var mesh_layer = document.getElementById('meshLayer');
    mesh_layer.style.display = (mesh_mode ? "inline" : "none");
    if (mesh_mode)
        drawEntireMesh();
}

/**
 * Retrieves the vertex in the canvas that was clicked on
 */
function getPositionMesh(event) {
    var clicked_coords = getPositionImageClickRound(event, mesh_context);
    var mouseX = clicked_coords[0];
    var mouseY = clicked_coords[1];

    storeVertex(mouseX, mouseY);
}

/**
 * Stores the selected vertex temporarily. When 3 vertices have been selected, a triangle has been created and it will be stored to mesh_edges.
 * Alerts the user if the vertex selected is invalid.
 * Draws a dot at the point selected if valid vertex.
 * @param {[[int]]} vertexX [[selected x coordinate]]
 * @param {[[int]]} vertexY [[selected y coordinate]]
 */
function storeVertex(vertexX, vertexY) {
    var isValidVertex = isValidSelVertex(vertexX, vertexY);
    if (!isValidVertex) {
        alert("Invalid vertex. Point has already been chosen");
        return;
    }
    //Valid vertex. Feedback to the user.
    drawVertex(vertexX, vertexY, vertexOrder);
    drawNewEdge(vertexX, vertexY);

    currentVertices.push([vertexX, vertexY]);

    vertexOrder++;
    if (vertexOrder == 3) {
        addToMesh();
        clearCurrentTriangle();
        //  drawEntireMesh(); //Disable for faster rendering
    }
}

/**
 * Determines if the selected point is a valid vertex or not.
 * A point is a valid vertex if it is not already a vertex in the developing triangle.
 * @param   {[[int]]} vertexX [[selected x coordinate]]
 * @param   {[[int]]} vertexY [[selected y coordinate]]
 * @returns {Boolean}  [[Description]]
 */
function isValidSelVertex(vertexX, vertexY) {
    var vertexIndex = 0;

    while (vertexIndex < currentVertices.length) {
        var currX = currentVertices[vertexIndex][0];
        var currY = currentVertices[vertexIndex][1];
        if (currX === vertexX && currY === vertexY) {
            return false;
        }
        vertexIndex++;
    }
    return true;
}

/**
 * Draws the vertex onto the mesh layer
 * @param {[[int]]} vertexX [[selected x coordinate]]
 * @param {[[int]]} vertexY [[selected y coordinate]]
 */
function drawVertex(vertexX, vertexY, vertexOrder) {
    if (typeof vertexOrder === 'undefined')
        vertexOrder = 2;
    var new_vertex_color = brightenVertex(vertexOrder);

    mesh_context.beginPath();
    mesh_context.arc(vertexX, vertexY, vertex_radius, 0, 2 * Math.PI, false);
    mesh_context.fillStyle = new_vertex_color;
    mesh_context.closePath();
    mesh_context.fill();
}

/**
 * Function to manipulate the color values of the final vertex value so that as the user progressively gets nearer the completing the triangle, the values become brighter.
 * @param   {[[Type]]} vertexOrder [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
function brightenVertex(vertexOrder) {
    var parenthesis_index = vertex_color.indexOf('(');
    var first_comma_index = vertex_color.indexOf(',');
    var red_color = parseInt(vertex_color.substring(parenthesis_index + 1, first_comma_index));
    var second_comma_index = vertex_color.indexOf(',', first_comma_index + 1);
    var green_color = parseInt(vertex_color.substring(first_comma_index + 1, second_comma_index));

    var third_comma_index = vertex_color.indexOf(',', second_comma_index + 1);
    var blue_color = parseInt(vertex_color.substring(second_comma_index + 1, third_comma_index));

    red_color = parseInt((vertexOrder + 1) * (red_color / 3));
    green_color = parseInt((vertexOrder + 1) * (green_color / 3));
    blue_color = parseInt((vertexOrder + 1) * (blue_color / 3));

    var new_vertex_color = 'rgba(' + red_color + ', ' + green_color + ', ' + blue_color + ', 1.0)';

    return new_vertex_color;
}

/**
 * Draws an edge between the most recently selected point and the previously selected point.
 * If the point chosen is the third and final point, will also close out the triangle.
 * To be used only for drawing new edges
 * @param {[[int]]} newX [[most recently selected x coordinate]]
 * @param {[[int]]} newY [[most recently selected y coordinate]]
 */
function drawNewEdge(newX, newY) {
    //The most previous point is the last one in the list
    if (currentVertices.length <= 0) {
        return;
    }
    var prevX = currentVertices[vertexOrder - 1][0];
    var prevY = currentVertices[vertexOrder - 1][1];

    drawLine(prevX, prevY, newX, newY, edge_color, 'meshLayer');

    if (vertexOrder === 2) {
        //Close the triangle
        var firstX = currentVertices[0][0];
        var firstY = currentVertices[0][1];
        drawLine(firstX, firstY, newX, newY, edge_color, 'meshLayer');
    }

}

/**
 * Helper function for drawing a line between two points of optional color and layer.
 * @param {[[int]]} startX              [[starting x coordinate]]
 * @param {[[int]]} startY              [[starting y coordinate]]
 * @param {[[int]]} endX                [[ending x coordinate]]
 * @param {[[int]]} endY                [[ending y coordinate]]
 * @param {[[string]]} [color='rgb(0,]     [[color of the line]]
 * @param {[[string]]} [layer='meshLayer'] [[id of the canvas layer to draw the lineto]]
 */
function drawLine(startX, startY, endX, endY, color, layer) {
    layer = layer || 'meshLayer';
    color = color || 'rgb(0, 0, 0)';
    var mesh_layer = document.getElementById(layer);
    var mesh_context = mesh_layer.getContext('2d');

    mesh_context.beginPath();
    mesh_context.moveTo(startX, startY);
    mesh_context.lineTo(endX, endY);
    mesh_context.closePath();
    mesh_context.strokeStyle = color;
    mesh_context.lineWidth = line_width;
    mesh_context.stroke();
}

/**
 * Stores the recently created mesh point to a mesh_edges data structure for future use.
 */
function addToMesh() {
    var first_vertex = currentVertices[0];
    var second_vertex = currentVertices[1];
    var third_vertex = currentVertices[2];

    mesh_triangles.addTriangle(first_vertex, second_vertex, third_vertex);
}

/**
 * Resets the set of points currently stored for the developing triangle, so that future triangles can be stored temporarily.
 */
function clearCurrentTriangle() {
    currentVertices = [];
    vertexOrder = 0;
}