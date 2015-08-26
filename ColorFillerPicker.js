/**
 * Initialization function
 * Used primarily to avoid calling create color layer with event as a parameter
 */
function addColor() {
    changeColorMode();
}

/**
 * Creates a color layer on top of the mesh layer
 */
function createColorLayer() {
    if (!color_not_created) {

        return;
    }

    color_not_created = false;
    var original_image = document.getElementById('mainImage');

    var color_layer = document.getElementById('colorLayer');
    var mesh_context = color_layer.getContext('2d');

    color_layer.width = original_image.width;
    color_layer.height = original_image.height;
    color_layer.style.marginLeft = original_image.style.marginLeft;
    color_layer.style.display = "inline";

    mesh_context.beginPath();
    mesh_context.rect(0, 0, color_layer.width, color_layer.height);
    mesh_context.fillStyle = 'rgba(100,255, 2, 0.0)';
    mesh_context.closePath();
    mesh_context.fill();

    color_mode = false;
    var color_layer = document.getElementById('colorLayer');
    color_layer.style.display = "none";
}

/**
 * Changes the program into color mode.
 * Attaches the event listener to the color layer.
 */
function changeColorMode(target) {
    if (typeof target === 'undefined')
        color_mode = !color_mode;
    else
        color_mode = target;

    var color_button = document.getElementById('enableColor');
    color_button.className = color_mode ? 'enabled_button' : 'disabled_button';
    if (mesh_mode) {
        document.getElementById('colorLayer').addEventListener('click', getPositionColor);
    } else {
        document.getElementById('colorLayer').removeEventListener('click', getPositionColor);
    }

    var color_layer = document.getElementById('colorLayer');
    color_layer.style.display = (color_mode ? "inline" : "none");
    if (color_mode)
        fillAllTriangles();
}

/**
 * Retrieves position on canvas that was clicked
 * @param {Object} event [[Description]]
 */
function getPositionColor(event) {
    var clicked_coords = getPositionImageClick(event, color_context);
    var mouseX = clicked_coords[0];
    var mouseY = clicked_coords[1];

    var triangle_index = getTriangleIndex(mouseX, mouseY);
    if (triangle_index >= 0 && !mesh_triangles.getFilledAtIndex(triangle_index)) {
        var color = getColorAtPoint(mouseX, mouseY);
        fillTriangleWithColor(triangle_index, color);
    }
}

/**
 * Retrieves the selected color
 * @param   {[[Type]]} mouseX [[Description]]
 * @param   {[[Type]]} mouseY [[Description]]
 * @returns {String}   [[the color to be set as the fillstyle]]
 */
function getColorAtPoint(mouseX, mouseY) {
    var dummy_layer = document.getElementById('dummyLayer');
    var dummy_context = dummy_layer.getContext('2d');

    var image_data = dummy_context.getImageData(mouseX, mouseY, 1, 1).data;

    return 'rgba(' + image_data[0] + "," + image_data[1] + "," + image_data[2] + ", 1.0)";
}

/**
 * Fills the selected triangle with the seelcted color
 * @param {[[Type]]} triangleIndex [[Description]]
 * @param {[[Type]]} triangleColor [[Description]]
 */
function fillTriangleWithColor(triangleIndex, triangleColor) {
    if (triangleIndex < 0 || triangleColor.length === 0)
        return;
    var selected_triangle = mesh_triangles.getTriangleByIndex(triangleIndex);

    var canvas = document.getElementById('colorLayer');
    var color_context = canvas.getContext('2d');

    color_context.beginPath();
    color_context.moveTo(selected_triangle[0], selected_triangle[1]);
    color_context.lineTo(selected_triangle[2], selected_triangle[3]);
    color_context.lineTo(selected_triangle[4], selected_triangle[5]);
    color_context.lineTo(selected_triangle[0], selected_triangle[1]);
    color_context.closePath();

    color_context.fillStyle = triangleColor;
    color_context.fill();

    mesh_triangles.setFilledAtIndex(triangleIndex);
    mesh_triangles.setColorString(triangleIndex, triangleColor);
}