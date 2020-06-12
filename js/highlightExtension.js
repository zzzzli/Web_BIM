// Author: Zhouyang Li
// Date 6/9/2020
// Description: this extension is used to highlight rooms with specified
// attribute beyond certain value in the 3d viewer

function highlightExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

highlightExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
highlightExtension.prototype.constructor = highlightExtension;

highlightExtension.prototype.load = function() {
  var viewer = this.viewer;

  var highlightBtn = document.getElementById("highlightAttr");

  // highlightExtension successfully loaded!
  console.log("highlightExtension loaded!");

  // user click the submit button to highlight rooms
  highlightBtn.addEventListener('click', function() {

    // read user's input attribute and threshold
    var attr = document.getElementById("attr").value;
    var thStr = document.getElementById("threshold").value;

    // put the attribute and threshold into userData and pass it to userFunction
    // so that the data can be processed in userFunction. The fisrt element in
    // userData is to tell the userFunction that the user want to highlight rooms
    var userData = ["highlight", attr];

    // parse user's input threshold
    if (thStr.indexOf(">") != -1) {
      thStr = thStr.replace ( /[^\d.]/g, '' );
      userData.push(parseFloat(thStr));
      userData.push(Number.MAX_VALUE);
    } else if (thStr.indexOf("-") != -1) {
      var thStr1 = thStr.substring(0, thStr.indexOf("-"));
      var thStr2 = thStr.substring(thStr.indexOf("-") + 1);
      thStr1 = thStr1.replace ( /[^\d.]/g, '' );
      thStr2 = thStr2.replace ( /[^\d.]/g, '' );
      userData.push(parseFloat(thStr1));
      userData.push(parseFloat(thStr2));
    } else {
    }

    // getPropertyDb() function get model PropertyDatabase, executeUserFunction(codem userData)
    // allows executing user supplied function code on the worker thread against the PropertyDatabase
    // instance. The returned value from the supplied function will be used to resolve the returned Promise.
    // getPropertyDb: https://forge.autodesk.com/en/docs/viewer/v7/reference/Viewing/Model/
    // executeUserFunction: https://forge.autodesk.com/en/docs/viewer/v7/reference/Private/PropDbLoader/
    var thePromise = viewer.model.getPropertyDb().executeUserFunction(userFunction, userData);
    thePromise.then(function(retValue) {

      // no return value from userFunction
      if (!retValue) {
        console.log("Model doesn't contain property" + attr + ".");
        return;
      }

      // colors
      var red = new THREE.Vector4(1, 0, 0, 0.5);
      var yellow = new THREE.Vector4(1, 1, 0, 0.5);
      var green = new THREE.Vector4(0, 0.5, 0, 0.5);
      var blue = new THREE.Vector4(0, 0, 0.5, 0.5);

      // clear all highlights first
      viewer.clearThemingColors();
      // viewer.showAll();

      // hide the whole model
      // for (var i = 0; i < retValue[0]; i++) {
      //   viewer.hide(i);
      // }

      for (var i = 1; i < retValue.length; i++) {
        var R0Id = retValue[i].id;
        var roomName = retValue[i].name;

        viewer.fitToView();               // keep the model in the center of 3d viewer
        viewer.show(R0Id);                // show rooms

        // highlight rooms with different colors based on the value of their attribute
        if (retValue[i].R0 >= 2) {
          viewer.setThemingColor(R0Id, red);
        } else if (retValue[i].R0 >= 1.5) {
          viewer.setThemingColor(R0Id, yellow);
        } else if (retValue[i].R0 >= 1) {
          viewer.setThemingColor(R0Id, blue);
        } else {
          viewer.setThemingColor(R0Id, green);
        }

        console.log('The room with R0 larger than 30 is ' + roomName + '(dbId: ' + R0Id + ')' + ' with R0:', retValue[i].R0);
      }
    });
  });
  return true;
};

highlightExtension.prototype.unload = function() {
  // nothing yet
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('highlightExtension', highlightExtension);
