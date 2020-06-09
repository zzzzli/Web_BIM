var viewer;
var md_doc;
var md_viewables;
var isOpen = false;

var options = {
    env: 'AutodeskProduction',
    api: 'derivativeV2', // TODO: for models uploaded to EMEA change this option to 'derivativeV2_EU'
    getAccessToken: getForgeToken,
};
var documentId = 'urn:' + getUrlParameter('urn');

// Run this when the page is loaded
Autodesk.Viewing.Initializer(options, function onInitialized(){

    var config3d = {
      extensions: ['highlightExtension', 'findRoomExtension', 'materialExtension'],
      loaderExtensions: { svf: "Autodesk.MemoryLimited" }
    };

    // Find the element where the 3d viewer will live.
    var htmlElement = document.getElementById('MyViewerDiv');
    if (htmlElement) {
        // Create and start the viewer in that element
        viewer = new Autodesk.Viewing.GuiViewer3D(htmlElement, config3d);
        viewer.start();
        // Load the document into the viewer.
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    }
});

/**
* Autodesk.Viewing.Document.load() success callback.
* Proceeds with model initialization.
*/
function onDocumentLoadSuccess(doc) {
    // Load the default viewable geometry into the viewer.
    // Using the doc, we have access to the root BubbleNode,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    var viewables = doc.getRoot().search({'type':'geometry'});

    md_doc = doc;
    md_viewables = viewables;

    if (viewables) {
        // populate the Choose viewables drop down with the viewable name

        // var sel = document.getElementById('viewables');

        var newConstructionIndex = 0;
        for(var i = 0; i < viewables.length; i++) {
            // var opt = document.createElement('option');
            if (viewables[i].data.name === "New Construction") newConstructionIndex = i;
            // opt.innerHTML = viewables[i].data.name;
            // opt.value = viewables[i].data.name;
            // sel.appendChild(opt);
        }

        // document.getElementById("viewables").selectedIndex = newConstructionIndex;
        viewer.loadDocumentNode(doc, viewables[newConstructionIndex]).then(function(result) {
            // viewer.restoreState(vstates[0]);
            viewer.fitToView();
            console.log('Viewable Loaded!');
        }).catch(function(err) {
            console.log('Viewable failed to load.');
            console.log(err);
        }
      )

      // Make the Choose viewable drop-down visible, if and only if only there are more than one viewables to display

      // if (viewables.length > 1) {
      //     var viewablesDIV = document.getElementById("viewables_dropdown");
      //     viewablesDIV.style.display = "block";
      // }
    }
}

/**
* Autodesk.Viewing.Document.load() failure callback.
*/
function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode: ' + viewerErrorCode);
    jQuery('#MyViewerDiv').html('<p>Translation in progress... Please try refreshing the page.</p>');
}


/* For selecting viewables */

// function selectViewable() {
//     var indexViewable = document.getElementById("viewables").selectedIndex;
//     // Load another viewable from selectedIndex of drop-down.
//     viewer.loadDocumentNode(md_doc, md_viewables[indexViewable]);
// }


// Get Query string from URL,
// we will use this to get the value of 'urn' from URL
function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Get public access token for read only,
// using ajax to access route /api/forge/oauth/public in the background
function getForgeToken(callback) {
    jQuery.ajax({
        url: '/api/forge/oauth/public',
        success: function (res) {
            callback(res.access_token, res.expires_in);
        }
    });
}

function onSlider(val) {
  floorExplode(viewer, val, [0]);
  viewer.impl.sceneUpdated(true);
}

function openView(level) {
  // console.log(viewer.getState());      // help to get a view state
  // viewer.restoreState(vstates[0]);
  viewer.fitToView();
  if (isOpen) return;
  isOpen = true;
  animate({
    timing: makeEaseOut(circ),
    draw(progress) { onSlider(progress) },
    duration: 800,
  });
}

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
