document.getElementById('createRandomMesh').addEventListener('click', createRandomMesh);

/**
 * Creates a mesh by initiating a bunch of random points and strategically connecting them.
 */
function createRandomMesh() {
    //How many random triangles to create per width
    var num_hori_intervals = Math.round(image.width / 20);
    var interval_width = Math.round(image.width / num_hori_intervals);
    var random_locations = create2DArray(image.height / interval_width);

    changeMeshMode(true);
    //drawTestGrid(num_hori_intervals); 
    random_locations = setRandomPoints(num_hori_intervals, random_locations);
    console.log(JSON.stringify(random_locations));
    connectPoints(random_locations);
    drawEntireMesh();
}

/**
 * Assigns random points to the picture. Creates a grid in the picture and then randomly assigns a point within each cell.
 * @param   {[[Type]]} num_hori_intervals [[Description]]
 * @param   {[[Type]]} random_locations   [[Description]]
 * @returns {[[Array]]} [[Locations of where each random point was created within each cell]]
 */
function setRandomPoints(num_hori_intervals, random_locations) {
    var interval_width = Math.round(image.width / num_hori_intervals);
    var num_verti_intervals = Math.round(image.height / interval_width);

    for (var row_num = 0; row_num < num_verti_intervals; row_num += 1) {
        for (var col_num = 0; col_num < num_hori_intervals; col_num += 1) {

            var rand_max = interval_width - vertex_radius - 3;
            var rand_min = Math.round(vertex_radius);
            //1 offset to prevent hitting edges
            var random_x = Math.round(Math.random() * rand_max) + rand_min;
            var random_y = Math.round(Math.random() * rand_max) + rand_min;

            drawVertex(random_x + (col_num * interval_width), random_y + (row_num * interval_width));
            random_locations[row_num][col_num] = [random_x + (col_num * interval_width), random_y + (row_num * interval_width)];
        }
    }
    return random_locations;
}

/**
 * Testing function to show how the points are randomly being distributed within each cell.
 * @param {[[Type]]} numIntervals [[Description]]
 */
function drawTestGrid(numIntervals) {
    var side_len = image.width / numIntervals;
    var stroke_color = 'rgb(255, 0, 0)';

    for (var x = 0; x < (image.width); x += side_len) {
        mesh_context.beginPath();
        mesh_context.moveTo(x, 0);
        mesh_context.lineTo(x, image.height);
        mesh_context.strokeStyle = stroke_color;
        mesh_context.strokeWidth = '2px';
        mesh_context.stroke();
    }
    for (var y = 0; y <= (image.height); y += side_len) {
        mesh_context.beginPath();
        mesh_context.moveTo(0, y);
        mesh_context.lineTo(image.width, y);
        mesh_context.strokeStyle = stroke_color;
        mesh_context.strokeWidth = '2px';
        mesh_context.stroke();
    }
}

/**
 * Initailizes a two dimensional array.
 * @param   {[[Type]]} vertical_length [[Description]]
 * @returns {[[Type]]} [[Initialized two dimensional array]]
 */
function create2DArray(vertical_length) {
    var created_array = [];
    for (var curr_vert = 0; curr_vert < vertical_length + 1; curr_vert++) {
        created_array[curr_vert] = [];
    }
    return created_array;
}

/**
 * Connects points to from adjacent and lower triangles.
 * @param {[[Type]]} randomLocations [[Description]]
 */
function connectPoints(randomLocations) {
    for (var row_num = 0; row_num < randomLocations.length - 1; row_num++) {
        for (var col_num = 0; col_num < randomLocations[0].length - 1; col_num++) {
            var curr_vertex = randomLocations[row_num][col_num];
            var adjacent_vertex = randomLocations[row_num][col_num + 1];
            var lower_vertex = randomLocations[row_num + 1][col_num];
            var lower_adj_vertex = randomLocations[row_num + 1][col_num + 1];

            window.setTimeout(createTriangle, 4, curr_vertex, adjacent_vertex, lower_vertex);
            window.setTimeout(createTriangle, 4, adjacent_vertex, lower_vertex, lower_adj_vertex);
        }
    }
}

/**
 * Helper function to store all of the vertices in a row
 * @param {[[Type]]} first_vertex  [[Description]]
 * @param {[[Type]]} second_vertex [[Description]]
 * @param {[[Type]]} third_vertex  [[Description]]
 */
function createTriangle(first_vertex, second_vertex, third_vertex) {
    if (!first_vertex || !second_vertex || !third_vertex)
        return;
    //console.log(JSON.stringify(first_vertex) + " " + JSON.stringify(second_vertex) + JSON.stringify(third_vertex));
    storeVertex(first_vertex[0], first_vertex[1]);
    storeVertex(second_vertex[0], second_vertex[1]);
    storeVertex(third_vertex[0], third_vertex[1]);
}