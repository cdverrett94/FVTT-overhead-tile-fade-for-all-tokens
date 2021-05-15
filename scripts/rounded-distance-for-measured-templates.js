let roundedDistanceSettings = {}; // set empty object; gets populated during "ready" Hook

// updates the variables used in the script; used to set the settings on settings change, scene change, and ready.
const updateRoundedDistanceSettings = () => {
    roundedDistanceSettings = {
        "distance-multiple": ((game.settings.get('rounded-distance-for-measured-templates', 'distance-multiple')) ? parseInt(game.settings.get('rounded-distance-for-measured-templates', 'distance-multiple')) : canvas.scene.data.gridDistance) * (canvas.dimensions.size / canvas.dimensions.distance), // distance multiple from settings. defaults to grid distance
        "cone-angle-multiple": (game.settings.get('rounded-distance-for-measured-templates', 'cone-angle-multiple')) ? parseInt(game.settings.get('rounded-distance-for-measured-templates', 'cone-angle-multiple')) : false, // multiple to snap angles for cones
        "ray-angle-multiple": (game.settings.get('rounded-distance-for-measured-templates', 'ray-angle-multiple')) ? parseInt(game.settings.get('rounded-distance-for-measured-templates', 'ray-angle-multiple')) : false, // multiple to snap angles for rays
        "use-steps": game.settings.get('rounded-distance-for-measured-templates', 'use-steps'), // use stepped distance multiples
        "positive-steps-array": game.settings.get('rounded-distance-for-measured-templates', 'step-array').split(",").map(x => parseInt(x) * (canvas.dimensions.size / canvas.dimensions.distance)).sort((first, second) => (first - second)), // steps array converted to integers and converted to pixels and sorted
        "negative-steps-array": game.settings.get('rounded-distance-for-measured-templates', 'step-array').split(",").map(x => parseInt(x) * (canvas.dimensions.size / canvas.dimensions.distance) * -1).sort((first, second) => (second - first)), // steps array converted to integers and converted to pixels and sorted
        "use-multiple-after-steps": game.settings.get('rounded-distance-for-measured-templates', 'use-multiple-after-steps') // use  roundedDistanceSettings["distance-multiple"] after reaching highest integer from stepArray
    }
}

/*
  Round a number to the nearest multiple 

  number - current distance number before rounding
  multiple - what multiple to round to
  minimum - minimum number to round to - prevents distance from being 0
*/
const roundToMultiple = (number, multiple, minimum) => {
    return (number < 0) ? Math.min(Math.round(number / multiple) * multiple, -minimum) : Math.max(Math.round(number / multiple) * multiple, minimum);
}


/*
  Rounds a number to the nearest step in the array

  array - array of steps 
  number - current distance number before rounding
  multiple - what multiple to round to
  increase_after_step - if using stepped rounding, should the rounding stop (false) or go to default rounding (true) 

*/
const roundToStep = (number) => {
    let array = (number < 0) ? roundedDistanceSettings["negative-steps-array"] : roundedDistanceSettings["positive-steps-array"];
    if (((number >= array[array.length - 1] && number >= 0) || (number <= array[array.length - 1] && number < 0)) && roundedDistanceSettings["use-multiple-after-steps"]) { // check if number is >= (<=) last index if number is postive (negative) and if increase_after_step is true
        return roundToMultiple(number, roundedDistanceSettings["distance-multiple"], array[array.length - 1]);
    } else {
        let closest = 0;
        closest = array.reduce(function(prev, curr) {
            return (Math.abs(curr - number) < Math.abs(prev - number) ? curr : prev);
        });
        return closest;
    }
}


/*
  Choose which rounding method to use based on setting
  
  use_steps - should the rounding be based on steps - set in the module settings
  number - current distance number before rounding
  multiple - what multiple to round to
  array - array of steps 
  increase_after_step - if using stepped rounding, should the rounding stop (false) or go to default rounding (true) 

*/
const roundDistance = (use_steps, number) => {
    if (use_steps) {
        return roundToStep(number);
    } else {
        return roundToMultiple(number, roundedDistanceSettings["distance-multiple"], roundedDistanceSettings["distance-multiple"]);
    }
};


Hooks.on("closeSettingsConfig", updateRoundedDistanceSettings);
Hooks.on("canvasInit", updateRoundedDistanceSettings);

