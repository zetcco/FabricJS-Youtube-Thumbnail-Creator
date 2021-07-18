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
        // json_color_stop += "\"color\": \"" + rgbToHex(color) + "\", \"offset\": " + location + "},";
        json_color_stop += "\"color\": \"" + color + "\", \"offset\": " + location + "},";
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
    const gp = new Grapick({
        el: '#gp',
        min: 1,
        max: 99,
        colorEl: '<div class="colorpicker grp-handler-cp-wrap cp"></div>', // Custom color picker from colorpicker.min.js -- class is from original grapick.min.css
        width: 25
    });
    gp.setColorPicker(handler => {
        const el = handler.getEl().querySelector('.colorpicker.grp-handler-cp-wrap.cp');
        var picker = CP(el);
        // Add colorpicker change event to dynamically add color to the gradient
        picker.on('change', function (r, g, b, a) {
            if (1 === a) {
                var color = 'rgb(' + r + ', ' + g + ', ' + b + ')';
                /* Checks if given handler is selected or not
                If this if-statement is not written, When a new handler is added via programatically (using gp.addHandler()) colorpicker.js overwrites that color to black
                Or to the the color defined as data-color attribute on gp.colorEl */
                if (handler.isSelected()) {
                    var handlerColor = handler.getColor().substring(5, handler.getColor().length - 1).replace(/\s/g, '').split(",");
                    handlerColor = CP.HEX([Number(handlerColor[0]), Number(handlerColor[1]), Number(handlerColor[2]), Number(handlerColor[3])]);
                    this.source.style.backgroundColor = handler.getColor();
                    this.source.setAttribute("data-color", handlerColor);
                    handler.setColor(color);
                }
            }
            else {
                var color = 'rgba(' + r + ', ' + g + ', ' + b + ',' + a + ')';
                if (handler.isSelected()) {
                    var handlerColor = handler.getColor().substring(4, handler.getColor().length - 1).replace(/\s/g, '').split(",");
                    handlerColor = CP.HEX([Number(handlerColor[0]), Number(handlerColor[1]), Number(handlerColor[2])]);
                    this.source.style.backgroundColor = handler.getColor();
                    this.source.setAttribute("data-color", handlerColor);
                    handler.setColor(color);
                }
            }
            /* Select the handler anyway after the color is added otherwise when handler is added via click the right color will not render to the 
            gradient slider.. To prevent that click event is added to the gradient slider... when a click is occured a new handler will be added and it will be 
            deselected automatically (preventing [black color/or data-color value] from overwriting the neccessary color)... 
            Since it is not possible to prevent that event from firing this(colorpicker change event) event... that handler (the one that a change has occured) will be automatically selected
            */
            handler.select();
            // handler.deselect();
        });
    });
    gp.on('handler:select', function () {
        var handler = gp.getSelected();

        var selectedPicker = document.getElementsByClassName('grp-handler grp-handler-selected')[0].getElementsByClassName('colorpicker grp-handler-cp-wrap cp')[0];
        if (handler.getColor()[3] == '(') {
            var selectedColorHEX = handler.getColor().substring(4, handler.getColor().length - 1).replace(/\s/g, '').split(",");
            selectedColorHEX = CP.HEX([Number(selectedColorHEX[0]), Number(selectedColorHEX[1]), Number(selectedColorHEX[2])]);
        }
        else if (handler.getColor()[3] == 'a') {
            var selectedColorHEX = handler.getColor().substring(5, handler.getColor().length - 1).replace(/\s/g, '').split(",");
            selectedColorHEX = CP.HEX([Number(selectedColorHEX[0]), Number(selectedColorHEX[1]), Number(selectedColorHEX[2]), Number(selectedColorHEX[3])]);
        }
        // Set selected handler's value to the handler selection circle (div tag) and to the colocpicker's value (data-color)
        selectedPicker.style.backgroundColor = handler.color;
        selectedPicker.setAttribute("data-color", selectedColorHEX);
    })
    document.getElementsByClassName('grp-preview')[0].onclick = function () {
        // This event is to fire whenever a new handler is added to the slider via click event.. handler:add will not work because it'll fire when a new handler is added via programatically. 
        // Get the index of the newly added handler
        var handler_index = gp.getHandlers().indexOf(gp.getSelected())
        // Deselect that handler
        gp.getHandler(handler_index).deselect();
        // Then this event will fire picker.on('change') event above.
    }
    // Handlers are color stops
    // in format : gp.addHandler(25, 'rgb(255, 0, 0)'); If the given offset is 0.25 then the handler format offset will be 25 (0.25*100)
    for (var i = 0; i < json_gradient.length; i++) {
        if (json_gradient[i].color[0] == "#") {
            json_gradient[i].color = hexToRgb(json_gradient[i].color);
        }
        gp.addHandler(json_gradient[i].offset * 100, json_gradient[i].color, 0);
    }

    // Updates the corresponding object according to the changes made to the slider... An event on the slider
    gp.on('change', complete => {
        var gradient = gp.getSafeValue();
        console.log(gradient);
        var json_gradient = parse_gradient(gradient);
        set_gradient(json_gradient);
    });
}
// Deciaml-10 to Hex (used by rgbToHex(rgb_string) function)
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var rgb = "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")";
    return rgb;
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
// Delete given object
function delete_obj(obj) {
    if (obj) {
        if (confirm('Are you sure?')) {
            // This deselects any selected layer
            get_layers();
            var selectedIndex = canvas.getObjects().reverse().indexOf(obj);
            canvas.remove(obj);
            var layers = get_layers();
            document.getElementById('left').removeChild(layers[selectedIndex]);
        }
    }
}
// Deselect any selected layers and returns all the layers
function get_layers() {
    var layerElements = document.getElementById('left').childNodes;
    var filteredLayerElements = [];
    for (var i = 0; i < layerElements.length; i++) {
        if (layerElements[i].nodeType == Node.ELEMENT_NODE) {
            filteredLayerElements.push(layerElements[i]);
        }
    }
    for (var i = 0; i < filteredLayerElements.length; i++) {
        filteredLayerElements[i].className = "layer flex space-between";
    }
    return filteredLayerElements;
}
// Adds a layer to the layer panel
function add_to_layer(obj) {
    var layerList = document.getElementById('left');
    var layerType, checked = "";
    if (!obj.selectable) checked = "checked";
    if (obj.type == "image") layerType = '<i class="fa fa-picture-o layerType" aria-hidden="true"></i>' + obj.src;
    else if (obj.type == "i-text") layerType = '<i class="fa fa-font layerType" aria-hidden="true"></i>' + obj.text;
    var layerDiv = document.createElement("div");
    layerDiv.innerHTML = '<div class="layerInfo">' + "<a>" + layerType + '</a></div><div class="layerOptions"><label class="smallBtn layerLockBtn ' + checked + '"><i class="fas fa-lock" aria-hidden="true"></i><input type="checkbox" class="layer-lock-toggle" ' + checked + '></label><a class="smallBtn delete"><strong>Delete</strong></a></div>';
    // layerDiv.innerHTML = '<div class="layerInfo">' + "<a>" + layerType + '</a></div><div class="layerOptions"><i class="fas fa-lock" aria-hidden="true"></i><a class="smallBtn delete"><strong>Delete</strong></a></div>';
    layerDiv.setAttribute('class', 'layer flex space-between');
    layerList.prepend(layerDiv);
    // layerList.innerHTML = "<div class=\"layer\">" + layerName + "</div>" + layerList.innerHTML;
}
//Clear highlighted layers on layer panel
function clear_layers() {
    var layerElements = document.getElementById('left').childNodes;
    for (var i = 0; i < layerElements.length; i++) {
        layerElements[i].className = "layer flex space-between";
    }
}
// Selects/Highlights coresponding layer of the selected object
function select_layer(obj) {
    var selectedIndex = canvas.getObjects().reverse().indexOf(obj);
    var layers = get_layers();
    layers[selectedIndex].classList.add("selected");
}
// Sets the selected object's fill (single color or gradient) to the User input elements
function set_userinput_fill(obj) {
    if (typeof (obj) == "object") {
        set_gradient_slider(obj.colorStops);
        // If the given object has  gradient then set gradient toggle checkbox to true
        $("#gradientFill").prop('checked', true).change();
        document.getElementById('fillPick').style.backgroundColor = "rgb(255,255,255,0)";
    }
    else {
        // If the given object has no fill then set fill toggle checkbox to false
        $("#fillToggle").prop('checked', true).change();;
        // set_gradient_slider([{ offset: 0.01, color: obj, select: 0 }]);
        document.getElementById('fillPick').style.backgroundColor = obj;
        document.getElementById('fillPick').setAttribute("data-color", obj);
    }
}
// Sets selected object's stroke color to the stroke color selector
function set_userinput_stroke(obj) {
    var obj_stroke_color = obj.stroke;
    if (obj_stroke_color) {
        var stroke_size = obj.strokeWidth;
        // If the given object has  stroke then set stroke toggle checkbox to true
        $("#strokeToggle").prop('checked', true).change();
        // document.getElementById('stroke_color').value = obj_stroke_color;
        document.getElementById('strokePick').style.borderColor = obj_stroke_color;
        document.getElementById('strokePick').setAttribute("data-color", obj_stroke_color);
        document.getElementById('stroke_width').value = Number(stroke_size) * 10;
    }
    else {
        // If the given object has no stroke then set stroke toggle checkbox to false
        $("#strokeToggle").prop('checked', false).change();
    }
}
// Sets selected object's shadow properties to shadow inputs
function set_userinput_shadow(obj) {
    if (obj.shadow) {
        document.getElementById("shadow_dis").value = obj.shadow.offsetX;
        $("#shadowToggle").prop('checked', true).change();
        document.getElementById('shadowPick').style.boxShadow = "3px 5px 7px " + obj.shadow.color;
        document.getElementById('shadowPick').setAttribute("data-color", obj.shadow.color);
        document.getElementById("shadow_blur").value = obj.shadow.blur;
    }
    else {
        // If the given object has no shadow then set shadow toggle checkbox to false
        $("#shadowToggle").prop('checked', false).change();
    }
}
// Sets selected object's glow properties to glow inputs
function set_userinput_glow(obj) {
    if (obj.shadow) {
        $("#glowToggle").prop('checked', true).change();
        document.getElementById('glowPick').style.boxShadow = "0px 0px 10px " + obj.shadow.color;
        document.getElementById('glowPick').setAttribute("data-color", obj.shadow.color);
        document.getElementById("glow_feather").value = obj.shadow.blur;
    }
    else {
        // If the given object has no shadow then set shadow toggle checkbox to false
        $("#glowToggle").prop('checked', false).change();
    }
}
// Sets the selected object's font properties
function set_userinput_font(obj) {
    document.getElementById('font_selector').value = obj.fontFamily;
    if (obj.fontWeight == "bold") document.getElementById('is_bold').checked = true;
    else if (obj.fontWeight == "normal") document.getElementById('is_bold').checked = false;
}
// Sets the selected object's properties (fill, shadow, font properties) to the User input elements
function set_properties(obj) {
    select_layer(obj);
    if (obj.type == "i-text") {
        fill_panel_toggle('enable');
        stroke_panel_toggle('enable');
        shadow_panel_toggle('enable');
        glow_panel_toggle('enable');
        set_userinput_fill(obj.get('fill'));
        set_userinput_stroke(obj);
        set_userinput_shadow(obj);
        set_userinput_glow(obj);
        set_userinput_font(obj);
        // $("#font").removeClass("disabledPanel");
        // $("#fill").removeClass("disabledPanel");
    }
    else if (obj.type == "image") {
        fill_panel_toggle('disable');
        stroke_panel_toggle('enable');
        shadow_panel_toggle('enable');
        glow_panel_toggle('enable');
        set_userinput_stroke(obj);
        set_userinput_shadow(obj);
        set_userinput_glow(obj);
        // $("#font").addClass("disabledPanel");
        // $("#fill").addClass("disabledPanel");
    }
}
// Download json
function download_json(data, filename) {
    if (!data) {
        console.error('Console.save: No data')
        return;
    }

    if (!filename) filename = 'console.json'

    if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], { type: 'text/json' }),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}
