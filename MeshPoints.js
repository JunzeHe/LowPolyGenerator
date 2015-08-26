/**
 * A datastructure to contain all of the points and the subsequent triangles created by those points in the mesh.
 * Used in place of an object for each triangle to take advantage of the built in indexOf for searching for triangles with desired vertices
 */
function MeshPoints() {
    //A triangle will have three points, which means a total of 6 point values. Each of those values will be separated into one of these 6 arrays. A triangle can be created by using an index, and gathering all the values matching that index in the arrays. 
    var x1 = [];
    var y1 = [];
    var x2 = [];
    var y2 = [];
    var x3 = [];
    var y3 = [];
    var filled = []; //Array to ensure that any triangle is filled only once
    var color_strings = []; //Array to store color strings that they can be removed later on
    /**
     * Adds a triangle to the data structure by storings its connected points.
     * The parameters do not have to be ordered
     * @param {array} coord1 A (x,y) [pair of one of the points in the triangle]
     * @param {array} coord2 A (x,y) [pair of one of the points in the triangle]
     * @param {array} coord3 A (x,y) [pair of one of the points in the triangle]
     * @return new length of triangle array
     */
    this.addTriangle = function (coord1, coord2, coord3) {
        var orderedCoords = orderCoords(coord1, coord2, coord3);
        var orderedCoord1 = orderedCoords[0];
        var orderedCoord2 = orderedCoords[1];
        var orderedCoord3 = orderedCoords[2];

        x1.push(orderedCoord1[0]);
        y1.push(orderedCoord1[1]);
        x2.push(orderedCoord2[0]);
        y2.push(orderedCoord2[1]);
        x3.push(orderedCoord3[0]);
        y3.push(orderedCoord3[1]);

        filled.push(false);
       // color_strings.push('rgba(0, 0, 0, 0.0)');
        color_strings.push('');

        return x1.length;
    }

    /**
     * Removes a triangle that has been stored at the index
     * @param {[[Type]]} triangleIndex [[Description]]
     */
    this.removeTriangle = function (triangleIndex) {
        x1.splice(triangleIndex, 1);
        y1.splice(triangleIndex, 1);
        x2.splice(triangleIndex, 1);
        y2.splice(triangleIndex, 1);
        x3.splice(triangleIndex, 1);
        y3.splice(triangleIndex, 1);

        filled.splice(triangleIndex, 1);
        color_strings.splice(triangleIndex, 1);
    }

    /**
     * Orders the coordinates by the lowest x value, and then when tied, by the lowest y value
     * @param   {array} coord1 [pair of coordinates in the triangle]
     * @param   {array} coord2 [pair of coordinates in the triangle]
     * @param   {array} coord3 [pair of coordinates in the triangle]
     * @returns {[][]}    An array containing the 3 ordered points of a triangle, with each point represented as an array.
     */
    var orderCoords = function (coord1, coord2, coord3) {
        var orderedPoints = [];
        var allX = [coord1[0], coord2[0], coord3[0]];
        var allY = [coord1[1], coord2[1], coord3[1]];

        while (allX.length > 0) {
            var smallestXIndex = findMinX(allX, allY);


            orderedPoints.push([allX[smallestXIndex], allY[smallestXIndex]]);

            allX.splice(smallestXIndex, 1);
            allY.splice(smallestXIndex, 1);
        }

        return orderedPoints;
    }

    /**
     * Helper function to help find the point with the smallest x
     * @param   {[]} allX [array containing the x values of all the points in a triangle]
     * @param   {[]} allY [array containing the corresponding y values of all the points]
     * @returns {int} [the index of the point with the lowest x value]
     */
    var findMinX = function (allX, allY) {
        var currIndex = 1;
        var smallestIndex = 0;
        var smallestX = allX[smallestIndex];
        var smallestY = allY[smallestIndex]; //Not actually the smallest y, just the y that corresponds to the smallest x 
        while (currIndex < allX.length) {
            var currX = allX[currIndex];
            var currY = allY[currIndex];
            if (smallestX > currX || (smallestX === currX && smallestY > currY)) {
                smallestIndex = currIndex;
                smallestX = currX;
                smallestY = currY;
            }
            currIndex++;
        }
        return smallestIndex;
    }

    /**
     * Retrieves a triangle given the index of the triangle in the data structure
     * @param   {Integer} index
     * @returns {Array}    [An array containg the 6 points in the triangle. Every other  number is the start of the next pair.]
     */
    this.getTriangleByIndex = function (index) {
        return [x1[index], y1[index], x2[index], y2[index], x3[index], y3[index]];
    }

    /**
     * Returns how many triangles are currently in the mesh
     * @returns {int} size
     */
    this.getSize = function () {
        return x1.length;
    }

    /**
     * Returns if the triangle at the index has already been filled
     * @param   {[[Type]]} index [[Description]]
     * @returns {[[bool]]} [[a boolean describing whether the triangle at the index has been filled]]
     */
    this.getFilledAtIndex = function (index) {
        if (index > filled.length)
            return true;
        return filled[index];
    }

    /**
     * Sets the triangle at the index to be filled
     * @param {[[Type]]} index [[Description]]
     */
    this.setFilledAtIndex = function (index) {
        filled[index] = true;
    }

    /**
     * Sets a color string for an index
     * @param {[[Type]]} index       [[Description]]
     * @param {[[Type]]} colorString [[Description]]
     */
    this.setColorString = function (index, colorString) {
        color_strings[index] = colorString;
    }

    /**
     * Retrieves a color string at an index
     * @param   {[[Type]]} index [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    this.getColorString = function (index) {
        return color_strings[index];
    }

    /**
     * A function to search for all triangles containing a vertex
     * @param   {[[Type]]} queryX [[Description]]
     * @param   {[[Type]]} queryY [[Description]]
     * @returns {Array}    [[an array containing the indexes of all triangles containing the vertex in reverse order because that is the order that it should be deleted in ]]
     */
    this.searchForVertex = function (queryX, queryY) {

        var x1_hits = searchThroughArray(queryX, queryY, x1, y1);
        var x2_hits = searchThroughArray(queryX, queryY, x2, y2);
        var x3_hits = searchThroughArray(queryX, queryY, x3, y3);

        var index_matches = x1_hits.concat(x2_hits, x3_hits);
        index_matches.sort(compareFuncReverse);

        return index_matches;
    }

    /**
     * Helper function that searches through one set of vertices to determine if it contains the selected one
     * @param   {[[Type]]} queryX [[Description]]
     * @param   {[[Type]]} queryY [[Description]]
     * @param   {[[Type]]} arrayX [[Description]]
     * @param   {[[Type]]} arrayY [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    function searchThroughArray(queryX, queryY, arrayX, arrayY) {
        var index_matches = [];

        var hitX = arrayX.indexOf(queryX);
        while (hitX != -1) {
            if (arrayY[hitX] === queryY) {
                index_matches.push(hitX);
            }
            hitX = arrayX.indexOf(queryX, hitX + 1);
        }

        return index_matches;
    }


    /**
     * Helper compare function for sorting the generated results in reverse.
     * @param   {[[Type]]} x [[Description]]
     * @param   {[[Type]]} y [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    function compareFuncReverse(x, y) {
        if (x >= y)
            return -1;
        else
            return 1;
    }
    
    /**
     * Rearranges a vertex of a triangle to another location and affects all triangles containing that vertex
     * @param {[[Type]]} currX   [[Description]]
     * @param {[[Type]]} currY   [[Description]]
     * @param {[[Type]]} futureX [[Description]]
     * @param {[[Type]]} futureY [[Description]]
     */
    this.rearrangeVertex = function(currX, currY, futureX, futureY){
        
        var pot_index_x1 = searchThroughArray(currX, currY, x1, y1); 
        var pot_index_x2 = searchThroughArray(currX, currY, x2, y2); 
        var pot_index_x3 = searchThroughArray(currX, currY, x3, y3);
        
        for(var pot_index_index = 0; pot_index_index < pot_index_x1.length; pot_index_index++){
            var triangle_index = pot_index_x1[pot_index_index]; 
            x1[triangle_index] = futureX; 
            y1[triangle_index] = futureY; 
        }
        
         for(var pot_index_index = 0; pot_index_index < pot_index_x2.length; pot_index_index++){
            var triangle_index = pot_index_x2[pot_index_index]; 
            x2[triangle_index] = futureX; 
            y2[triangle_index] = futureY; 
        }
        
         for(var pot_index_index = 0; pot_index_index < pot_index_x3.length; pot_index_index++){
            var triangle_index = pot_index_x3[pot_index_index]; 
            x3[triangle_index] = futureX; 
            y3[triangle_index] = futureY; 
        }
    }
    
    
}