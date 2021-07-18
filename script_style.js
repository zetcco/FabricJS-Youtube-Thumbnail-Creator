// Slide up/down style panel
function stylePanelToggle(direction) {
    var selectedStyleTabId = '#dropdown_' + document.querySelector('input[type=radio]:checked + label').getAttribute('for');
    if (direction == 'up') $(selectedStyleTabId).slideUp();
    if (direction == 'down') $(selectedStyleTabId).slideDown();
}
function moveLayerTo(layer, location) {
    var parentNode = layer.parentNode;
    if (location == 'forward') parentNode.insertBefore(layer, layer.previousElementSibling);
    else if (location == 'backwards') parentNode.insertBefore(layer, layer.nextElementSibling.nextElementSibling);
    else if (location == 'front') parentNode.insertBefore(layer, parentNode.childNodes[0]);
    else if (location == 'back') parentNode.insertBefore(layer, parentNode.childNodes[parentNode.childNodes.length - 1]);
}
// Slide up/down style panel
function layerControlsToggle(status) {
    var layerControls = document.getElementById('layer-order-controls');
    if (status == true) layerControls.className = 'toRight';
    if (status == false) layerControls.className = 'toRight disabled';
}

function fill_panel_toggle(status) {
    if (status == 'enable') {
        document.getElementById("dropdown_fill").classList.remove("disabled");
    }
    else if (status == 'disable') {
        document.getElementById("dropdown_fill").classList.add("disabled");
    }
}

function stroke_panel_toggle(status) {
    if (status == 'enable') {
        document.getElementById("dropdown_outline").classList.remove("disabled");
    }
    else if (status == 'disable') {
        document.getElementById("dropdown_outline").classList.add("disabled");
    }
}

function shadow_panel_toggle(status) {
    if (status == 'enable') {
        document.getElementById("dropdown_shadow").classList.remove("disabled");
    }
    else if (status == 'disable') {
        document.getElementById("dropdown_shadow").classList.add("disabled");
    }
}

function glow_panel_toggle(status) {
    if (status == 'enable') {
        document.getElementById("dropdown_glow").classList.remove("disabled");
    }
    else if (status == 'disable') {
        document.getElementById("dropdown_glow").classList.add("disabled");
    }
}

var hidden_panels = ["dropdown_fill", "dropdown_outline", "dropdown_shadow", "dropdown_glow"]

$(document).on('click', '.dropdownBtn', function () {
    for (var i = 0; i < hidden_panels.length; i++) {
        if ("dropdown_" + this.id != hidden_panels[i]) $('#' + hidden_panels[i]).slideUp();
    }
    $("#dropdown_" + this.id).slideDown();
});

$(document).mouseup(function (e) {
    var container = $(".panel");
    if (!container.is(e.target) && !$(e.target).parents(container).length && !canvas.getActiveObject()) {
        for (var i = 0; i < hidden_panels.length; i++) {
            $('#' + hidden_panels[i]).slideUp();
        }
    }
});

// Responsive canvas
$(window).resize(function () {
    var width = (document.getElementsByClassName('group')[0].offsetWidth);
    var height = (9 / 16) * width;
    canvas.setDimensions({ width: width + 'px', height: height + 'px' }, { cssOnly: true });
    // canvas.width = width + 'px';
    // canvas.height = height + 'px';
    canvas.renderAll();
});

document.getElementById('fillToggle').onchange = function () {
    // If the change caused by the user is true (meaning the radio is selected) then....
    if (this.checked) {
        document.getElementById('fillPick').classList.remove("disabled");
        document.getElementById('gp').classList.add("disabled");
    }
    else {
        document.getElementById('fillPick').classList.add("disabled");
        document.getElementById('gp').classList.remove("disabled");
    }
};

document.getElementById('gradientFill').onchange = function () {
    // If the change caused by the user is true (meaning the checkbox is selected) then....
    if (this.checked) {
        document.getElementById('fillPick').classList.add("disabled");
        document.getElementById('gp').classList.remove("disabled");
    }
    else {
        document.getElementById('fillPick').classList.remove("disabled");
        document.getElementById('gp').classList.add("disabled");
    }
};

document.getElementById('strokeToggle').onchange = function () {
    // If the change caused by the user is true (meaning the checkbox is selected) then....
    if (this.checked) {
        document.getElementById('strokePick').classList.remove("disabled");
        document.getElementById('stroke_width').classList.remove("disabled");
        // If the selected object doesn't have any stroke then add
        if (!canvas.getActiveObject().stroke) {
            var strokePickerCurrentColor = document.getElementById('strokePick').style.borderColor;
            var strokeWeightCurrentVal = Number(document.getElementById('stroke_width').value) / 10;
            canvas.getActiveObject().set({ stroke: strokePickerCurrentColor, strokeWidth: strokeWeightCurrentVal });
            canvas.renderAll();
        }
    }
    else {
        document.getElementById('strokePick').classList.add("disabled");
        document.getElementById('stroke_width').classList.add("disabled");
        // If the selected object has stroke, remove it
        if (canvas.getActiveObject().stroke) {
            canvas.getActiveObject().set({ stroke: null, strokeWidth: null });
            canvas.renderAll();
        }
    }
};

document.getElementById('shadowToggle').onchange = function () {
    var shadowColorElement = document.getElementById('shadowPick');
    var shadowDistanceElement = document.getElementById('shadow_dis');
    var shadowBlurElement = document.getElementById('shadow_blur');
    // If the change caused by the user is true (meaning the checkbox is selected) then....
    if (this.checked) {
        shadowColorElement.classList.remove("disabled");
        shadowDistanceElement.classList.remove("disabled");
        shadowBlurElement.classList.remove("disabled");
        if (!canvas.getActiveObject().shadow) {
            var color = shadowColorElement.style.boxShadow.split(" ");
            color = color.slice(0, color.length - 3);
            color = color[0] + color[1] + color[2];
            var shadow_blur = shadowBlurElement.value;
            var dis = shadowDistanceElement.value;
            canvas.getActiveObject().set('shadow', {
                color: color,
                blur: shadow_blur,
                offsetX: dis,
                offsetY: dis
            });
            canvas.renderAll();
        }
    }
    else {
        shadowColorElement.classList.add("disabled");
        shadowDistanceElement.classList.add("disabled");
        shadowBlurElement.classList.add("disabled");;
        if (canvas.getActiveObject().shadow) {
            canvas.getActiveObject().set('shadow', null);
            canvas.renderAll();;
        }
    }
};

document.getElementById('glowToggle').onchange = function () {
    var glowColorElement = document.getElementById('glowPick');
    var glowFeatherElement = document.getElementById('glow_feather');
    // If the change caused by the user is true (meaning the checkbox is selected) then....
    if (this.checked) {
        glowColorElement.classList.remove("disabled");
        glowFeatherElement.classList.remove("disabled");
        if (!canvas.getActiveObject().shadow) {
            var color = glowColorElement.style.boxShadow.split(" ");
            color = color.slice(0, color.length - 3);
            color = color[0] + color[1] + color[2];
            var glow_feather = glowFeatherElement.value;
            canvas.getActiveObject().set('shadow', {
                color: color,
                blur: glow_feather,
                offsetX: 0,
                offsetY: 0
            });
            canvas.renderAll();
        }
    }
    else {
        glowColorElement.classList.add("disabled");
        glowFeatherElement.classList.add("disabled");;
        if (canvas.getActiveObject().shadow) {
            canvas.getActiveObject().set('shadow', null);
            canvas.renderAll();
        }
    }
};