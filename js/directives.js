'use strict';

var directives = angular.module('LeapApp.directives', []);
directives.utils = {};

directives.directive('leapClick', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr) {

        var locator = new directives.utils.Locator();
        var isHot = false;
        var hasTrigger = false;
        var css = attr.leapClick;

        $rootScope.$broadcast('leapRegion', elem);

        $rootScope.$on('leapData', function (e, leapData) {

            isHot = (locator.getIsHot(leapData, css, scope, elem) && hasTrigger == false );

            if (isHot) {
                if (leapData.pointables && leapData.pointables.length === 1) {
                    var pointable = leapData.pointables[0];

                    var v = Math.abs(pointable.tipVelocity[1]);

                    if (v > 200 && hasTrigger === false) {
                        $(elem).trigger("click");
                        hasTrigger = true;
                        $timeout(function () {
                            hasTrigger = false;
                        }, 250);
                    }
                }
            }
        });

    }

    return {
        restrict: 'A',
        link: link
    }
});


directives.directive('leapSwipe', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        var direction;
        var locator = new directives.utils.Locator();
        var isHot = false;
        var hasTrigger = false;
        var css = attr.leapSwipe;

        $rootScope.$broadcast('leapRegion', elem);

        $rootScope.$on('leapData', function (e, leapData) {

            isHot = (locator.getIsHot(leapData, css, scope, elem) && hasTrigger == false );

            if (isHot) {
                if (leapData.pointables && leapData.pointables.length === 1) {
                    var pointable = leapData.pointables[0];

                    var v = pointable.tipVelocity[0];
                    direction = (v > 0) ? 'right' : 'left';

                    if (Math.abs(v) > 700 && hasTrigger === false) {
                        var event = jQuery.Event("click");
                        event.direction = direction;

                        $(elem).trigger(event);
                        hasTrigger = true;
                        $timeout(function () {
                            hasTrigger = false;
                        }, 300);
                    }
                }
            }

        });


    }

    return {

        restrict: 'A',
        link: link
    }
});

directives.directive('leapScroll', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        var direction;
        var locator = new directives.utils.Locator();
        var isHot = false;
        var hasTrigger = false;
        var css = attr.leapScroll;

        $rootScope.$broadcast('leapRegion', elem);

        $rootScope.$on('leapData', function (e, leapData) {

            isHot = (locator.getIsHot(leapData, css, scope, elem) && hasTrigger == false );

            if (isHot) {
                if (leapData.pointables && leapData.pointables.length === 1) {
                    var pointable = leapData.pointables[0];

                    var v = pointable.tipVelocity[0];
                    direction = (v > 0) ? '-' : '+';
                    var delta = Math.abs(v);

//                    $log.info(delta);

                    if (delta > 700 && hasTrigger === false) {
                        $log.info(delta);

                        $('.thumbnails').scrollTo(direction + '=' + delta / 4, 500, { axis: 'x' });

                        hasTrigger = true;
                        $timeout(function () {
                            hasTrigger = false;
                        }, 300);
                    }
                }
            }

        });


    }

    return {

        restrict: 'A',
        link: link
    }
});


