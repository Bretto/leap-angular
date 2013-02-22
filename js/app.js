'use strict';

angular.module('LeapApp', ['LeapApp.filters', 'LeapApp.services', 'LeapApp.directives', 'LeapApp.controllers', 'dpLeapEvents']);


// https://github.com/randallb/angular-hammer
var dpLeapEvents = angular.module('dpLeapEvents', []);

angular.forEach('dpTap:Tap'.split(' '), function(name) {
    var directive = name.split(':');
    var directiveName = directive[0];
    var eventName = directive[1];
    dpLeapEvents.directive(directiveName,
        function($parse, Leap, $log, $rootScope) {
            return function(scope, element, attr) {
                var fn = $parse(attr[directiveName]);
                var opts = $parse(attr[directiveName + 'Opts'])(scope, {});
                var onEventName = "on" + eventName;

                $rootScope.$on('leapData', function(e, leapData) {

                    if(leapData.pointables && leapData.pointables.length === 1 ){
                        var x = leapData.pointables[0].tipPosition[0];
                        var y = leapData.pointables[0].tipPosition[1];

                        var posX = (x*5) + window.innerWidth / 2;
                        var posY = window.innerHeight -((y*5) - 700);

                        var btnPos = getPosition(element);

                        var x = posX - btnPos.posX;
                        var y = posY - btnPos.posY;

                        var hypot = Math.sqrt(x*x + y*y);

                        if(hypot < 100 ){
                            $log.info(hypot);
                            scope.$digest();
                        }
                    }
                });

                function getPosition(elem) {
                    return {
                        posY:elem.prop('offsetTop'),
                        posX:elem.prop('offsetLeft')
                    };
                }

//                $().leap("setEvent", onEventName, function(event){
//                    scope.$apply(function() {
//                        var e = {pointable:event, element:element};
//                        fn(scope, {$event: e});
//                    });
//                });
            };
        });
});
