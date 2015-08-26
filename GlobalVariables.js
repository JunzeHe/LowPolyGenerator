var mesh_not_created = true; //Booleans to ensure that multiple canvases are not created when mutliple images are uploaded
var color_not_created = true;

var mesh_mode = false; //Boolean that determines if the user is in the mode to create a mesh
var color_mode = false; //Boolean that determiens if the user is selecting colors to fill the mesh w ith 
var delete_mode = false;

var mesh_triangles = new MeshPoints();

var image = null;

var image_canvas = document.getElementById('mainImage');
var mesh_canvas = document.getElementById('meshLayer');
var color_canvas = document.getElementById('colorLayer');

var image_context = image_canvas.getContext('2d');
var mesh_context = mesh_canvas.getContext('2d');
var color_context = color_canvas.getContext('2d');

var fidelity = image_canvas.width / 20; //Determines how much help is given for picking a point min value is 0
var vertex_radius = fidelity / 2;
var line_width = vertex_radius * 0.35;

var vertex_color = "rgba(0, 255, 21, 1.0)";
var edge_color = '#C9C9C9';

var text_enter = false; //Boolean to turn off keyboard shortcuts when entering text

var zoomed_amount = 1.0;    //Keeps track of how much the image has been zoomed to help reset it later on