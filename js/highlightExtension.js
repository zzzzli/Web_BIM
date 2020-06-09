// This extension is used to highlight rooms with specified
// attribute beyond certain value

function highlightExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

highlightExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
highlightExtension.prototype.constructor = highlightExtension;

highlightExtension.prototype.load = function() {
  var viewer = this.viewer;

  var highlightBtn = document.getElementById("highlightAttr");

  console.log("highlightExtension loaded!");

  highlightBtn.addEventListener('click', function() {

    var attr = document.getElementById("attr").value;
    var thres = parseInt(document.getElementById("threshold").value);
    var userData = ["highlight", attr, thres];

    var thePromise = viewer.model.getPropertyDb().executeUserFunction(userFunction, userData);
    thePromise.then(function(retValue) {
      if (!retValue) {
        console.log("Model doesn't contain property 'R0'.");
        return;
      }

      var red = new THREE.Vector4(1, 0, 0, 0.5);
      var yellow = new THREE.Vector4(1, 1, 0, 0.5);
      var green = new THREE.Vector4(0, 0.5, 0, 0.5);
      var blue = new THREE.Vector4(0, 0, 0.5, 0.5);

      // clear all highlights first
      viewer.clearThemingColors();
      // viewer.showAll();

      // hide all
      // for (var i = 0; i < retValue[0]; i++) {
      //   viewer.hide(i);
      // }

      for (var i = 1; i < retValue.length; i++) {
        var R0Id = retValue[i].id;
        var roomName = retValue[i].name;

        viewer.fitToView();
        viewer.show(R0Id);
        if (retValue[i].R0 >= 30) {
          viewer.setThemingColor(R0Id, red);
        } else if (retValue[i].R0 >= 20) {
          viewer.setThemingColor(R0Id, yellow);
        } else if (retValue[i].R0 >= 10) {
          viewer.setThemingColor(R0Id, green);
        } else {}

        console.log('The room with R0 larger than 30 is ' + roomName + '(dbId: ' + R0Id + ')' + ' with R0:', retValue[i].R0);
      }
    });
  });
  return true;
};

function userFunction(pdb, userData) {
  var attrIdR0 = -1;
  var attrIdName = -1;
  var res = [];

  res.push(pdb.getObjectCount());

  // highlight

  if (userData[0] == "highlight") {
    // Iterate over all attributes and find the index to the one we are interested in
    pdb.enumAttributes(function(i, attrDef, attrRaw) {
      var attrName = attrDef.name;

      if (attrName === 'name') {
        attrIdName = i;
      }
      if (attrName === userData[1]) {
        attrIdR0 = i;
        return true; // to stop iterating over the remaining attributes.
      }
    });

    // Early return is the model doesn't contain data for "R0".
    if (attrIdName === -1 || attrIdR0 === -1) {
      return null;
    }


    // Now iterate over all parts to find out which one is qualified.
    var dbIdName;
    pdb.enumObjects(function(dbId) {
      // For each part, iterate over their properties.
      pdb.enumObjectProperties(dbId, function(attrId, valId) {

        if (attrId === attrIdName) {
          dbIdName = pdb.getAttrValue(attrId, valId);
        }
        // Only process 'name' and 'R0' property.
        // The word "Property" and "Attribute" are used interchangeably.
        if (attrId === attrIdR0) {
          var value = pdb.getAttrValue(attrId, valId);
          // R0 larger than userData[1]
          if (value > userData[2]) {
            res.push({
              id: dbId,
              name: dbIdName,
              R0: value
            });
          }
          // Stop iterating over additional properties when "R0" is found.
          return true;
        }
      });
    });
  }

  // search room
  else {
    // Iterate over all attributes and find the index to the one we are interested in
    pdb.enumAttributes(function(i, attrDef, attrRaw) {
      var attrName = attrDef.name;

      if (attrName === 'name') {
        attrIdName = i;
      }
      if (attrName === 'R0') {
        attrIdR0 = i;
        return true; // to stop iterating over the remaining attributes.
      }
    });

    // Early return is the model doesn't contain data for "R0".
    if (attrIdName == -1 || attrIdR0 === -1)
      return null;

    // Now iterate over all parts to find out which one is qualified.
    var dbIdName, roomDbId;
    pdb.enumObjects(function(dbId) {
      // For each part, iterate over their properties.
      pdb.enumObjectProperties(dbId, function(attrId, valId) {
        if (attrId === attrIdName) {
          dbIdName = pdb.getAttrValue(attrId, valId);
          // var squareBracketIndex = dbIdName.indexOf("[");
          // if (squareBracketIndex != -1) dbIdName = dbIdName.substring(0, squareBracketIndex);
        }

        if (attrId === attrIdR0) {
          if (dbIdName.includes(userData[1])) {
            console.log(dbIdName);
            roomDbId = dbId;
            return true;
          }
        }
      });
    });

    pdb.enumObjectProperties(roomDbId, function(attrId, valId) {
      if (attrId === attrIdR0) {
        var value = pdb.getAttrValue(attrId, valId);
        res.push(roomDbId);
        res.push(value);
        return true;
      }
    });
  }

  // Return results
  return res;
}

highlightExtension.prototype.unload = function() {
  // nothing yet
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('highlightExtension', highlightExtension);
