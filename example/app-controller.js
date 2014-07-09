angular.module('sampleApp').
  controller('SampleAppController', ['$timeout', '$scope', function($timeout, $scope) {

    /** Example 1 **/
    /**
    * a. DOM manipulation method of changing button
    */
    var btn = document.getElementById('trainingWheels');
    btn.onclick = function() {
      btn.innerHTML = 'Training wheels off!';
    }

    /**
    * b. Angular method of changing button
    */
    // this.clicked = false;


    /** Example 2 **/
    this.bicycles = ['Google bike', 'Mountain Bike', 'Conference Bike'];
    /**
    * a. DOM manipulation method of adding dynamic elements
    */
    var bikeDiv = document.getElementById('bicycles');
    for(var i = 0; i < this.bicycles.length; i++) {
        var newDiv = document.createElement('div');
        newDiv.innerHTML = this.bicycles[i];
        bikeDiv.appendChild(newDiv);
    }
    /**
    * b. Angular method: no controller code needed!
    */

    /** Example 3 **/
    /**
    * a. DOM manipulation method (using JQuery) of removing elements
    * Also demonstrates catching asynchronous actions
    */
    $timeout(function() {
       var elt = document.getElementById('remove');
       elt.remove();
    }, 3000);

    /**
    * b. Angular method for removal
    */
      // $scope.removeTime = false;
      // $timeout(function() {
      //   console.log('Running');
      //   $scope.removeTime = true;
      // }, 3000);
  }]);
