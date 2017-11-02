## aframe-pardo-collider-component

[![Version](http://img.shields.io/npm/v/aframe-pardo-collider-component.svg?style=flat-square)](https://npmjs.org/package/aframe-pardo-collider-component)
[![License](http://img.shields.io/npm/l/aframe-pardo-collider-component.svg?style=flat-square)](https://npmjs.org/package/aframe-pardo-collider-component)

<img src="./images/animation.gif" />

A simple collider for detecting when two objects or entities collide/clash with each other.

It uses Three JS' Box3. It calculates the bounding box of the element by passing the element's vertices. More on the [aframe-pardo-collider-component.ts] (./dist/aframe-pardo-collider-component.ts)

For [A-Frame](https://aframe.io).

### API
There are no properties to be used. Just assign the `collider` attribute on the entities you want to detect collision. Yes, you need to assign this to all the entities that are going to collide. **It's important** that you need to set it to an entity with an object3D already set. 

| Event | Description | Return Value |
| -------- | ----------- | ------------- |
|    collideStart     | Event fired from the entity that caused the collision.             |   Returns a `collisionResult` object which contains an array of all the elements intersected `intersectedElements` and the colliding object `collidingElement`. See the example for a better explanation.         |
|    collideEnd     | Event fired from the entity that was colliding. Note: This will only fire when the element stops intersecting another element.             |   Returns a `collisionResult` object which contains an array of all the elements intersected `intersectedElements` and the colliding object `collidingElement`. See the example for a better explanation.         |

### Installation


### Requirement
For this to work, the object that you assign this to **must have** an object 3D property. This means that  assigning it to an `<a-entity>` without any meshes will not work.


#### Browser

Install and use by directly including the [browser files](dist) and instantiating the class :

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.7.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-pardo-collider-component/dist/aframe-pardo-collider-component.min.js"></script>
  <script>// You must instantiate the Collider:
new ColliderComponent();
</script>
</head>

<body>
  <a-scene>
    <a-entity aframe-pardo-collider-component="foo: bar"></a-entity>
  </a-scene>
</body>
```

#### npm

Install via npm:

```bash
npm install aframe-pardo-collider-component
```

Then require and use.

```js
require('aframe');
require('aframe-pardo-collider-component');

// You must instantiate the Collider:
new ColliderComponent();

```


### Example
```html
<html>
<script src="https://aframe.io/releases/0.7.0/aframe.min.js"></script>
    <script src="../../dist/aframe-pardo-collider-component.js"></script>
    <script src="https://unpkg.com/aframe-environment-component@1.0.0/dist/aframe-environment-component.min.js"></script>
    <script>
        // IMPORTANT!!! You need to "new" the ColliderComponent. In addition, you must only call this once
        // in the entire application. We're open to feedback, so don't think it twice and give us a shot!
        // 
        var col = new ColliderComponent();
        console.log(col);
        document.addEventListener("DOMContentLoaded", () => {
            const box = document.getElementById('js-check-collide');
            const hiddenBox = document.getElementById('js-hidden-box');
            box.addEventListener('collideStart', () => {
                console.log("Collide has started");
                hiddenBox.emit('reveal')
            });

            box.addEventListener('collideEnd', () => {
              console.log("Element has finished collision");
            })
            const plane = document.getElementById('js-plane');
            plane.addEventListener('click', () => {
                box.emit('move');
            })
        })
    </script>
    <a-scene>
        <a-camera>
            <a-cursor></a-cursor>
        </a-camera>
        <a-box material="color: blue; transparent:true; opacity:0;" id="js-hidden-box" position="0 3 -2">
            <a-animation attribute="material.opacity" to="1" begin="reveal"></a-animation>
        </a-box>
        <!-- Here is where the collider is added -->
        <a-box material="color: brown;" position="-2 2 -2" collider></a-box>
        <a-box material="color: red;" position="2 2 -2" collider id="js-check-collide">
            <a-animation attribute="position" to="-1.1 2 -2" begin="move"></a-animation>
        </a-box>
        <!-- Above: Collider -->

        <a-plane width="2" height="1" color="#CCC" side="double" rotation="0 0 0" position="0 1 -4" id="js-plane">
            <a-text value="Click here to collide" align="center"></a-text>
        </a-plane>

    </a-scene>
</html>
```

### How it works: 
This may not be the most performant solution. It doesn't use raycaster, and it needs to add the `collider` component to each entity that you want to detect the collision. This means that if you have:
``` html
  <a-box collider></a-box>
  <a-box></a-box>
```

The collider will **not** trigger. They both need to have a collider:

``` html
  <a-box collider></a-box>
  <a-box collider></a-box>
```
Assisgning to an entity that doesn't have an object3D (Like a blank entity) will also cause problems:
``` html
  <a-entity collider></a-entity>
```

### Limitations: 

### About:
<a href="https://pardolab.com">Pardo Lab</a> 