// Load font and use
function loadAndUse(font) {
    var myfont = new FontFaceObserver(font)
    myfont.load()
        .then(function () {
            // when font is loaded, use it.
            canvas.getActiveObject().set("fontFamily", font);
            canvas.requestRenderAll();
        }).catch(function (e) {
            console.log(e)
            alert('font loading failed ' + font);
        });
}
// Set bounding box settings
function set_bounding_box(obj) {
    obj.set({
        transparentCorners: false,
        cornerColor: 'blue',
        cornerStrokeColor: 'rgb(230,230,230)',
        borderColor: 'rgb(230,230,230)',
        cornerSize: 20,
        padding: 10
    });
}

var fonts = ["Cutive", "Secular One", "Coda Caption", "Holtwood One SC", "Merriweather", "Gelasio", "Do Hyeon", "Alata", "Titan One", "Sofia", "Bowlby One", "Modak", "Erica One", "Anton", "Bebas Neue", "Kanit", "Alfa Slab One", "Rubik Mono One", "Bungee", "Bowlby One SC"];
var select = document.getElementById("font_selector");
fonts.forEach(function (font) {
    var option = document.createElement('option');
    option.innerHTML = font;
    option.value = font;
    select.appendChild(option);
});
fonts.unshift('Times New Roman');

