import { Vector } from "./vector";

// Returns the vector of a swerve drive wheel given the drive base velocity vector.
// - vx: Velocity in the x direction
// - vy: Velocity in the y direction
// - w: Angular velocity
// - rx: x coordinate of the wheel relative to the center
// - ry: y coordinate of the wheel relative to the center
export function swerveDrive(vx: number, vy: number, w: number, rx: number, ry: number) {
  const velocityVector = new Vector(vx, vy, w);
  const omegaVector = new Vector(0, 0, w);
  const positionVector = new Vector(rx, ry, 0);

  return velocityVector.add(omegaVector.cross(positionVector));
}
