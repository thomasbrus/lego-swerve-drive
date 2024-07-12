import { Vector2, Vector3 } from "./vector";

// Returns the vector of a swerve drive wheel given the drive base velocity vector.
// - vx: Velocity in the x direction
// - vy: Velocity in the y direction
// - omega: Angular velocity
// - rx: x coordinate of the wheel relative to the center
// - ry: y coordinate of the wheel relative to the center
export function swerveDrive(vx: number, vy: number, omega: number, rx: number, ry: number) {
  const velocityVector = new Vector3(vx, vy, omega);
  const omegaVector = new Vector3(0, 0, omega);
  const positionVector = new Vector3(rx, ry, 0);

  return velocityVector.add(omegaVector.cross(positionVector));
}

export function normalizeSwerveSpeed(speed: number) {
  const maxSpeed = new Vector2(100, 100).length();
  return (speed / maxSpeed) * 100;
}
