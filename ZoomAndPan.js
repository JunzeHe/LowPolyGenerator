/*********
Some of the code generously provided by http://phrogz.net/tmp/canvas_zoom_to_cursor.html
*********/
var pan_mode = false;
var zoom_mode = false;
//Boolean to prevet functions from happening when key-press event fires repeatedly because the button is held down
var first_time_button_pressed = true;
//Preserving the original settings before turning them off temporarily for panning and zooming
var original_settings = {
    "mesh_mode": false,
    "color_mode": false,
    "delete_mode": false
};

/**
 * Allows the user to enter pan and zoom by pressing the right keyboard shortcuts
 */
document.addEventListener('keydown', function (event) {
    var key_pressed = String.fromCharCode(event.keyCode);
    //Will cause the event to constantly fire if key is held but I have created a work around
    if (text_enter)
        return;

    if (key_pressed === 'Z') {
        if (pan_mode)
            return;
        zoom_mode = true;
        pan_mode = false;
        if (first_time_button_pressed) {
            storeOriginalSettings();
            turnOffAllModes();
            first_time_button_pressed = false;
        }
    }

    if (key_pressed === ' ') {
        event.preventDefault();
        if (zoom_mode)
            return;
        pan_mode = true;
        zoom_mode = false;
        if (first_time_button_pressed) {
            storeOriginalSettings();
            turnOffAllModes();
            first_time_button_pressed = false;
        }
    }
    
    if (key_pressed === '0'){
        event.preventDefault();
        if(event.ctrlKey)
            resetPanZoom();
    }

    if (key_pressed === 'M') {
        var original_mesh_mode = mesh_mode;
        pan_mode = false;
        zoom_mode = false;
        turnOffAllModes();
        changeMeshMode(!original_mesh_mode);
    }

    if (key_pressed === 'C') {
        var original_color_mode = color_mode;
        pan_mode = false;
        zoom_mode = false;
        turnOffAllModes();
        changeMeshMode(!original_color_mode);
        changeColorMode(!original_color_mode);
    }
    if (key_pressed === 'D') {
        var original_delete_mode = delete_mode;
        pan_mode = false;
        zoom_mode = false;
        turnOffAllModes();
        changeDeleteMode(!original_delete_mode);
    }
    
    if(key_pressed==='V' && !event.altKey && !event.ctrlKey && !event.shiftKey){
        toggleMenuVisibility();
    }
    
});

/**  
 * Exists the user out of the pan and zoom modes
 */
document.addEventListener('keyup', function (event) {
    var key_lifted = String.fromCharCode(event.keyCode);

    if (key_lifted === 'Z' || key_lifted === ' ') {
        zoom_mode = false;
        pan_mode = false;

        restoreOriginalSettings();
    }
    first_time_button_pressed = true;
});

/**
 * Preserves the original settings before a pan/zoom
 */
function storeOriginalSettings() {
    original_settings['mesh_mode'] = mesh_mode;
    original_settings['color_mode'] = color_mode;
    original_settings['delete_mode'] = delete_mode;
}

/**
 * Restores the original settings after a pan/zoom
 */
function restoreOriginalSettings() {
    changeMeshMode(original_settings['mesh_mode']);
    changeColorMode(original_settings['color_mode']);
    changeDeleteMode(original_settings['delete_mode']);
}

var drag_start_image; //Coordinates of where the mouse started dragging relative to the image
var drag_start_canvas; //Coordinates of where the mouse started dragging relative to the overall canvas window/element

//Used to attach an event listener for pan and zoom mode
var canvases = document.getElementsByTagName('canvas');
var canvas_index = 0;