// Setup canvas
var canvas = new fabric.Canvas('canvas');
$.getJSON("https://raw.githubusercontent.com/zetcco/FabricJS-Thumbnail-Creator/master/new_template.json", function (json) {
    canvas.loadFromJSON(json, function () {
        canvas.renderAll();

    });
});
// Disable Fill panel on canvas startup
fill_panel_toggle('disable');
stroke_panel_toggle('disable');
shadow_panel_toggle('disable');
glow_panel_toggle('disable');
// canvas.setDimensions({ width: width, height: height}, { cssOnly: true });
var width = (document.getElementsByClassName('group')[0].offsetWidth);
var height = (9 / 16) * width;
canvas.setDimensions({ width: width + 'px', height: height + 'px' }, { cssOnly: true });

var layerSelectedIndex; // This var is used to store the selected layer index from the layer panel
dragula([left], { revertOnSpill: true })
    .on('drag', function (el) {
        // console.log('testdrag');
        // el.className = el.className.replace('ex-moved', '');
    }).on('drop', function (el) {
        // console.log('drop' + [].slice.call(el.parentElement.children).indexOf(el));
        canvas.discardActiveObject().renderAll();
        canvas.getObjects().reverse()[layerSelectedIndex].moveTo(canvas.getObjects().length - 1 - [].slice.call(el.parentElement.children).indexOf(el));
    }).on('over', function (el, container) {
        // console.log('over' + [].slice.call(el.parentElement.children).indexOf(el));
        layerSelectedIndex = [].slice.call(el.parentElement.children).indexOf(el);
    }).on('out', function (el, container) {
        // console.log('testout');
        console.log(el, container);
        // container.className = container.className.replace('ex-over', '');
    });

