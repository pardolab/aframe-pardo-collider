interface CollisionResults {
  intersectedElements: AFrame.Entity[];
  collidingElement: AFrame.Entity;
}

interface CollidingCheck {
  isColliding: boolean;
  collisionResults: CollisionResults;
}
 
interface CollidedElement{
  element : AFrame.Entity;
  mesh : string;
  vertices : THREE.Vector3[]; 
}
