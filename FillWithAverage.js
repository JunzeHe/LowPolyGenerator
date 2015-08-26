/**
 * Fills all empty triangles in the mesh with the average value of the colors stored within the triangle
 */
function fillWithAverage() {
    console.log("Fill with average called");
    var curr_triangle_index = 0;
    while (curr_triangle_index < mesh_triangles.getSize()) {

        if (!mesh_triangles.getFilledAtIndex(curr_triangle_index)) {

            var curr_triangle = mesh_triangles.getTriangleByIndex(curr_triangle_index);
            var box_around_triangle = getBoxAroundTriangle(curr_triangle);
            var dummy_context = document.getElementById('dummyLayer').getContext('2d');

            window.setTimeout(timeoutFillIn, 5, curr_triangle, dummy_context, box_around_triangle, curr_triangle_index);
        }
        curr_triangle_index++;
    }
    //Allow for the colors to be displayed
    changeColorMode(true);
    console.log("Done");
}

function timeoutFillIn(curr_triangle, dummy_context, box_around_triangle, curr_triangle_index) {

    createTrianglePath(curr_triangle, dummy_context);
    var average_color = averageColorsInTriangle(box_around_triangle, dummy_context);

    fillTriangleWithColor(curr_triangle_index, average_color);

}

/**
 * Funcion that finds the sum of an array
 * @param   {array} array [An array of numbers]
 * @returns {number} [the sum of all the numbers in the array]
 */
function sumArray(array) {
    var sum = 0;
    for (var curr_element = 0; curr_element < array.length; curr_element++) {
        sum += array[curr_element];
    }
    return sum;
}

/**
 * Creates a box surrounding the current triangle using the smallest x and y values and the largets x and y values
 * @param   {array} curr_triangle [A one dimensonal array containing the 3 vertices of a triangle with each vertex taking up two indexes for x and y]
 * @returns {object} [object contains the upper left corner of the box and the lower right corner]
 */
function getBoxAroundTriangle(curr_triangle) {
    var box_vertices = {};

    box_vertices['min_x'] = parseInt(Math.min(curr_triangle[0], curr_triangle[2], curr_triangle[4]));
    box_vertices['min_y'] = parseInt(Math.min(curr_triangle[1], curr_triangle[3], curr_triangle[5]));
    box_vertices['max_x'] = parseInt(Math.max(curr_triangle[0], curr_triangle[2], curr_triangle[4]));
    box_vertices['max_y'] = parseInt(Math.max(curr_triangle[1], curr_triangle[3], curr_triangle[5]));

    return box_vertices;
}

/**
 * Creates a triangular path with the coordinates so to enable determining  if a point is in path
 * @param {[[Type]]} currTriangle [[Description]]
 * @param {[[Type]]} context      [[Description]]
 */
function createTrianglePath(currTriangle, context) {
    context.beginPath();
    context.moveTo(currTriangle[0], currTriangle[1]);
    context.lineTo(currTriangle[2], currTriangle[3]);
    context.lineTo(currTriangle[4], currTriangle[5]);
    context.lineTo(currTriangle[0], currTriangle[1]);
    context.closePath();
}

/**
 * Generates a color string containing the average colors in triangle
 * @param   {Object}   boxAroundTriangle [[Description]]
 * @param   {[[Type]]} context           [[Description]]
 * @returns {String}   [[Description]]
 */
function averageColorsInTriangle(boxAroundTriangle, context) {
    //Storing all the color values for summing later
    var reds = [];
    var greens = [];
    var blues = [];

    for (var curr_x = boxAroundTriangle.min_x; curr_x <= boxAroundTriangle.max_x; curr_x++) {
        for (var curr_y = boxAroundTriangle.min_y; curr_y <= boxAroundTriangle.max_y; curr_y++) {
            if (context.isPointInPath(curr_x, curr_y)) {
                var image_data = context.getImageData(curr_x, curr_y, 1, 1).data;
                reds.push(image_data[0]);
                greens.push(image_data[1]);
                blues.push(image_data[2]);
            }
        }
    }

    //Average out all the colors
    var red_average = parseInt(sumArray(reds) / reds.length);
    var green_average = parseInt(sumArray(greens) / greens.length);
    var blue_average = parseInt(sumArray(blues) / blues.length);

    return 'rgba(' + red_average + ', ' + green_average + ', ' + blue_average + ', 1.0)';
}