// var uploadProgress = new Progress<int>(report);
const file = document.getElementById('image-upload');
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

new CP(document.querySelector('#fillPick')).on('change', function (r, g, b, a) {
    this.source.style.backgroundColor = this.color(r, g, b, a);
    this.source.setAttribute("data-color", this.color(r, g, b, a));
    var obj = canvas.getActiveObject();
    if (obj) {
        if (obj.type == "i-text") obj.set('fill', this.color(r, g, b, a));
        canvas.renderAll();
    }
});

new CP(document.querySelector('#strokePick')).on('change', function (r, g, b, a) {
    this.source.style.borderColor = this.color(r, g, b, a);
    this.source.setAttribute("data-color", this.color(r, g, b, a));
    var obj = canvas.getActiveObject();
    if (obj) {
        canvas.getActiveObject().set('stroke', this.color(r, g, b, a));
        canvas.renderAll();
    }
});

new CP(document.querySelector('#shadowPick')).on('change', function (r, g, b, a) {
    this.source.style.boxShadow = "3px 5px 7px " + this.color(r, g, b, a);
    this.source.setAttribute("data-color", this.color(r, g, b, a));
    var obj = canvas.getActiveObject();
    if (obj) {
        var color = this.color(r, g, b, a);
        var shadow_blur = document.getElementById('shadow_blur').value;
        var dis = document.getElementById('shadow_dis').value;
        obj.set('shadow', {
            affectStroke: true,
            color: color,
            blur: shadow_blur,
            offsetX: dis,
            offsetY: dis
        });
        canvas.renderAll();
    }
});

new CP(document.querySelector('#glowPick')).on('change', function (r, g, b, a) {
    this.source.style.boxShadow = "0px 0px 10px " + this.color(r, g, b, a);
    this.source.setAttribute("data-color", this.color(r, g, b, a));
    var obj = canvas.getActiveObject();
    if (obj) {
        var color = this.color(r, g, b, a);
        var glow_blur = document.getElementById('glow_feather').value;
        obj.set('shadow', {
            affectStroke: true,
            color: color,
            blur: glow_blur,
            offsetX: 0,
            offsetY: 0
        });
        canvas.renderAll();
    }
});

