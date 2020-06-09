// Description: this script explodes or unexplodes the 3d model
// to enable users to view every floor of the building

var isOpen = false;                       // the model is not exploded when first opened

// explode the model based on user's input value
function onSlider(val) {
  floorExplode(viewer, val, [0]);
  viewer.impl.sceneUpdated(true);
}

// explode the model to maximum extent
function openView(level) {

  // console.log(viewer.getState());      // help to get a view state

  // viewer.restoreState(vstates[0]);     // customize your view state

  viewer.fitToView();                     // use provided view state, i.e. the model in the center of the viewer

  if (isOpen) return;
  isOpen = true;
  animate({
    timing: makeEaseOut(circ),
    draw(progress) { onSlider(progress) },
    duration: 800,
  });
}

// unexplode the model to its initial state
function resetView() {
  if (!isOpen) return;
  isOpen = false;
  // viewer.restoreState(vstates[0]);
  viewer.fitToView();
  animate({
    timing: makeEaseOut(circ),
    draw(progress) { onSlider(1-progress) },
    duration: 1500,
  });
}

// function to explode the model
function floorExplode(viewer, scale, excludedFragIds, model) {

    model = model || viewer.model
    var svf = model.getData();
    var mc = model.getVisibleBounds(true).center();
    var fragList = model.getFragmentList();
    var pt = new THREE.Vector3();

    //Input scale is in the range 0-1, where 0
    //means no displacement, and 1 maximum reasonable displacement.
    scale *= 2;

    var boxes = fragList.fragments.boxes;
    var nbFrags = fragList.getCount();
    for (var fragId = 0; fragId < nbFrags; ++fragId) {

        if (scale == 0) {

            fragList.updateAnimTransform(fragId);

        } else {

            var box_offset = fragId * 6;
            var cz = Math.floor(boxes[box_offset + 2] / 10) * 10; // + boxes[box_offset + 5];
            //cz = scale * (cz - mc.z);
            pt.z = cz * scale * 4;

            //pt.z = mc.z;

            fragList.updateAnimTransform(fragId, null, null, pt);
        }
    }
}


// animate the exploding process
function circ(timeFraction) { return 1 - Math.sin(Math.acos(timeFraction)) }
function makeEaseOut(timing) { return function(timeFraction) {return 1 - timing(1 - timeFraction)}}
function animate({timing, draw, duration}) {
  let start = performance.now();
  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;
    let progress = timing(timeFraction);
    draw(progress); // draw it
    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }
  });
}

// user can customize the viewing state by vstates, the vstates can be obtained
// using viewer.getState() in the openView function.
const vstates = [
  {
    "seedURN": "home",
    "objectSet": [{
      "id": [],
      "isolated": [],
      "hidden": [],
      "explodeScale": 0,
      "idType": "lmv"
    }],
    "viewport": {
      "name": "",
      "eye": [207.30603790283203, -207.30602359771729, 207.30602645874023],
      "target": [0, -9.5367431640625e-7, 0],
      "up": [-0.408248300480253, 0.40824827043108136, 0.8164965859359216],
      "worldUpVector": [0, 0, 1],
      "pivotPoint": [0, -9.5367431640625e-7, 0],
      "distanceToOrbit": 359.06457494658923,
      "aspectRatio": 1.625,
      "projection": "orthographic",
      "isOrthographic": true,
      "fieldOfView": 37.80748217565049
    },
    "renderOptions": {
      "environment": "Boardwalk",
      "ambientOcclusion": {
        "enabled": true,
        "radius": 13.123359580052492,
        "intensity": 1
      },
      "toneMap": {
        "method": 1,
        "exposure": -7,
        "lightMultiplier": -1e-20
      },
      "appearance": {
        "ghostHidden": true,
        "ambientShadow": true,
        "antiAliasing": true,
        "progressiveDisplay": true,
        "swapBlackAndWhite": false,
        "displayLines": true,
        "displayPoints": true
      }
    },
    "cutplanes": []
  }, {
    "seedURN": "exploded",
    "objectSet": [{
      "id": [],
      "isolated": [],
      "hidden": [],
      "explodeScale": 0,
      "idType": "lmv"
    }],
    "viewport": {
      "name": "",
      "eye": [-274.98795631207673, -551.2456417563669, 18.376081859041367],
      "target": [-274.94317121075403, -551.1576115714628, 18.36042697592285],
      "up": [0.07098511535741645, 0.1395292775008055, 0.9876703367611064],
      "worldUpVector": [0, 0, 1],
      "pivotPoint": [17.422795311668544, 39.67309215526787, 3.7083339691161967],
      "distanceToOrbit": 653.4364492059653,
      "aspectRatio": 1.9121887287024901,
      "projection": "perspective",
      "isOrthographic": false,
      "fieldOfView": 37.80748217565049
    }
  },];
