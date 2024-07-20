# $ pybricksdev run ble swerve_hub_rear.py --name "Technic Hub A" --no-wait
from pybricks.hubs import TechnicHub
from pybricks.parameters import Axis, Port, Direction
from swerve import SwerveDriveMotor, SwerveTurningMotor, SwerveModule
from swerve_loop import swerve_loop

hub = TechnicHub(top_side=-Axis.Z, front_side=-Axis.X)
hub.imu.reset_heading(hub.imu.heading())

left_drive_motor = SwerveDriveMotor(Port.A)
left_turning_motor = SwerveTurningMotor(Port.C, positive_direction=Direction.COUNTERCLOCKWISE)

right_drive_motor = SwerveDriveMotor(Port.B, positive_direction=Direction.COUNTERCLOCKWISE)
right_turning_motor = SwerveTurningMotor(Port.D, positive_direction=Direction.COUNTERCLOCKWISE)

left_swerve_module = SwerveModule(left_drive_motor, left_turning_motor, index=2)
right_swerve_module = SwerveModule(right_drive_motor, right_turning_motor, index=3)

try:
    swerve_loop(hub, [left_swerve_module, right_swerve_module])
finally:
    left_swerve_module.terminate()
    right_swerve_module.terminate()
