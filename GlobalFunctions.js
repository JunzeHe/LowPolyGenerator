document.getElementById('btnLoad').addEventListener('click', loadImage);

document.getElementById("enableMesh").addEventListener('click', createMesh);

document.getElementById('enableColor').addEventListener('click', addColor);

document.getElementById('enableDelete').addEventListener('click', changeDeleteMode);

document.getElementById('createGenericMesh').addEventListener('click', createGenericMesh);

document.getElementById('fillWithAverage').addEventListener('click', fillWithAverage);

var edge_color_input = document.getElementById('edgeColor');
edge_color_input.addEventListener('focus', function (event) {
    text_enter = true;
});

edge_color_input.addEventListener('blur',
    function (event) {
        text_enter = false;
    });

edge_color_input.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        edge_color = edge_color_input.value;
        drawEntireMesh();
    }
});

var vertex_color_input = document.getElementById('vertexColor');
vertex_color_input.addEventListener('focus', function (event) {
    text_enter = true;
});

vertex_color_input.addEventListener('blur',
    function (event) {
        text_enter = false;
    });

vertex_color_input.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        vertex_color = vertex_color_input.value;
        drawEntireMesh();
    }
});

var vertex_radius_input = document.getElementById('vertexRadius');

vertex_radius_input.addEventListener('input', function (event) {
    console.log(vertex_radius_input.value);
    fidelity = vertex_radius_input.value;
    vertex_radius = fidelity / 2;
    line_width = vertex_radius * 0.35;
    drawEntireMesh();
})

var save_colors_button = document.getElementById('saveColors');
save_colors_button.addEventListener('click', function (event) {
    var merged_layer = document.createElement('canvas');
    var merged_context = merged_layer.getContext('2d');
    merged_layer.width = image_canvas.width;
    merged_layer.height = image_canvas.height;

    merged_context.drawImage(image_canvas, 0, 0, merged_layer.width, merged_layer.height);
    if (mesh_mode)
        merged_context.drawImage(mesh_canvas, 0, 0, merged_layer.width, merged_layer.height);
    if (color_mode)
        merged_context.drawImage(color_canvas, 0, 0, merged_layer.width, merged_layer.height);

    var data_url = merged_layer.toDataURL('image/png');
    var win = window.open(data_url, '_blank');
});

/**
 * Retrieves the point on the canvas that was clicked on relative to the canvas. Does not round.
 * @param   {Object} event [[Description]]
 * @returns {Array}  [[the coordinates that were clicked on, adjusted for all of the offsets]]
 */
function getPositionClicked(event) {
    var mouseX = event.x;
    var mouseY = event.y;

    var canvas_container = document.getElementById('canvases');

    mouseX -= canvas_container.offsetLeft;
    mouseY -= canvas_container.offsetTop;
    mouseX += window.scrollX;
    mouseY += window.scrollY;

    return [mouseX, mouseY];
}

function getPositionImageClick(event, context) {
    var original_canvas_coords = getPositionClicked(event);
    var image_coords = context.getImagePoints(original_canvas_coords[0], original_canvas_coords[1]);

    return [image_coords.x, image_coords.y];
}

/**
 * Retrieves the point clicked on relative to the image's current zoom and location. Does round.
 * @param   {[[Type]]} event   [[Description]]
 * @param   {[[Type]]} context [[Description]]
 * @returns {Array}    [[Description]]
 */
function getPositionImageClickRound(event, context) {
    var image_coords = getPositionImageClick(event, context);

    var imageX = roundToNearest(image_coords[0]);
    var imageY = roundToNearest(image_coords[1]);

    return [imageX, imageY];
}

/**
 * Chooses the nearest point to the one selected for more precision
 * @param   {[[int]]} chosen_point [[the coordinate initally chosen by the user]]
 * @returns {[[int]]} [[more precise coordinate near the inital coordinate]]
 */
function roundToNearest(chosen_point) {
    //Between a rock and a hard place
    var rock = Math.floor(chosen_point / fidelity) * fidelity;
    var hard_place = rock + fidelity;

    var distance_to_rock = Math.abs(chosen_point - rock);
    var distance_to_hard_place = Math.abs(chosen_point - hard_place);

    return (distance_to_rock > distance_to_hard_place) ? hard_place : rock;
}

/**
 * Retrieves which triangle was clicked in by testing through all of the triangles created so far.
 * @param   {[[int]]} mouseX [[x position of selected coordinate]]
 * @param   {[[int]]} mouseY [[y position of selected coordinate]]
 * @returns {[[int]]} [[index in array of triangles created]]
 */
function getTriangleIndex(mouseX, mouseY) {
    var triangle_index = 0;
    while (triangle_index < mesh_triangles.getSize()) {
        var curr_triangle = mesh_triangles.getTriangleByIndex(triangle_index);

        var dummy_context = document.getElementById('dummyLayer').getContext('2d');
        dummy_context.beginPath();
        dummy_context.moveTo(curr_triangle[0], curr_triangle[1]);
        dummy_context.lineTo(curr_triangle[2], curr_triangle[3]);
        dummy_context.lineTo(curr_triangle[4], curr_triangle[5]);
        dummy_context.lineTo(curr_triangle[0], curr_triangle[1]);
        dummy_context.closePath();

        if (dummy_context.isPointInPath(mouseX, mouseY)) {
            return triangle_index;
        }
        triangle_index++;
    }
    return -1;
}

/**
 * Draws the image on an appropriately sized canvas.
 */
function drawImage() {
    var canvas = document.getElementById('mainImage');
    var context = canvas.getContext("2d");
    clearLayer('mainImage');

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

/**
 * Turns off all the nodes
 */
function turnOffAllModes() {
    changeDeleteMode(false);
    changeColorMode(false);
    changeMeshMode(false);
}

/**
 * Redraws everything
 */
function redrawEverything() {
    drawImage();
    drawEntireMesh();
    fillAllTriangles();
}

var toggleMenuVisible = document.getElementById('toggleMenuVisible');
toggleMenuVisible.addEventListener('click',toggleMenuVisibility );

/**
 * Function to change how the  menu overlaps with the image 
 */
function toggleMenuVisibility() {
    var menu = document.getElementById('menu');
    var curr_zindex = menu.style.zIndex;

    if (curr_zindex === '99') {
        menu.style.zIndex = '101';
        toggleMenuVisible.value = "Hide Menu";
    } else {
        menu.style.zIndex = '99';
        toggleMenuVisible.value = "Show Menu";
    }
}