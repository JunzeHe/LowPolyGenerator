document.getElementById('posterize').addEventListener('click', posterize);

//How much posterization to do 
var interval_size = 60;

/**
 * Posterizes the image
 */
function posterize() {
    console.log("Posterize called!");
    var colors = color_context.getImageData(0, 0, image.width, image.height).data;
    for (var row_num = 0; row_num < image.height; row_num++) {
        for (var col_num = 0; col_num < image.width; col_num++) {
            window.setTimeout(setPixelColor, 4, row_num, col_num, colors);
        }
    }
    console.log("Done");
}

/**
 * Sets the color for a single pixels. Assists with posterization.
 * @param {[[Type]]} row_num [[Description]]
 * @param {[[Type]]} col_num [[Description]]
 * @param {[[Type]]} colors  [[Description]]
 */
function setPixelColor(row_num, col_num, colors) {
    var curr_color_index = ((row_num * image.width) + (col_num)) * 4;
    var red = colors[curr_color_index];
    var green = colors[curr_color_index + 1];
    var blue = colors[curr_color_index + 2];

    red = interval_size * Math.round(red / interval_size);
    green = interval_size * Math.round(green / interval_size);
    blue = interval_size * Math.round(blue / interval_size);

    color_context.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
    color_context.fillRect(col_num, row_num, 1, 1);
}