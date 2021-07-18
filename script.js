// Sets the font for selected i-text object... Currentyl not working for groups
function set_fontFamily() {
    var font_name = document.getElementById('font_selector').value;
    var activeObj = canvas.getActiveObject();
    if (activeObj) {
        if (activeObj.type == "i-text") {
            activeObj.fontFamily = font_name;
            canvas.renderAll();
        }
    }
}

function set_fontFamily() {
    var font_name = document.getElementById('font_selector').value;
    var activeObj = canvas.getActiveObject();
    if (activeObj) {
        if (activeObj.type == "i-text") {
            activeObj.fontFamily = font_name;
            canvas.renderAll();
        }
    }
}

// Gets the gradient data as a string and parse into json format
function parse_gradient(gradient) {
    gradient = gradient.substring(30, gradient.length - 1).split("%");
    var clear_char = [",", " "];
    var colorStops = [];
    for (var i = 0; i < gradient.length; i++) {
        if (gradient[i] != "") {
            for (var j = 0; j < 2; j++) {
                if (clear_char.includes(gradient[i][0])) {
                    gradient[i] = gradient[i].substring(1);
                }
            }
            colorStops.push(gradient[i]);
        }

    }
    var json_colorStops = "[";
    for (var i = 0; i < colorStops.length; i++) {
        var json_color_stop = "{";
        var color_split = colorStops[i].split(" ");
        var location = color_split[color_split.length - 1];
        color_split.pop();
        var color = "";
        for (var j = 0; j < color_split.length; j++) {
            color += color_split[j];
        }
        location = Number(location) / 100;
        location = Math.round((location + Number.EPSILON) * 100) / 100
        json_color_stop += "\"color\": \"" + color + "\", \"offset\": " + location + "},"
        json_colorStops += json_color_stop;
    }
    json_colorStops = json_colorStops.substring(0, json_colorStops.length - 1);
    json_colorStops += "]";
    json_colorStops = JSON.parse(json_colorStops);
    return json_colorStops;
}

// Sets given object's gradient (Gradient takes JSON format)
function set_gradient(json_gradient) {
    var obj = canvas.getActiveObject();
    if (obj) {
        if (obj.type == 'i-text') {
            obj.set('fill', new fabric.Gradient({
                type: 'linear',
                coords: {
                    x1: 0,
                    y1: 0,
                    x2: obj.width,
                    y2: obj.height,
                },
                colorStops: json_gradient
            }));
            canvas.renderAll();
        }
    }
}

// Downloads the canvas in JPG.. Settings can be adjusted..
function saveImg() {
    var dataURL = canvas.toDataURL({
        format: 'jpeg',
        multiplier: 1.0,
        quality: 1.0
    });
    console.log(dataURL);
    download(dataURL, "thumbnail.jpg", "image/jpg")
}

// A funtion for addding user images
function add_image() {
    var image_url = document.getElementById('image_url').value;
    fabric.Image.fromURL(image_url, function (oImg) {
        canvas.add(oImg);
        canvas.sendToBack(oImg);
    }, { crossOrigin: 'Anonymous' });
}

function set_gradient_slider(json_gradient) {
    console.log("set gradient ----------")
    var gp = new Grapick({ el: '#gp' });

    // Handlers are color stops
    // in format : gp.addHandler(25, 'rgb(255, 0, 0)'); If the given offset is 0.25 then the handler format offset will be 25 (0.25*100)
    for (var i = 0; i < json_gradient.length; i++) {
        gp.addHandler(json_gradient[i].offset * 100, json_gradient[i].color);
    }

    // Updates the corresponding object according to the changes made to the slider... An event on the slider
    gp.on('change', complete => {
        var gradient = gp.getSafeValue();
        var json_gradient = parse_gradient(gradient);
        set_gradient(json_gradient);
    });
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb_string) {
    var rgb_vals = rgb_string.substring(4, rgb_string.length-1)
                           .replace(/ /g, '')
                           .split(',');
    return "#" + componentToHex(Number(rgb_vals[0])) + componentToHex(Number(rgb_vals[2])) + componentToHex(Number(rgb_vals[2]));
}


// Setup canvas
var canvas = new fabric.Canvas('canvas');
canvas.setDimensions({ width: '500px', height: '281px' }, { cssOnly: true });

var comicSansText = new fabric.IText("I'm in Comic Sans", {
    fontFamily: 'Helvetica',
    fontWeight: 'bold'
});
canvas.add(comicSansText);

var comicSansText2 = new fabric.IText("I'm in Comic Sans", {
    fontFamily: 'Helvetica',
    fontWeight: 'bold'
});
canvas.add(comicSansText2);

// set_gradient(comicSansText);

set_gradient_slider([{ offset: 0, color: 'rgb(255, 0, 0)' }, { offset: 1, color: 'rgb(0, 0, 255)' }]);

fabric.Image.fromURL('template.png', function (oImg) {
    oImg.set('selectable', false);
    canvas.add(oImg);
    canvas.sendToBack(oImg);
});

// Event : Occurs when previously no any objects were selected and then an object is selected.
canvas.on('selection:created', function () {
    var activeObj = canvas.getActiveObject();
    // Checks the type of the object
    if (activeObj.type == "i-text") {
        // If text, Then set Gradient, Font properties etc.
        if (typeof (activeObj.get('fill')) == "object") {
            var colorStops = activeObj.get('fill').colorStops;
            set_gradient_slider(colorStops);
        };
    }
});
// Event : Occurs when previously any object were selected and then a another object is selected.
canvas.on('selection:updated', function () {
    var activeObj = canvas.getActiveObject();
    // Checks the type of the object
    if (activeObj.type == "i-text") {
        // If text, Then set Gradient, Font properties etc.
        if (typeof (activeObj.get('fill')) == "object") {
            var colorStops = activeObj.get('fill').colorStops;
            set_gradient_slider(colorStops);
        };
    }
});