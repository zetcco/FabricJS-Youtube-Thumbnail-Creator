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
        json_color_stop += "\"color\": \"" + rgbToHex(color) + "\", \"offset\": " + location + "},"
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
    download(dataURL, "thumbnail.jpg", "image/jpg")
}
// A funtion for addding user images
function add_image(image_url) {
    fabric.Image.fromURL(image_url, function (oImg) {
        canvas.add(oImg);
        // canvas.sendToBack(oImg);
    }, { crossOrigin: 'Anonymous' });
}
// Updates/Creates the gradient slider
function set_gradient_slider(json_gradient) {
    var gp = new Grapick({
        el: '#gp',
        min: 1,
        max: 99,
        width: 25
    });

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
// Deciaml-10 to Hex (used by rgbToHex(rgb_string) function)
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
// Converts RGB string format of rgb(x, x, x) to hex (format: #xxxxxx)
function rgbToHex(rgb_string) {
    // This checks if the given rgb string is a alpha rgb or not.. if alpha rgb then return it without any changes since opacity cannot be made with Hex only
    if (rgb_string[4] == "(") {
        return rgb_string;
    }
    else {
        var rgb_vals = rgb_string.substring(4, rgb_string.length - 1)
            .replace(/ /g, '')
            .split(',');
        return "#" + componentToHex(Number(rgb_vals[0])) + componentToHex(Number(rgb_vals[1])) + componentToHex(Number(rgb_vals[2]));
    }
}
// Adds a text to the canvas
function addText(text = "Tap and Edit", pos_top = 0, pos_left = 0) {
    canvas.add(new fabric.IText(text, {
        left: pos_left,
        id: canvas.getObjects().length + 1,
        top: pos_top,
        fontSize: 150,
        fontFamily: 'Helvetica',
        fontWeight: 'normal'
    }));
}
// Adds a layer to the layer panel
function add_to_layer(obj) {
    var layerList = document.getElementById('left');
    var layerName;
    if (obj.type == "image") layerName = obj.type + ":" + obj.src;
    else if (obj.type == "i-text") layerName = obj.type + ":" + obj.text;
    var layerDiv = document.createElement("div");
    layerDiv.innerHTML = "<a>" + layerName + "</a><div class=\"btnClass\"><button class=\"smallBtn select\">Select</button><button class=\"smallBtn delete\">Delete</button></div>";
    layerDiv.setAttribute('class', 'layer');
    layerList.prepend(layerDiv);
    // layerList.innerHTML = "<div class=\"layer\">" + layerName + "</div>" + layerList.innerHTML;
}
//Clear highlighted layers on layer panel
function clear_layers(){
    var layerElements = document.getElementById('left').childNodes;
    for (var i = 0 ; i < layerElements.length ; i++){
        layerElements[i].className = "layer";
    } 
}
// Selects/Highlights coresponding layer of the selected object
function select_layer(obj) {
    var selectedIndex = canvas.getObjects().reverse().indexOf(obj);
    var layerElements = document.getElementById('left').childNodes;
    var filteredLayerElements = [];
    for (var i = 0 ; i < layerElements.length ; i++){
        if (layerElements[i].nodeType == Node.ELEMENT_NODE){
            filteredLayerElements.push(layerElements[i]);
        }
    }
    for (var i = 0 ; i < filteredLayerElements.length ; i++){
        filteredLayerElements[i].className = "layer";
    }
    filteredLayerElements[selectedIndex].classList.add("selected");
}
// Sets the selected object's fill (single color or gradient) to the User input elements
function set_userinput_fill(obj) {
    if (typeof (obj) == "object") {
        set_gradient_slider(obj.colorStops);
        document.getElementById('stroke_color').value = "#000000";
    }
    else {
        set_gradient_slider([{ offset: 0.01, color: obj, select: 0 }]);
        document.getElementById('stroke_color').value = obj;
    }
}
// Sets the selected object's font weight (single color or gradient) to the User input elements
function set_userinput_fontWeight(obj) {
    if (obj == "bold") document.getElementById('is_bold').checked = true;
    else if (obj == "normal") document.getElementById('is_bold').checked = false;
}

// Sets selected object's stroke color to the stroke color selector
function set_userinput_stroke(obj) {
    var obj_stroke_color = obj.stroke;
    var stroke_size = obj.strokeWidth;
    if (obj_stroke_color == null) obj_stroke_color = "#000000";
    document.getElementById('stroke_color').value = obj_stroke_color;
    document.getElementById('stroke_width').value = Number(stroke_size) * 10;
}

function set_userinput_shadow(obj) {
    if (obj.shadow) {
        document.getElementById("shadow_dis").value = obj.shadow.offsetX;
        document.getElementById("shadow_color").value = obj.shadow.color;
        document.getElementById("shadow_blur").value = obj.shadow.blur;
    }
}

// Sets the selected object's properties (fill, shadow, font properties) to the User input elements
function set_properties(obj) {
    select_layer(obj);
    if (obj.type == "i-text") {
        set_userinput_fill(obj.get('fill'));
        set_userinput_fontWeight(obj.get('fontWeight'));
        set_userinput_stroke(obj);
        set_userinput_shadow(obj);
        $("#font").removeClass("disabledPanel");
        $("#fill").removeClass("disabledPanel");
    }
    else if (obj.type == "image"){
        $("#font").addClass("disabledPanel");
        $("#fill").addClass("disabledPanel");
    }
}

// Setup canvas
var canvas = new fabric.Canvas('canvas');
$.getJSON("https://raw.githubusercontent.com/zetcco/FabricJS-Thumbnail-Creator/master/template_color.json", function (json) {
    canvas.loadFromJSON(json, function () {
        canvas.renderAll();
    });
});
canvas.setDimensions({ width: '500px', height: '281px' }, { cssOnly: true });

var layerSelectedIndex; // This var is used to store the selected layer index from the layer panel
dragula([left])
    .on('drop', function (el) {
        canvas.discardActiveObject().renderAll();
        canvas.getObjects().reverse()[layerSelectedIndex].moveTo(canvas.getObjects().length - 1 - [].slice.call(el.parentElement.children).indexOf(el));
    }).on('over', function (el, container) {
        layerSelectedIndex = [].slice.call(el.parentElement.children).indexOf(el);
    });

const file = document.getElementById('file');
file.addEventListener('change', ev => {
    const formdata = new FormData();
    canvas.discardActiveObject().renderAll();
    formdata.append("image", ev.target.files[0])
    fetch("https://api.imgur.com/3/image/", {
        method: "post",
        headers: {
            Authorization: "Client-ID 6f5579f21975596"
        }
        , body: formdata
    }).then(data => data.json()).then(data => add_image(data.data.link))
})

set_gradient_slider([{ offset: 0.01, color: '#ff0000', select: 0 }, { offset: 0.99, color: '#0000ff', select: 0 }]);

// fabric.Image.fromURL('01.png', function (oImg) {
//     oImg.set('selectable', false);
//     oImg.id = canvas.getObjects().length + 1;
//     canvas.add(oImg);
//     canvas.sendToBack(oImg);
// });

// addText("Add text", 50, 50);
// addText("Add text", 200, 50);
// addText("Add text", 350, 50);
// addText("Add text", 500, 50);

document.getElementById('add_text').onclick = function () {
    addText();
};

document.getElementById('font_selector').onchange = function () {
    if (canvas.getActiveObject()) {
        var activeObj = canvas.getActiveObject();
        if (activeObj) {
            if (activeObj.type == "i-text") {
                activeObj.fontFamily = this.value;
                canvas.renderAll();
            }
        }
    }
};

document.getElementById('stroke_color').onchange = function () {
    if (canvas.getActiveObject()) {
        canvas.getActiveObject().set('stroke', this.value);
        canvas.renderAll();
    }
};

document.getElementById('color_picker').onchange = function () {
    if (canvas.getActiveObject()) {
        var obj = canvas.getActiveObject();
        if (obj.type == "i-text") obj.set('fill', this.value);
        canvas.renderAll();
    }
};

document.getElementById('stroke_width').onchange = function () {
    if (canvas.getActiveObject()) {
        canvas.getActiveObject().set('strokeWidth', this.value / 10);
        canvas.renderAll();
    }
};

document.getElementById('is_bold').onchange = function () {
    if (canvas.getActiveObject()) {
        var is_bold = this.checked;
        var activeObj = canvas.getActiveObject();
        if (activeObj) {
            if (activeObj.type == "i-text") {
                if (is_bold) activeObj.fontWeight = "bold";
                else activeObj.fontWeight = "normal";
                canvas.renderAll();
            }
        }
    }
};

document.getElementById('shadow_dis').onchange = function () {
    if (canvas.getActiveObject()) {
        var color = document.getElementById('shadow_color').value;
        var shadow_blur = document.getElementById('shadow_blur').value;
        var dis = this.value;
        canvas.getActiveObject().set('shadow', {
            color: color,
            blur: shadow_blur,
            offsetX: dis,
            offsetY: dis
        });
        canvas.renderAll();
    }
};

document.getElementById('shadow_color').onchange = function () {
    if (canvas.getActiveObject()) {
        var color = this.value;
        var shadow_blur = document.getElementById('shadow_blur').value;
        var dis = document.getElementById('shadow_dis').value;
        canvas.getActiveObject().set('shadow', {
            color: color,
            blur: shadow_blur,
            offsetX: dis,
            offsetY: dis
        });
        canvas.renderAll();
    }
};

$(document).on('click','.smallBtn.select',function(){
     canvas.setActiveObject(canvas.item(canvas.getObjects().length - 1 -$('.smallBtn.select').index(this)));
     canvas.renderAll();
});


// Event when a new object is added to canvas
canvas.on('object:added', function (e) {
    var activeObject = e.target;
    add_to_layer(activeObject);
});
// Event : Occurs when previously no any objects were selected and then an object is selected.
canvas.on('selection:created', function () {
    var activeObj = canvas.getActiveObject();
    set_properties(activeObj);
});
// Event : Occurs when previously any object were selected and then a another object is selected.
canvas.on('selection:updated', function () {
    var activeObj = canvas.getActiveObject();
    set_properties(activeObj);
});
// Event : Occurs when selections are cleared
canvas.on('selection:cleared', function () {
    clear_layers();
    // Checks the type of the object
});