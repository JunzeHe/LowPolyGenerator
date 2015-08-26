/**
 * Main function to be run in order to load an image from the file system into an HTML5 canvas and displays it appropriately.
 * Created to avoid having to create any global variables in keeping with the Javascript conventions
 */
function loadImage() {
    var input, file, fr, img;

    mesh_not_created = true;
    color_not_created = true;

    readImageFromSystem();

    /**
     * Checks if the sytem supports using a file reader.
     * If it does, then the image selected wil be read.
     * Upon completion, it will  move on to the next step.
     */
    function readImageFromSystem() {
        if (typeof window.FileReader !== 'function') {
            write("The file API isn't supported on this browser yet.");
            return;
        }

        input = document.getElementById('imgfile');

        if (!input) {
            write("Um, couldn't find the imgfile element.");
        } else if (!input.files) {
            write("This browser doesn't seem to support the `files` property of file inputs.");
        } else if (!input.files[0]) {
            write("Please select a file before clicking 'Load'");
        } else {
            file = input.files[0];
            fr = new FileReader();
            fr.onload = createImage;
            fr.readAsDataURL(file);
        }
    }

    /**
     * Creates an image object from the image read in with the file reader.
     */
    function createImage() {
        img = new Image();
        img.onload = initCanvases;
        img.src = fr.result;
    }

    /**
     * Initalizes all of the layers and intialization variables needed to run the program.
     */
    function initCanvases() {
        image = img; //Sets the global image variable to the locally created img 

        image_canvas = document.getElementById('mainImage');
        mesh_canvas = document.getElementById('meshLayer');
        color_canvas = document.getElementById('colorLayer');

        image_context = image_canvas.getContext('2d');
        mesh_context = mesh_canvas.getContext('2d');
        color_context = color_canvas.getContext('2d');

        //Changing the context functions
        trackTransforms(image_context);
        trackTransforms(mesh_context);
        trackTransforms(color_context);

        setCanvasSize(image_canvas);

        drawImage();
        createMeshLayer();
        createColorLayer();
        createDummyLayer();
        delete_mode = false; //Because there is no delete_mode initalizer

        fidelity = image_canvas.width / 85; //Determines how much help is given for picking a point min value is 0
        vertex_radius = fidelity / 2;
        line_width = vertex_radius * 0.35;
        document.getElementById('vertexRadius').max = fidelity * 1.5;
        
        image_canvas.className = 'decoratedCanvas';
    }

    /**
     * Helper function to determine the approrpriate width of a canvas that should be made and then center it.
     * If the image is larger than the width of the window, it should be shrunk. Otherwise, the image should retain its original width.
     * @param canvasObject canvas primary canvas object
     */
    function setCanvasSize(canvas) {
        var potential_width = window.innerWidth * 0.95;
        canvas.width = (img.width > potential_width) ? potential_width : img.width;
        canvas.height = img.height * (canvas.width / img.width);

        //Aligning the canvases with the middle
        var divContainer = document.getElementById('canvases');
        divContainer.style.marginLeft = parseInt((window.innerWidth - canvas.width) / 2 - 6) + "px";
    }

    /**
     * Writes any error messages that pop up.
     * @param string msg message to be displayed
     */
    function write(msg) {
        var p = document.createElement('p');
        p.innerHTML = msg;
        document.body.appendChild(p);
    }

    /**
     * Creates a dummy layer that is ignorant to all the transformations done to the visible canvases.
     * Used to retrieve a more reliable pixel data and to allow for a more accurate test of points within a path
     */
    function createDummyLayer() {
        var dummy_layer = document.getElementById('dummyLayer');
        dummy_layer.width = image_canvas.width;
        dummy_layer.height = image_canvas.height;

        var dummy_context = dummy_layer.getContext('2d');
        dummy_context.drawImage(image, 0, 0, dummy_layer.width, dummy_layer.height);
    }
}