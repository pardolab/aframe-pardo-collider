/// <reference path="../typings/index.d.ts" />

interface CollisionResults {
    intersectedElements: AFrame.Entity[],
    collidingElement: AFrame.Entity
  }
  
  interface CollidingCheck {
    isColliding: boolean,
    collisionResults: CollisionResults
  }
  
  /**
   * Creates a class that will check for the colliders.
   * Since this is a class, it will share the same reference
   * of the properties to other components. In this case,
   * this is what we want. 
   * 
   * To better understand what's going on I had to read:
   * http://www.tomdalling.com/blog/modern-opengl/explaining-homogenous-coordinates-and-projective-geometry/
   * 
   * And
   * http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/
   * 
   * It's not that long to read 
   * (Spare about an hour or so, it's going to be worh it.)
   *  
   * If you don't know about homogeneous coordinates:
   * http://deltaorange.com/2012/03/08/the-truth-behind-homogenous-coordinates/
   * 
   * Vector Normalization:
   * Creates a vector whose magnitud is 1. 
   * https://threejs.org/docs/#api/math/Vector3 
   * 
   * Matrix 4:
   * https://threejs.org/docs/#api/math/Matrix4
   * 
   * Matrix 3:
   * https://threejs.org/docs/#api/math/Matrix3 
   * 
   * Note the collideStart, collideEnd events are limited
   * and are really simple. If an element keeps colliding
   * with multiple objects without stopping the collide,
   * 
   * The collideEnd will never fire. This will be solved
   * in future releases.  
   */
  class ColliderComponent {
  
    //Holds the reference of all the colliding elements.
    collidingElements: Map<string, CollidedElement[]>
    // Used for checking with other collidable elements. 
    collidableRef: string
    meshMap: Map<string, string[]>;
    constructor() {
      this.collidingElements = new Map<string, CollidedElement[]>();
      this.meshMap = new Map<string, string[]>();
      this.collidableRef = ".collidable";
      this.aframe();
    }
  
  
    //Registers the AFRAME component.
    aframe() {
      const __this = this;
      AFRAME.registerComponent('collider', {
        schema: {
          /*
          * TODO:
          * true => Checks for collision with every other object
          * false => (Default) Checks for collision with other collidables. 
          */
          // %%%%%%%collidesAll: { type: 'boolean', default: false }
        },
        init: function () {
          // TO DO:
          // debugger;
          // console.log("Element's attribute are")
          // for (var i = 0; i < this.el.attributes; i++) {
          //   if (this.el.attributes[i].key in AFRAME.components) {
          //     // Wait for all to load (e.g., count them up and increment a counter or Promise.all).
          //   }
          // }  
          
          window.setTimeout(this.initialize.bind(this), 1000);
        },
  
        initialize: function () {
  
          const id: string = this.el.object3D.uuid;
          this.collideCheck = {
            isColliding: false,
          };
          // Since the object can have multiple meshes, besides "mesh"
          // we'll have a list which we'll iterate through
          __this.meshMap.set(id, Object.keys(this.el.object3DMap));
  
          __this.addElementToCollidingList(this.el, id);
          __this.generateBoundingBox(this.el, id);
          // Checks if the element has its position changed.
          this.el.addEventListener('componentchanged', evt => {
            if (evt.detail.name !== 'position') return;
            let intersected = __this.intersectedElements(this.el, id);
            if (!intersected || intersected == null) return;
            if (!this.collideCheck.isColliding && intersected.intersectedElements.length > 0) {
              this.collideCheck.isColliding = true;
              this.collideCheck.collisionResults = intersected;
              __this.startColliding(intersected);
            }
            else if (this.collideCheck.isColliding && intersected.intersectedElements.length === 0) {
              this.collideCheck.isColliding = false;
              __this.endColliding(this.collideCheck.collisionResults);
              // https://stackoverflow.com/questions/208105/how-do-i-remove-a-property-from-a-javascript-object
              this.collideCheck.collisionResults = undefined;
            }
          });
        }
  
      });
    }
  
    addElementToCollidingList(el: AFrame.Entity, id: string) {
  
      // Iterates over each mesh and adds the vertices.
      let meshMap = this.meshMap.get(id);
      let collidedElements = new Array<CollidedElement>();
      meshMap.forEach(mesh => {
        let obj3d = el.getObject3D(mesh) as any;
        obj3d.vertices = this.calculateVertices(el, mesh);
        collidedElements.push(
          {
            element: el,
            mesh: mesh,
            vertices: obj3d.vertices
          }
        );
      })
      this.collidingElements.set(id, collidedElements);
    }
  
    generateBoundingBox(el: AFrame.Entity, id: string) {
      let meshes = this.meshMap.get(id);
  
      meshes.forEach(mesh => {
        let obj = el.getObject3D(mesh);
        //let bb = new THREE.Box3().setFromObject(obj);
        let bb = new THREE.Box3().setFromPoints((obj as any).vertices);
        (obj as any).geometry.boundingBox = bb;
      });
    }
  
    /* 
    * A-Frames the elements in BufferGeometry.
    * According to https://stackoverflow.com/a/35372430/1057052
    * BufferGeoemtry generates the vertices in groups of three. 
    * We need to generate a Vector3 for each of this group of 
    * vertices. %
    * 
    * @param el The AFrame element using this.el
    */
  
    calculateVertices(el: AFrame.Entity, mesh: string): THREE.Vector3[] {
      const elOrigin = el.parentElement.getAttribute('position');
      const obj = el.getObject3D(mesh) as any;
      /**
      * This is where the BufferGeometry from A-Frame has the
      * list of the vertices
      **/
      const rawVertices = obj.geometry.attributes.position.array;
  
      let vertices: THREE.Vector3[] = new Array();
  
      // Iterates in pair of 3 and appends it to the vertices list.
      for (let i = 0; i < rawVertices.length; i++) {
        let x = rawVertices[i * 3 + 0];
        let y = rawVertices[i * 3 + 1];
        let z = rawVertices[i * 3 + 2];
        let vector3 = new THREE.Vector3(x, y, z);
        vertices.push(vector3);
      }
  
      return vertices;
    }
  
    intersectedElements(el, id: string): CollisionResults {
      let hasIntersected = false;
      let intersectedEntities: AFrame.Entity[] = new Array();
  
      let getOtherElements = this.getOtherElements(el, id);
  
      this.meshMap.get(id).forEach(mesh => {
        let elBoundingBox = el.getObject3D(mesh).geometry.boundingBox;
        if (!elBoundingBox) { console.log("No Bounding Box found"); return };
        let globalPosition = el.getObject3D(mesh).matrixWorld;
        let globalElBoundingBox = elBoundingBox.clone().applyMatrix4(globalPosition);
  
        getOtherElements.forEach((elem) => {
          let obj = elem.element.getObject3D(elem.mesh) as any;
          let elemBoundingBox = obj.geometry.boundingBox;
          let globalElemPosition = obj.matrixWorld;
          let globalElemBoundingBox = elemBoundingBox.clone().applyMatrix4(globalElemPosition);
          hasIntersected = globalElBoundingBox.intersectsBox(globalElemBoundingBox) ? true : hasIntersected;
  
          if (hasIntersected) intersectedEntities.push(elem.element);
  
        })
      })
  
  
      return {
        "intersectedElements": intersectedEntities,
        "collidingElement": hasIntersected ? el : ''
      }
    }
  
  
    /**
     * Gets the list of collided elements except
     * for the current element
     * @param el The current AFrame element.
     */
    getOtherElements(el, id: string): CollidedElement[] {
      // Each element has a mesh id. We use it to compare elements.
  
      let otherElements = new Array<CollidedElement>();
  
      // We return a new array, containing all the elements except
      // the current one.
      this.collidingElements.forEach((value, key, map) => {
        if (key === id) return;
        // Flattens the array:
        otherElements.push(...value);
      });
      return otherElements;
    }
  
    startColliding(collisionResults: CollisionResults) {
      this.emitCollide('collideStart', collisionResults);
      console.log("started colliding");
    }
  
    endColliding(collisionResults: CollisionResults) {
      this.emitCollide('collideEnd', collisionResults)
    }
  
    emitCollide(evtName: string, details: CollisionResults) {
      details.intersectedElements.forEach(intersect => {
        intersect.emit(evtName, details);
      });
      details.collidingElement.emit(evtName, details);
    }
  
  
  
  }
  