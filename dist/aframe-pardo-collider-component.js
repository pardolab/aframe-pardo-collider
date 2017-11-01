'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ColliderComponent = function () {
    function ColliderComponent() {
        _classCallCheck(this, ColliderComponent);

        this.collidingElements = new Map();
        this.meshMap = new Map();
        this.collidableRef = ".collidable";
        this.aframe();
    }

    _createClass(ColliderComponent, [{
        key: 'aframe',
        value: function aframe() {
            var __this = this;
            AFRAME.registerComponent('collider', {
                schema: {},
                init: function init() {
                    window.setTimeout(this.initialize.bind(this), 1000);
                },
                initialize: function initialize() {
                    var _this = this;

                    var id = this.el.object3D.uuid;
                    this.collideCheck = {
                        isColliding: false
                    };
                    __this.meshMap.set(id, Object.keys(this.el.object3DMap));
                    __this.addElementToCollidingList(this.el, id);
                    __this.generateBoundingBox(this.el, id);
                    this.el.addEventListener('componentchanged', function (evt) {
                        if (evt.detail.name !== 'position') return;
                        var intersected = __this.intersectedElements(_this.el, id);
                        if (!intersected || intersected == null) return;
                        if (!_this.collideCheck.isColliding && intersected.intersectedElements.length > 0) {
                            _this.collideCheck.isColliding = true;
                            _this.collideCheck.collisionResults = intersected;
                            __this.startColliding(intersected);
                        } else if (_this.collideCheck.isColliding && intersected.intersectedElements.length === 0) {
                            _this.collideCheck.isColliding = false;
                            __this.endColliding(_this.collideCheck.collisionResults);
                            _this.collideCheck.collisionResults = undefined;
                        }
                    });
                }
            });
        }
    }, {
        key: 'addElementToCollidingList',
        value: function addElementToCollidingList(el, id) {
            var _this2 = this;

            var meshMap = this.meshMap.get(id);
            var collidedElements = new Array();
            meshMap.forEach(function (mesh) {
                var obj3d = el.getObject3D(mesh);
                obj3d.vertices = _this2.calculateVertices(el, mesh);
                collidedElements.push({
                    element: el,
                    mesh: mesh,
                    vertices: obj3d.vertices
                });
            });
            this.collidingElements.set(id, collidedElements);
        }
    }, {
        key: 'generateBoundingBox',
        value: function generateBoundingBox(el, id) {
            var meshes = this.meshMap.get(id);
            meshes.forEach(function (mesh) {
                var obj = el.getObject3D(mesh);
                var bb = new THREE.Box3().setFromPoints(obj.vertices);
                obj.geometry.boundingBox = bb;
            });
        }
    }, {
        key: 'calculateVertices',
        value: function calculateVertices(el, mesh) {
            var elOrigin = el.parentElement.getAttribute('position');
            var obj = el.getObject3D(mesh);
            var rawVertices = obj.geometry.attributes.position.array;
            var vertices = new Array();
            for (var i = 0; i < rawVertices.length; i++) {
                var x = rawVertices[i * 3 + 0];
                var y = rawVertices[i * 3 + 1];
                var z = rawVertices[i * 3 + 2];
                var vector3 = new THREE.Vector3(x, y, z);
                vertices.push(vector3);
            }
            return vertices;
        }
    }, {
        key: 'intersectedElements',
        value: function intersectedElements(el, id) {
            var hasIntersected = false;
            var intersectedEntities = new Array();
            var getOtherElements = this.getOtherElements(el, id);
            this.meshMap.get(id).forEach(function (mesh) {
                var elBoundingBox = el.getObject3D(mesh).geometry.boundingBox;
                if (!elBoundingBox) {
                    console.log("No Bounding Box found");
                    return;
                }
                ;
                var globalPosition = el.getObject3D(mesh).matrixWorld;
                var globalElBoundingBox = elBoundingBox.clone().applyMatrix4(globalPosition);
                getOtherElements.forEach(function (elem) {
                    var obj = elem.element.getObject3D(elem.mesh);
                    var elemBoundingBox = obj.geometry.boundingBox;
                    var globalElemPosition = obj.matrixWorld;
                    var globalElemBoundingBox = elemBoundingBox.clone().applyMatrix4(globalElemPosition);
                    hasIntersected = globalElBoundingBox.intersectsBox(globalElemBoundingBox) ? true : hasIntersected;
                    if (hasIntersected) intersectedEntities.push(elem.element);
                });
            });
            return {
                "intersectedElements": intersectedEntities,
                "collidingElement": hasIntersected ? el : ''
            };
        }
    }, {
        key: 'getOtherElements',
        value: function getOtherElements(el, id) {
            var otherElements = new Array();
            this.collidingElements.forEach(function (value, key, map) {
                if (key === id) return;
                otherElements.push.apply(otherElements, _toConsumableArray(value));
            });
            return otherElements;
        }
    }, {
        key: 'startColliding',
        value: function startColliding(collisionResults) {
            this.emitCollide('collideStart', collisionResults);
            console.log("started colliding");
        }
    }, {
        key: 'endColliding',
        value: function endColliding(collisionResults) {
            this.emitCollide('collideEnd', collisionResults);
        }
    }, {
        key: 'emitCollide',
        value: function emitCollide(evtName, details) {
            details.intersectedElements.forEach(function (intersect) {
                intersect.emit(evtName, details);
            });
            details.collidingElement.emit(evtName, details);
        }
    }]);

    return ColliderComponent;
}();