directives.directive('leapOverlay', function ($log, $parse, $rootScope, $timeout) {

    var regions = [];

    $rootScope.$on('leapRegion', function (e, elemPos) {
        $log.info('leapRegion');
        regions.push(elemPos);
    });

    function link(scope, elem, attr, ctrl) {
        var canvas = elem.find("canvas:first")[0];
        var context = canvas.getContext("2d");
        scope.isHelpVisible = true;

        function onWindowResize() {
            $(canvas).attr({'width': $(window).width(), 'height': $(window).height()});
        }

        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();

        $rootScope.$on('leapData', function (e, leapData) {

            if (leapData.pointables && leapData.pointables.length > 0) {

                var leapX = leapData.pointables[0].tipPosition[0];
                var leapY = leapData.pointables[0].tipPosition[1];

                var pointerPos = directives.utils.getPointerPos(leapX, leapY);

                canvas.width = canvas.width;


                if (scope.isHelpVisible) {
                    angular.forEach(regions, function (elem) {

                        if (VISIBILITY.isVisible(elem[0])) {
                            var elemPos = directives.utils.getPos(elem);
                            context.beginPath();
                            context.rect(elemPos.x, elemPos.y, elemPos.w, elemPos.h);
                            context.lineWidth = 5;
                            context.strokeStyle = '#FF0220';
                            context.stroke();
                        }
                    });

                    angular.forEach(regions, function (elem) {

                        if (VISIBILITY.isVisible(elem[0])) {

                            var elemPos = directives.utils.getPos(elem);
                            var x = pointerPos.x - elemPos.centerX;
                            var y = pointerPos.y - elemPos.centerY;

                            var hypot = Math.sqrt(x * x + y * y);

                            var lw = Math.min(200000 / (hypot * hypot), 100);

                            context.beginPath();
                            context.moveTo(elemPos.centerX, elemPos.centerY);
                            context.lineTo(pointerPos.x, pointerPos.y);
                            context.lineWidth = lw;
                            context.strokeStyle = '#FF0220';
                            context.lineCap = 'round';
                            context.stroke();

                        }
                    });
                }

                angular.forEach(leapData.pointables, function (pointable) {

                    var pointablePos = directives.utils.getPointerPos(pointable.tipPosition[0], pointable.tipPosition[1]);

                    context.beginPath();
                    context.arc(pointablePos.x, pointablePos.y, 20, 0, 2 * Math.PI, false);
                    context.fillStyle = 'blue';
                    context.fill();
                });
            }
        });

    }

    return {
        scope: {},
        replace: true,
        templateUrl: 'templates/leap-overlay.html',
        restrict: 'E',
        link: link
    }
});

directives.directive('leapPlanar', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        var canvasPlanar = elem[0];// elem.find("canvas:first")[0];
        var ctxPlanar = canvasPlanar.getContext("2d");


        var x = d3.scale.linear().range([0, canvasPlanar.width]).domain([-200, 200]);
        var y = d3.scale.linear().range([canvasPlanar.height, 0]).domain([0, 400]);


        function renderPointablesPlanar(obj) {

            ctxPlanar.fillStyle = "rgba(0,0,0,.3)";
            ctxPlanar.fillRect(0, 0, canvasPlanar.width, canvasPlanar.height);
            ctxPlanar.fillStyle = 'rgba(255, 0, 0, 1)';

            if ("pointables" in obj) {
                obj.pointables.forEach(function (p) {
                    var pos = p.tipPosition;
                    ctxPlanar.fillRect(x(pos[0]), y(pos[1]), 4, 4);
                });
            }
        };

        $rootScope.$on('leapData', function (e, leapData) {
            renderPointablesPlanar(leapData);
        });

    }

    return {
        replace: true,
        templateUrl: 'templates/leap-planar.html',
        scope: {},
        restrict: 'E',
        link: link
    }
});