// register module settings for multiple to round to
Hooks.once("init", function() {
    game.settings.register('rounded-distance-for-measured-templates', 'distance-multiple', {
        name: "What multiple should the distances for your measured templated be?",
        hint: "The multiple you want the measured templates distance to round to. If left blank, the measured templates will be rounded based on the scenes grid distance.",
        scope: 'world',
        config: true,
        restricted: true,
        default: "",
        type: String
    });

    game.settings.register('rounded-distance-for-measured-templates', 'cone-angle-multiple', {
        name: "What multiple should the angle for rotating cones be rounded to?",
        hint: "The multiple you want the angle for cones to snap when rotating. If left blank, there won't be any angle snapping.",
        scope: 'world',
        config: true,
        restricted: true,
        default: "",
        type: String
    });

    game.settings.register('rounded-distance-for-measured-templates', 'ray-angle-multiple', {
        name: "What multiple should the angle for rotating rays be rounded to?",
        hint: "The multiple you want the angle for rays to snap when rotating. If left blank, there won't be any angle snapping.",
        scope: 'world',
        config: true,
        restricted: true,
        default: "",
        type: String
    });

    game.settings.register('rounded-distance-for-measured-templates', 'use-steps', {
        name: "Should the distances be rounded by steps instead of a single value?",
        hint: "If set to yes, given a step array of '1, 5, 10, 20, 50', the rounded disatnce would start at 1, then round to 5, then round to 10, etc.",
        scope: 'world',
        config: true,
        restricted: true,
        default: false,
        type: Boolean
    });

    game.settings.register('rounded-distance-for-measured-templates', 'step-array', {
        name: "What array of steps do you want to use?",
        hint: "Put the steps you want separated by a comma. Example: 1, 5, 10, 20, 50",
        scope: 'world',
        config: true,
        restricted: true,
        default: "1, 5, 10, 20, 50",
        type: String
    });

    game.settings.register('rounded-distance-for-measured-templates', 'use-multiple-after-steps', {
        name: "After all steps are used, should the distances to default to round to the nearest multiple?",
        hint: "",
        scope: 'world',
        config: true,
        restricted: true,
        default: false,
        type: Boolean
    });
});

Hooks.on("ready", () => {
    updateRoundedDistanceSettings();

    const onDragLeftMove = function(event) {
        const {
            destination,
            createState,
            preview,
            origin
        } = event.data;

        if (createState === 0) return;
        // Snap the destination to the grid
        event.data.destination = canvas.grid.getSnappedPosition(destination.x, destination.y, this.gridPrecision);
        // Compute the ray
        const ray = new Ray(origin, destination);
        const ratio = (canvas.dimensions.size / canvas.dimensions.distance);


        // Start amended code to round distances
        try {
            if (preview.data.t === "rect") { // for rectangles
                // round width and height to nearest multiple.
                ray.dx = roundDistance(roundedDistanceSettings["use-steps"], ray.dx);
                ray.dy = roundDistance(roundedDistanceSettings["use-steps"], ray.dy);

            } else { // for circles, cones, and rays
                ray._distance = roundDistance(roundedDistanceSettings["use-steps"], ray.distance, ratio * roundedDistanceSettings["distance-multiple"], ratio * roundedDistanceSettings["distance-multiple"]);
            }

            // round angles for cones and rays
            if (preview.data.t === "cone" && roundedDistanceSettings["cone-angle-multiple"]) {
                // round angle
                ray._angle = Math.toRadians(roundToMultiple(Math.toDegrees(ray.angle), roundedDistanceSettings["cone-angle-multiple"], 0));

            }
            if (preview.data.t === "ray" && roundedDistanceSettings["ray-angle-multiple"]) {
                // round angle
                ray._angle = Math.toRadians(roundToMultiple(Math.toDegrees(ray.angle), roundedDistanceSettings["ray-angle-multiple"], 0));

            }
        } catch (error) { console.error(`Rounded Distance for Measured Templates: ${error.message}`); }
        // End amended code to round distances


         // Update the preview object
        preview.data.direction = Math.normalizeDegrees(Math.toDegrees(ray.angle));
        preview.data.distance = ray.distance / ratio;
        preview.refresh();
        // Confirm the creation state
        event.data.createState = 2;
    };

    // use libWrapper to wrap method if available
    if (game.modules.get("lib-wrapper")?.active) {
        libWrapper.register("rounded-distance-for-measured-templates", "TemplateLayer.prototype._onDragLeftMove", onDragLeftMove, "OVERRIDE");
    } else {
        TemplateLayer.prototype._onDragLeftMove = onDragLeftMove;
    }
});