while (canvas_index < canvases.length) {

    canvases[canvas_index].addEventListener('mousedown', function (evt) {
        var clicked_coords = getPositionClicked(evt);
        var mouseX = clicked_coords[0];
        var mouseY = clicked_coords[1];

        drag_start_image = image_context.getImagePoints(mouseX, mouseY);

        drag_start_canvas = {
            x: mouseX,
            y: mouseY
        };
    }, false);

    canvases[canvas_index].addEventListener('mousemove', function (evt) {
        var clicked_coords = getPositionClicked(evt);
        var mouseX = clicked_coords[0];
        var mouseY = clicked_coords[1];

        if (drag_start_image) {

            if (pan_mode) {
                var pt = image_context.getImagePoints(mouseX, mouseY);
                var x_move_image = pt.x - drag_start_image.x;
                var y_move_image = pt.y - drag_start_image.y;
                image_context.translate(x_move_image, y_move_image);
                mesh_context.translate(x_move_image, y_move_image);
                color_context.translate(x_move_image, y_move_image);
            }
            if (zoom_mode) {
                var x_move = mouseX - drag_start_canvas.x;
                var ratio = x_move / image_canvas.width;
                fidelity = fidelity / (1 + ratio);
                vertex_radius = fidelity / 2;
                line_width = vertex_radius * 0.35;

                zoomed_amount = zoomed_amount * (1 + ratio);
                console.log(zoomed_amount)

                zoom(image_context, 1 + ratio, mouseX, mouseY);
                zoom(mesh_context, 1 + ratio, mouseX, mouseY);
                zoom(color_context, 1 + ratio, mouseX, mouseY);
            }
            if (pan_mode || zoom_mode) {
                drawImage();
                drawEntireMesh();
                fillAllTriangles();
            }
        }
    }, false);

    canvases[canvas_index].addEventListener('mouseup', function (evt) {
        drag_start_image = null;
    }, false);

    canvas_index++;
}

/**
 * Modified zoom function provided by the StackOverflow answer
 * @param {[[Type]]} context     [[Description]]
 * @param {[[Type]]} scaleAmount [[Description]]
 * @param {[[Type]]} mouseX      [[Description]]
 * @param {[[Type]]} mouseY      [[Description]]
 */
function zoom(context, scaleAmount, mouseX, mouseY) {
    var pt = context.getImagePoints(mouseX, mouseY);
    context.translate(pt.x, pt.y);
    context.scale(scaleAmount, scaleAmount);
    context.translate(-pt.x, -pt.y);
}

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.getImagePoints(x,y) - returns an SVGPoint
/**
 * Custom functions to add on to the canvas context
 * Only changed the name of the functions
 * @param   {Object}   ctx [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
function trackTransforms(ctx) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function () {
        return xform;
    };

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function () {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
    };
    var restore = ctx.restore;
    ctx.restore = function () {
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function (sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };
    var rotate = ctx.rotate;
    ctx.rotate = function (radians) {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };
    var translate = ctx.translate;
    ctx.translate = function (dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };
    var transform = ctx.transform;
    ctx.transform = function (a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a;
        m2.b = b;
        m2.c = c;
        m2.d = d;
        m2.e = e;
        m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
    };
    var setTransform = ctx.setTransform;
    ctx.setTransform = function (a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };
    var pt = svg.createSVGPoint();
    ctx.getImagePoints = function (canvasX, canvasY) {
        pt.x = canvasX;
        pt.y = canvasY;
        return pt.matrixTransform(xform.inverse());
    }
}

document.getElementById('resetPanZoom').addEventListener('click', resetPanZoom);

/**
 * Resets the amount that has been zoomed and panned in. 
 */
function resetPanZoom() {
    var translated_amount = image_context.getImagePoints(0, 0);
    var translated_x = translated_amount.x;
    var translated_y = translated_amount.y;
    image_context.translate(translated_x, translated_y);
    mesh_context.translate(translated_x, translated_y);
    color_context.translate(translated_x, translated_y);

    zoom(image_context, 1/zoomed_amount, 0, 0);
    zoom(mesh_context, 1 / zoomed_amount, 0, 0);
    zoom(color_context, 1 / zoomed_amount, 0, 0);

    drawImage();
    drawEntireMesh();
    fillAllTriangles();

    zoomed_amount = 1.0;
}