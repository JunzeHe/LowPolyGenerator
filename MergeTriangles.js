//Functions created to help me merge triangles
//Ultimately turned out to be way too advanced and requires heavy mathematical computation 

/******
Algorithms I tried for automatically creating low-poly: 
    * Creating a bunch of random triangles and then merging triangles if the color values were similar
    * Posterizing so that color values would be more similar and therefore the random triangles will automatically merge themselves. 
    * Split picture into different regions of color and then assign random points within those regions -> failed from the start because I needed an algorithm to split the picture into regions
    * Color reduce and then "sharpen" the image by filling in the gaps of similar pixels  -> did not even know how to start with this one
    * Use a genetic algorithm and use random points like crazy
    * Barely working solution: Create random points, fill it in, and then posterize the filled in area
******/

/**
 * Main function for merging triangles.
 */
function mergeTriangles() {
    //Determine which shared vertex is closest to the end points
    //Move closest point to intersection of the line drawn by the unshared points and the line drawn by the shared points
    //Remove both triangles
    //Add in large triangle
    //fill in triangle (optional)
    //Only allow triangles to be merged once 

    var first_triangle = mesh_triangles.getTriangleByIndex(0);
    var second_triangle = mesh_triangles.getTriangleByIndex(1);

    var edge_facts = getEdgeFacts(first_triangle, second_triangle);
    var shared_edges = edge_facts[0];
    var unshared_points = edge_facts[1];

    var furthest_shared_vert = getFurthestVertex(shared_edges, unshared_points);
    shared_edges.splice(shared_edges.indexOf(furthest_shared_vert[0]), 1);
    shared_edges.splice(shared_edges.indexOf(furthest_shared_vert[1]), 1);
    //      Shared edges should now only contain the point that is closest to the unused points

    var future_point = checkLineIntersection(shared_edges[0], shared_edges[1], unshared_points[0], unshared_points[1], shared_edges[2], shared_edges[3], unshared_points[2], unshared_points[3]);
    console.log(future_point);

    mesh_triangles.rearrangeVertex(shared_edges[0], shared_edges[1], future_point[0], future_point[1]);
    drawEntireMesh();
}

/**
 * [Returns the shared edge and the vertices that are not included in that shared edge]
 * @param   {Array} firstTriangle  [[Description]]
 * @param   {Array} secondTriangle [[Description]]
 * @returns {Array} [[A two dimensional array. The first index contains an array which describes the shared edge. The second index contains an array of the points that are not shared between the two triangles]]
 */
function getEdgeFacts(firstTriangle, secondTriangle) {
    firstTriangle = firstTriangle.slice(); //Copying triangles to prevent them from being changed
    secondTriangle = secondTriangle.slice();
    var shared_edge = [];
    var unshared_points = [];

    for (var first_index = firstTriangle.length - 2; first_index >= 0; first_index -= 2) {
        var curr_x = firstTriangle[first_index];
        var curr_y = firstTriangle[first_index + 1];

        for (var sec_index = secondTriangle.length - 2; sec_index >= 0; sec_index -= 2) {
            var sec_x = secondTriangle[sec_index];
            var sec_y = secondTriangle[sec_index + 1];
            if (Math.round(sec_x) === Math.round(curr_x) && Math.round(sec_y) === Math.round(curr_y)) {
                shared_edge.push(curr_x);
                shared_edge.push(curr_y);

                firstTriangle.splice(first_index, 2);
                secondTriangle.splice(sec_index, 2);
            }
        }
    }
    unshared_points = unshared_points.concat(firstTriangle);
    unshared_points = unshared_points.concat(secondTriangle);
    return [shared_edge, unshared_points];
}

/**
 * Returns the vertex that is the furthest away from a set of points from a set of two points.
 * @param   {[[Type]]} sharedEdges    [[An array containing the coordinates for two points, which create a line]]
 * @param   {[[Type]]} unsharedPoints [[An array containing the cordinates for two points which are unshared by the two triangles]]
 * @returns {[[Type]]} [[Description]]
 */
function getFurthestVertex(sharedEdges, unsharedPoints) {
    var first_distance = getDistBetPoints(sharedEdges[0], sharedEdges[1], unsharedPoints[0], unsharedPoints[1]) + getDistBetPoints(sharedEdges[0], sharedEdges[1], unsharedPoints[2], unsharedPoints[3]);
    var second_distance = getDistBetPoints(sharedEdges[2], sharedEdges[3], unsharedPoints[0], unsharedPoints[1]) + getDistBetPoints(sharedEdges[2], sharedEdges[3], unsharedPoints[2], unsharedPoints[3]);

    return (first_distance >= second_distance ? [sharedEdges[0], sharedEdges[1]] : [sharedEdges[2], sharedEdges[3]]);
}

/**
 * Calculates the distances between two points
 * @param   {[[Type]]} firstX  [[Description]]
 * @param   {[[Type]]} firstY  [[Description]]
 * @param   {[[Type]]} secondX [[Description]]
 * @param   {[[Type]]} secondY [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
function getDistBetPoints(firstX, firstY, secondX, secondY) {
    return Math.sqrt(Math.pow(firstX - secondX, 2) + Math.pow(firstY - secondY, 2));
}

//Code and math borrowed from http://jsfiddle.net/justin_c_rounds/Gd2S2/
/**
 * Originally intended to determine where two lines, represented by two points on the line, would intersect. Ultimately it became too complicated to use this because it used a vector and I would have to calculate the directions.
 * @param   {[[Type]]} line1StartX [[Description]]
 * @param   {[[Type]]} line1StartY [[Description]]
 * @param   {[[Type]]} line1EndX   [[Description]]
 * @param   {[[Type]]} line1EndY   [[Description]]
 * @param   {[[Type]]} line2StartX [[Description]]
 * @param   {[[Type]]} line2StartY [[Description]]
 * @param   {[[Type]]} line2EndX   [[Description]]
 * @param   {[[Type]]} line2EndY   [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    /*
            // it is worth noting that this should be the same as:
            x = line2StartX + (b * (line2EndX - line2StartX));
            y = line2StartX + (b * (line2EndY - line2StartY));
            */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};