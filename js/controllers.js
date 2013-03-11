'use strict';
/* App Controllers */

var controllers = angular.module('LeapApp.controllers', []);

controllers.controller('MainCtrl', function ($scope, $rootScope, $timeout, $log, Leap, MainModel){
    $log.info('MainCtrl');

    //var trace = console.log.bind(console);
    //trace('testing');

    $scope.helpVisible = true;

    $scope.MainModel = MainModel;

    $scope.onGallery = function(e, direction){

        var dir = (e.direction === 'right')? -1:1;
        var currentIdx = MainModel.currentIndex;
        var newIdx = currentIdx + dir;

        if(newIdx < 1 ){
            newIdx = 6;
        }else if(newIdx > 6){
            newIdx = 1;
        }

        MainModel.currentIndex = newIdx;

    }

    $scope.onThumb = function(idx){
        MainModel.currentIndex = idx;
    }

    $scope.onScroll = function(){

        //$('.thumbnails').scrollTo('+=1000px', 800, { axis:'x' });

//        var evt = document.createEvent("WheelEvent");
//        var deltaX = -50;
//        var deltaY = 0;
//        var screenX = 531;
//        var screenY = 710;
//        var clientX = 533;
//        var clientY = 616;
//        var ctrlKey = false;
//        var altKey = false;
//        var shiftKey = false;
//        var metaKey = false;
//        //evt.target = $('.thumbnails');
//
//        evt.initWebKitWheelEvent(deltaX, deltaY, window, screenX, screenY, clientX,
//            clientY, ctrlKey, altKey, shiftKey, metaKey);
//
//        $log.info(evt);
//
//        $('.thumbnails li:first-child').trigger(evt);
    }

    document.onmousewheel = moveObject;

    function moveObject(event)
    {
        $log.info(event);

    }

});