directives.directive('leapGraph', function ($log, $parse, $rootScope, $timeout) {

    function link(scope, elem, attr, ctrl) {

        var canvasPlanar = elem[0];// elem.find("canvas:first")[0];
        var ctxPlanar = canvasPlanar.getContext("2d");
        ctxPlanar.fillStyle = "rgba(0,0,0,1)";
        ctxPlanar.fillRect(0, 0, canvasPlanar.width, canvasPlanar.height);

        var y = d3.scale.linear().range([canvasPlanar.height / 2, -canvasPlanar.height / 2]).domain([1000, -1000]);

        function shift_canvas(ctx, w, h, dx, dy) {
            var imageData = ctx.getImageData(0, 0, w, h);
            ctx.clearRect(0, 0, w, h);
            ctx.putImageData(imageData, dx, dy);
        }

        function renderPointablesPlanar(leapData) {

            var r = (attr.color === 'r') ? 255 : 0;
            var g = (attr.color === 'g') ? 255 : 0;
            var b = (attr.color === 'b') ? 255 : 0;

            var grd = ctxPlanar.createLinearGradient(0, 0, 0, canvasPlanar.height);

            grd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + 1 + ')');
            grd.addColorStop(.5, 'rgba(' + r + ',' + g + ',' + b + ',' + .3 + ')');
            grd.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',' + 1 + ')');

            ctxPlanar.fillStyle = grd;


            //ctxPlanar.fillStyle = 'rgba(255, 0, 0, .5)';
            shift_canvas(ctxPlanar, canvasPlanar.width, canvasPlanar.height, -1, 0);

            if (leapData.pointables && leapData.pointables.length === 1) {
                var pointable = leapData.pointables[0];

                //if(attr.prop === '1')$log.info(pointable.tipVelocity[ attr.prop ])

                var pos = pointable.tipVelocity[ attr.prop ];
                ctxPlanar.fillRect(canvasPlanar.width - 1, canvasPlanar.height / 2, 1, 1);
                ctxPlanar.fillRect(canvasPlanar.width - 1, canvasPlanar.height / 2, 1, -y(pos));
            }

        };

        $rootScope.$on('leapData', function (e, leapData) {
            renderPointablesPlanar(leapData);
        });

    }

    return {
        replace: true,
        templateUrl: 'templates/leap-graph.html',
        scope: {},
        restrict: 'E',
        link: link
    }
});


directives.utils.Locator = function () {

    var timeBegan;

    var getHypot = function (pointerPos, elemPos) {
        var x = pointerPos.x - elemPos.centerX;
        var y = pointerPos.y - elemPos.centerY;
        return  Math.sqrt(x * x + y * y);
    }

    var inPerimeter = function (pointerPos, elemPos) {
        var v = false;

        if ((pointerPos.x > elemPos.x && pointerPos.x < elemPos.x + elemPos.w) &&
            (pointerPos.y > elemPos.y && pointerPos.y < elemPos.y + elemPos.h)) {
            v = true;
        }

        return v
    }

    this.getIsHot = function (leapData, css, scope, elem) {

        timeBegan = (timeBegan) ? timeBegan : leapData.timestamp;

        var isHot = false;
        var elemPos = directives.utils.getPos(elem);

        if (leapData.pointables && leapData.pointables.length > 0) {

            var leapX = leapData.pointables[0].tipPosition[0];
            var leapY = leapData.pointables[0].tipPosition[1];

            var pointerPos = directives.utils.getPointerPos(leapX, leapY);
            var hypot = getHypot(pointerPos, elemPos);

            if (hypot < 50 || inPerimeter(pointerPos, elemPos)) {

                if (leapData.timestamp - timeBegan > 200000) {
                    isHot = true;
                    elem.addClass(css);
                    scope.$digest();
                }

            } else {
                timeBegan = undefined;
                elem.removeClass(css);
                isHot = false;
                scope.$digest();
            }
        }
        return isHot;
    }
};

directives.utils.getPos = function (elem) {

    var h = elem.innerHeight();
    var w = elem.innerWidth();
//    var x = elem.prop('offsetLeft');
//    var y = elem.prop('offsetTop');
//    var pos = getOffset(elem[0]);
    var pos = $(elem[0]).getPos();

    var x = pos.left;
    var y = pos.top;

    return {
        centerX: x + w / 2,
        centerY: y + h / 2,
        x: x,
        y: y,
        w: w,
        h: h
    };
}

directives.utils.getPointerPos = function (leapX, leapY) {
    return {x: (leapX * 5) + window.innerWidth / 2, y: window.innerHeight - ((leapY * 5) - window.innerHeight / 2) };
}


function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

