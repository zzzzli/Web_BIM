// This extension is used to search and select a room
// with name

function findRoomExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

findRoomExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
findRoomExtension.prototype.constructor = findRoomExtension;

findRoomExtension.prototype.load = function() {
  var viewer = this.viewer;

  var findRoomBtn = document.getElementById("findRoom");

  console.log("findRoomExtension loaded!");

  findRoomBtn.addEventListener('click', function() {

    var userData = ["findRoom", document.getElementById("room").value];

    var thePromise = viewer.model.getPropertyDb().executeUserFunction(userFunction, userData);
    thePromise.then(function(retValue) {
      if (!retValue) {
        console.log("Model doesn't contain property 'R0'.");
        return;
      }

      var red = new THREE.Vector4(1, 0, 0, 0.5);
      var yellow = new THREE.Vector4(1, 1, 0, 0.5);
      var green = new THREE.Vector4(0, 0.5, 0, 0.5);

      // clear all highlights first
      viewer.clearThemingColors();

      // hide all parts
      // for (var i = 0; i < retValue[0]; i++) {
      //   viewer.hide(i);
      // }

      viewer.fitToView();

      var roomDbIds = [];
      var outputData = "Search Result: ";

      for (var i = 1; i < retValue.length; i++) {
        var roomDbId = retValue[i].id;
        var roomAttr = retValue[i].R0;

        // push all found rooms' roomDbId into this array, and select them all later
        roomDbIds.push(roomDbId);

        viewer.show(roomDbId);                      // show this part

        // highlight rooms with different colors based on the value of their attribute
        if (roomAttr >= 30) {
          viewer.setThemingColor(roomDbId, red);
        } else if (roomAttr >= 20) {
          viewer.setThemingColor(roomDbId, yellow);
        } else if (roomAttr >= 10) {
          viewer.setThemingColor(roomDbId, green);
        } else {}

        outputData += 'The R0 of ' + retValue[i].name + 'is ' + roomAttr + '. ';
        // console.log(outputData);
      }

      document.getElementById("room-data").innerHTML = outputData;
      viewer.select(roomDbIds);     // select all found rooms

    });
  });
  return true;
};

findRoomExtension.prototype.unload = function() {
  // nothing yet
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('findRoomExtension', findRoomExtension);
