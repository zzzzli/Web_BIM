function selectiveExplode (viewer, scale, excludedFragIds, model) {

  model = model || viewer.model

  var svf = model.getData();

  var mc = model.getVisibleBounds(true).center();

  var fragList = model.getFragmentList();

  var pt = new THREE.Vector3();

  //Input scale is in the range 0-1, where 0
  //means no displacement, and 1 maximum reasonable displacement.
  scale *= 2;

  //If we have a full part hierarchy we can use a
  //better grouping strategy when exploding
  if (svf.instanceTree && svf.instanceTree.nodeAccess.nodeBoxes && scale !== 0) {

    var scaledExplodeDepth = scale * (svf.instanceTree.maxDepth - 1) + 1;
    var explodeDepth = 0 | scaledExplodeDepth;
    var currentSegmentFraction = scaledExplodeDepth - explodeDepth;

    var it = svf.instanceTree;
    var tmpBox = new Float32Array(6);

    (function explodeRec(nodeId, depth, cx, cy, cz, ox, oy, oz) {

      var oscale = scale * 2;

      // smooth transition of this tree depth
      // from non-exploded to exploded state
      if (depth == explodeDepth)
        oscale *= currentSegmentFraction;

      it.getNodeBox(nodeId, tmpBox);

      var mycx = 0.5 * (tmpBox[0] + tmpBox[3]);
      var mycy = 0.5 * (tmpBox[1] + tmpBox[4]);
      var mycz = 0.5 * (tmpBox[2] + tmpBox[5]);

      if (depth > 0 && depth <= explodeDepth) {
        var dx = (mycx - cx) * oscale;
        var dy = (mycy - cy) * oscale;
        var dz = (mycz - cz) * oscale;

        //var omax = Math.max(dx, Math.max(dy, dz));
        ox += dx;
        oy += dy;
        oz += dz;
      }

      svf.instanceTree.enumNodeChildren(nodeId, function(dbId) {

        explodeRec(dbId, depth+1, mycx, mycy, mycz, ox, oy, oz);

      }, false);

      svf.instanceTree.enumNodeFragments(nodeId, function(fragId) {

        if(excludedFragIds.indexOf(fragId.toString()) < 0) {

          pt.x = ox;
          pt.y = oy;
          pt.z = oz;

          fragList.updateAnimTransform(fragId, null, null, pt);
        }

      }, false);

    })(svf.instanceTree.getRootId(), 0, mc.x, mc.y, mc.x, 0, 0, 0);

  } else {

    var boxes = fragList.fragments.boxes;

    var nbFrags = fragList.getCount()

    for (var fragId = 0; fragId < nbFrags; ++fragId) {

      if(excludedFragIds.indexOf(fragId) < 0) {

        if (scale == 0) {

          fragList.updateAnimTransform(fragId);

        } else {

          var box_offset = fragId * 6;

          var cx = 0.5 * (boxes[box_offset] + boxes[box_offset + 3]);
          var cy = 0.5 * (boxes[box_offset + 1] + boxes[box_offset + 4]);
          var cz = 0.5 * (boxes[box_offset + 2] + boxes[box_offset + 5]);

          cx = scale * (cx - mc.x);
          cy = scale * (cy - mc.y);
          cz = scale * (cz - mc.z);

          pt.x = cx;
          pt.y = cy;
          pt.z = cz;

          fragList.updateAnimTransform(fragId, null, null, pt);
        }
      }
    }
  }
}
