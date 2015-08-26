/**
 * Function that automatically generates a mesh consisting of all equilateral triangles next to each ohter
 */
function createGenericMesh() {
    changeMeshMode(true);
    var num_triangles_per_row = 35; //Never set beyond 15 unless resolution is super low
    var edge_len = parseInt(image_canvas.width / num_triangles_per_row);
    var trig_height = parseInt(edge_len * (Math.pow(3, 0.5) / 2));

    var vertex_locations = [];
    var interval_id = -1;
    for (var curr_y = 0; curr_y < image_canvas.height; curr_y += trig_height) {

        var curr_x = 0;
        var offset = edge_len / 2;
        if ((curr_y / trig_height) % 2 === 1) {
            curr_x = offset;
        }
        for (; curr_x < image_canvas.width; curr_x += edge_len) {
            //Creates two triangles per point
            interval_id = window.setTimeout(createTrianglesFromPoint, 5,curr_x, curr_y, edge_len, trig_height, offset); 
        }
    }
}

function createTrianglesFromPoint(curr_x, curr_y, edge_len, trig_height, offset) {
    storeVertex(curr_x, curr_y);
    storeVertex(curr_x + edge_len, curr_y);
    storeVertex(curr_x + offset, curr_y + trig_height);

    storeVertex(curr_x, curr_y);
    if (curr_x === 0) {
        storeVertex(0, curr_y + trig_height);
    } else {
        storeVertex(curr_x - offset, curr_y + trig_height);
    }
    storeVertex(curr_x + offset, curr_y + trig_height);
}