document.getElementById('add_text').onclick = function () {
    addText();
};

document.getElementById('font_selector').onchange = function () {
    if (canvas.getActiveObject()) {
        var activeObj = canvas.getActiveObject();
        if (activeObj) {
            if (activeObj.type == "i-text") {
                if (this.value !== 'Times New Roman') {
                    loadAndUse(this.value);
                } else {
                    canvas.getActiveObject().set("fontFamily", this.value);
                    canvas.requestRenderAll();
                }
            }
        }
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
        // var color = document.getElementById('shadow_color').value;
        var color = document.getElementById('shadowPick').style.boxShadow.split(" ");
        color = color.slice(0, color.length - 3);
        color = color[0] + color[1] + color[2];
        var shadow_blur = document.getElementById('shadow_blur').value;
        var dis = this.value;
        canvas.getActiveObject().set('shadow', {
            affectStroke: true,
            color: color,
            blur: shadow_blur,
            offsetX: dis,
            offsetY: dis
        });
        canvas.renderAll();
    }
};

// document.getElementById('shadow_color').onchange = function () {
//     if (canvas.getActiveObject()) {
//         var color = this.value;
//         var shadow_blur = document.getElementById('shadow_blur').value;
//         var dis = document.getElementById('shadow_dis').value;
//         canvas.getActiveObject().set('shadow', {
//             color: color,
//             blur: shadow_blur,
//             offsetX: dis,
//             offsetY: dis
//         });
//         canvas.renderAll();
//     }
// };

document.getElementById('shadow_blur').onchange = function () {
    if (canvas.getActiveObject()) {
        var color = document.getElementById('shadowPick').style.boxShadow.split(" ");
        color = color.slice(0, color.length - 3);
        color = color[0] + color[1] + color[2];
        var shadow_blur = this.value;
        var dis = document.getElementById('shadow_dis').value;
        canvas.getActiveObject().set('shadow', {
            affectStroke: true,
            color: color,
            blur: shadow_blur,
            offsetX: dis,
            offsetY: dis
        });
        canvas.renderAll();
    }
};

document.getElementById('glow_feather').onchange = function () {
    if (canvas.getActiveObject()) {
        var color = document.getElementById('glowPick').style.boxShadow.split(" ");
        color = color.slice(0, color.length - 3);
        color = color[0] + color[1] + color[2];
        var shadow_blur = this.value;
        canvas.getActiveObject().set('shadow', {
            affectStroke: true,
            color: color,
            blur: shadow_blur,
            offsetX: 0,
            offsetY: 0
        });
        canvas.renderAll();
    }
};

// Select item by layer
$(document).on('click', '.layer', function () {
    if (!this.childNodes[1].childNodes[0].classList.contains("checked")) {
        canvas.setActiveObject(canvas.item(canvas.getObjects().length - 1 - $('.layer').index(this)));
        canvas.renderAll();
    }
});

$(document).on('click', '.smallBtn.delete', function (e) {
    e.stopPropagation();
    var layerIndex = $('.smallBtn.delete').index(this);
    clear_layers();
    delete_obj(canvas.item(canvas.getObjects().length - 1 - layerIndex));
});

$(document).on('click', '#downloadImage', function () {
    saveImg();
});

$(document).on('click', '#downloadTemplate', function () {
    download_json(canvas.toJSON(['selectable']), 'template.json');
});

$(document).on('click', '#resetTemplate', function () {
    if (confirm('Are you sure you want to Reset template?')) {
        canvas.clear();
        document.getElementById('left').innerHTML = "";
        $.getJSON("https://raw.githubusercontent.com/zetcco/FabricJS-Thumbnail-Creator/master/new_template.json", function (json) {
            canvas.loadFromJSON(json, function () {
                // canvas.selectionBorderColor = 'red';
                // canvas.selectionLineWidth = 15;
                // this.__canvases.push(canvas);
                canvas.renderAll();
            })
        });
        fill_panel_toggle('disable');
        stroke_panel_toggle('disable');
        shadow_panel_toggle('disable');
        glow_panel_toggle('disable');
    }
})

$(document).on('click', '#deleteAll', function () {
    if (confirm('Are you sure?')) {
        canvas.clear();
        document.getElementById('left').innerHTML = "";
    }
})

