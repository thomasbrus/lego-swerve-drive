# $ pybricksdev run ble swerve_hub_front.py --name "Technic Hub A" --no-wait
from pybricks.hubs import TechnicHub
from pybricks.parameters import Axis, Port, Direction
from swerve import SwerveDriveMotor, SwerveTurningMotor, SwerveModule
from swerve_loop import swerve_loop

hub = TechnicHub(top_side=-Axis.Z, front_side=Axis.X)
hub.imu.reset_heading(hub.imu.heading())

left_drive_motor = SwerveDriveMotor(Port.B)
left_turning_motor = SwerveTurningMotor(Port.D, positive_direction=Direction.COUNTERCLOCKWISE)

right_drive_motor = SwerveDriveMotor(Port.A, positive_direction=Direction.COUNTERCLOCKWISE)
right_turning_motor = SwerveTurningMotor(Port.C, positive_direction=Direction.COUNTERCLOCKWISE)

left_swerve_module = SwerveModule(left_drive_motor, left_turning_motor)
right_swerve_module = SwerveModule(right_drive_motor, right_turning_motor)


def apply_swerve_module_states(module_states):
    SwerveModule.set_desired_states([left_swerve_module, right_swerve_module], [module_states[2], module_states[3]], wait=False)


try:
    swerve_loop(hub, callback=apply_swerve_module_states)
finally:
    left_swerve_module.terminate()
    right_swerve_module.terminate()
