/**
 * Changes the current mode to delete mode
 * Disables the other two modes but leaves the mesh_layer visible and changes its event listener for clicks
 * @param {[[Type]]} target [[Description]]
 */
function changeDeleteMode(target) {
    var delete_button = document.getElementById('enableDelete');
    if (typeof target === 'boolean') {
        delete_mode = target;
    } else {
        delete_mode = !delete_mode;
        changeMeshMode(!delete_mode);
        changeColorMode(!delete_mode);
    }
    //Update the button for user feedback
    delete_button.className = (delete_mode ? "enabled_button" : "disabled_button");

    if (delete_mode) {
        mesh_canvas.style.display = "inline";
        mesh_canvas.addEventListener('click', getPositionDelete);
    } else {
        mesh_canvas.removeEventListener('click', getPositionDelete);
    }
}

/**
 * Retrieves the point on the canvas that was deleted.
 * If the point selected was a vertex, then all triangles containing that vertex is removed from the mesh.
 * If the the point selected was contained within a triangle
 * @param {[[Type]]} event [[Description]]
 */
function getPositionDelete(event) {
    var image_coords = getPositionImageClickRound(event, image_context);
    var mouseX = image_coords[0];
    var mouseY = image_coords[1];

    var triangles_with_vertex = mesh_triangles.searchForVertex(mouseX, mouseY);

    if (triangles_with_vertex.length > 0) {
        removeTrianglesFromCanvas(triangles_with_vertex);
    } else {
        //Find the triangle that contains the point clicked
        var triangle_index = getTriangleIndex(mouseX, mouseY);

        if (triangle_index != -1) {
            mesh_triangles.removeTriangle(triangle_index);
            redrawEverything();
        }
    }
}

/**
 * Removes all the triangles containing the vertex from the collection of all triangles. Updates the display to reflect the change
 * @param {array} triangles_to_remove [[contains all the indices that correspond to a triangle which contains the coordinate, should be handled in reverse order]]
 */
function removeTrianglesFromCanvas(triangles_to_remove) {
    var triangle_remove_index = 0;
    while (triangle_remove_index < triangles_to_remove.length) {
        var curr_triangle_index = triangles_to_remove[triangle_remove_index];
        mesh_triangles.removeTriangle(curr_triangle_index);
        triangle_remove_index++;
    }
    redrawEverything();
}

/**
 * Redraws all of the edges that have been stored. Will be useful for deleting edges and vertices.
 */
function drawEntireMesh() {
    clearLayer('meshLayer');

    var num_triangles = mesh_triangles.getSize();
    var triangle_index = 0;

    while (triangle_index < num_triangles) {
        var current_triangle = mesh_triangles.getTriangleByIndex(triangle_index);

        var vertex_index = 0;
        while (vertex_index < current_triangle.length) {
            drawVertex(current_triangle[vertex_index], current_triangle[vertex_index + 1]);
            drawLine(current_triangle[vertex_index], current_triangle[vertex_index + 1], current_triangle[(vertex_index + 2) % 6], current_triangle[(vertex_index + 3) % 6], edge_color, 'meshLayer');
            vertex_index += 2;
        }
        triangle_index++;
    }
}

/**
 * Clears out whatever is currently on the mesh layer so that it can be updated later on.
 * @param {[[Type]]} [layerId='meshLayer'] [[id of the layer to clear]]
 */
function clearLayer(layerId) {
    var canvas = document.getElementById(layerId);
    var context = canvas.getContext("2d");

    var canvas_origin = context.getImagePoints(0, 0);
    var canvas_dimensions = context.getImagePoints(canvas.width, canvas.height);
    context.clearRect(canvas_origin.x, canvas_origin.y, canvas_dimensions.x - canvas_origin.x, canvas_dimensions.y - canvas_origin.y);

    context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Fills in all current triangles to update the canvas after a triangle has been removed.
 */
function fillAllTriangles() {
    var layer_id = 'colorLayer';

    clearLayer(layer_id);

    var triangle_index = 0;

    while (triangle_index < mesh_triangles.getSize()) {

        var curr_color = mesh_triangles.getColorString(triangle_index);
        fillTriangleWithColor(triangle_index, curr_color);
        triangle_index++;
    }
}