$(document).on('click', '#bringForward', function () {
    var layers = Array.prototype.slice.call(document.getElementById('left').children);
    var selectedLayer = document.getElementsByClassName('layer flex space-between selected')[0];
    // Checks if the layers is on top of the layer panel
    if (layers.indexOf(selectedLayer) != 0) {
        canvas.getActiveObject().bringForward();
        moveLayerTo(selectedLayer, 'forward');
    }
})

$(document).on('click', '#sendBackwards', function () {
    var layers = Array.prototype.slice.call(document.getElementById('left').children);
    var selectedLayer = document.getElementsByClassName('layer flex space-between selected')[0];
    if (layers.indexOf(selectedLayer) != layers.length - 1) {
        canvas.getActiveObject().sendBackwards();
        moveLayerTo(document.getElementsByClassName('layer flex space-between selected')[0], 'backwards');
    }
})

$(document).on('click', '#bringToFront', function () {
    var layers = Array.prototype.slice.call(document.getElementById('left').children);
    var selectedLayer = document.getElementsByClassName('layer flex space-between selected')[0];
    if (layers.indexOf(selectedLayer) != 0) {
        canvas.getActiveObject().bringToFront();
        moveLayerTo(document.getElementsByClassName('layer flex space-between selected')[0], 'front');
    }
})

$(document).on('click', '#sendToBack', function () {
    var layers = Array.prototype.slice.call(document.getElementById('left').children);
    var selectedLayer = document.getElementsByClassName('layer flex space-between selected')[0];
    if (layers.indexOf(selectedLayer) != layers.length - 1) {
        canvas.getActiveObject().sendToBack();
        moveLayerTo(document.getElementsByClassName('layer flex space-between selected')[0], 'back');
    }
})

$(document).on('click', '.layer-lock-toggle', function (e) {
    e.stopPropagation();
    var layerIndex = $('.layer-lock-toggle').index(this);
    var layerObject = canvas.item(canvas.getObjects().length - 1 - layerIndex);
    if (this.checked) {
        this.parentNode.classList.add("checked");
        if (canvas.getActiveObject() == layerObject) {
            canvas.discardActiveObject();
            canvas.renderAll();
        }
        layerObject.set({ selectable: false });
    }
    else {
        this.parentNode.classList.remove("checked");
        layerObject.set({ selectable: true });
    }
    clear_layers();
})

$("body").on("keydown", function (e) {
    if (e.which == 8 || e.which == 46) {
        delete_obj(canvas.getActiveObject());
    }
});

// Event when a new object is added to canvas
canvas.on('object:added', function (e) {
    var activeObj = e.target;
    set_bounding_box(activeObj);
    add_to_layer(activeObj);
    // Style panel dropdown
    stylePanelToggle('down');
    // var selectedStyleTabId = '#dropdown_' + document.querySelector('input[type=radio]:checked + label').getAttribute('for');
    // $(selectedStyleTabId).slideDown();;
});
// Event : Occurs when previously no any objects were selected and then an object is selected.
canvas.on('selection:created', function () {
    var activeObj = canvas.getActiveObject();
    set_bounding_box(activeObj);
    set_properties(activeObj);
    // Style panel dropdown
    stylePanelToggle('down');
    // Layer Order Controls toggle
    layerControlsToggle(true);
    // var selectedStyleTabId = '#dropdown_' + document.querySelector('input[type=radio]:checked + label').getAttribute('for');
    // $(selectedStyleTabId).slideDown();
});
// Event : Occurs when previously any object were selected and then a another object is selected.
canvas.on('selection:updated', function () {
    var activeObj = canvas.getActiveObject();
    set_bounding_box(activeObj);
    set_properties(activeObj);
    // Style panel dropdown
});
// Event : Occurs when selections are cleared
canvas.on('selection:cleared', function () {
    clear_layers();
    // Style panel dropdown
    stylePanelToggle('up');
    // Layer Order Controls toggle
    layerControlsToggle(false);
    // var selectedStyleTabId = '#dropdown_' + document.querySelector('input[type=radio]:checked + label').getAttribute('for');
    fill_panel_toggle('disable');
    fill_panel_toggle('disable');
    stroke_panel_toggle('disable');
    shadow_panel_toggle('disable');
    glow_panel_toggle('disable');
    // $(selectedStyleTabId).slideUp();
});