jQuery.fn.getPos = function () {
    var o = this[0];
    var left = 0, top = 0, parentNode = null, offsetParent = null;
    offsetParent = o.offsetParent;
    var original = o;
    var el = o;
    while (el.parentNode != null) {
        el = el.parentNode;
        if (el.offsetParent != null) {
            var considerScroll = true;
            if (window.opera) {
                if (el == original.parentNode || el.nodeName == "TR") {
                    considerScroll = false;
                }
            }
            if (considerScroll) {
                if (el.scrollTop && el.scrollTop > 0) {
                    top -= el.scrollTop;
                }
                if (el.scrollLeft && el.scrollLeft > 0) {
                    left -= el.scrollLeft;
                }
            }
        }
        if (el == offsetParent) {
            left += o.offsetLeft;
            if (el.clientLeft && el.nodeName != "TABLE") {
                left += el.clientLeft;
            }
            top += o.offsetTop;
            if (el.clientTop && el.nodeName != "TABLE") {
                top += el.clientTop;
            }
            o = el;
            if (o.offsetParent == null) {
                if (o.offsetLeft) {
                    left += o.offsetLeft;
                }
                if (o.offsetTop) {
                    top += o.offsetTop;
                }
            }
            offsetParent = o.offsetParent;
        }
    }
    return {
        left: left,
        top: top
    };
};

var VISIBILITY = (function () {
    /**
     * Checks if a DOM element is visible. Takes into
     * consideration its parents and overflow.
     *
     * @param (el) the DOM element to check if is visible
     *
     * These params are optional that are sent in recursively,
     * you typically won't use these:
     *
     * @param (t) Top corner position number
     * @param (r) Right corner position number
     * @param (b) Bottom corner position number
     * @param (l) Left corner position number
     * @param (w) Element width number
     * @param (h) Element height number
     */
    function _isVisible(el, t, r, b, l, w, h) {
        var p = el.parentNode,
            VISIBLE_PADDING = 2;

//-- Return true for document node
        if (9 === p.nodeType) {
            return true;
        }

//-- Return false if our element is invisible
        if (
            '0' === _getStyle(el, 'opacity') ||
                'none' === _getStyle(el, 'display') ||
                'hidden' === _getStyle(el, 'visibility')
            ) {
            return false;
        }
        if (
            'undefined' === typeof(t) ||
                'undefined' === typeof(r) ||
                'undefined' === typeof(b) ||
                'undefined' === typeof(l) ||
                'undefined' === typeof(w) ||
                'undefined' === typeof(h)
            ) {
            t = el.offsetTop;
            l = el.offsetLeft;
            b = t + el.offsetHeight;
            r = l + el.offsetWidth;
            w = el.offsetWidth;
            h = el.offsetHeight;
        }
//-- If we have a parent, let's continue:
        if (p) {
            //console.log(_getStyle(p, 'overflow'), el.offsetParent === p);
//-- Check if the parent can hide its children. Also, only check offset parents.
            if (('hidden' === _getStyle(p, 'overflow') || 'scroll' === _getStyle(p, 'overflow')) && el.offsetParent === p) {
//-- Only check if the offset is different for the parent
                if (
//-- If the target element is to the right of the parent elm
                    l + VISIBLE_PADDING > p.offsetWidth + p.scrollLeft ||
//-- If the target element is to the left of the parent elm
                    l + w - VISIBLE_PADDING < p.scrollLeft ||
//-- If the target element is under the parent elm
                    t + VISIBLE_PADDING > p.offsetHeight + p.scrollTop ||
//-- If the target element is above the parent elm
                    t + h - VISIBLE_PADDING < p.scrollTop
                    ) {
//-- Our target element is out of bounds:
                    return false;
                }
            }
//-- Add the offset parent's left/top coords to our element's offset:
            if (el.offsetParent === p) {
                l += p.offsetLeft;
                t += p.offsetTop;
            }
//-- Let's recursively check upwards:
            return _isVisible(p, t, r, b, l, w, h);
        }
        return true;
    }

//-- Cross browser method to get style properties:
    function _getStyle(el, property) {

        if (window.getComputedStyle) {
            return document.defaultView.getComputedStyle(el)[property];
        }
        if (el.currentStyle) {
            return el.currentStyle[property];
        }
    }

    return {
        'getStyle': _getStyle,
        'isVisible': _isVisible
    }

})();