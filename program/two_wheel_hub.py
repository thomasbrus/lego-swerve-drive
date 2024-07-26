# $ pybricksdev run ble two_wheel_hub.py --name "Technic Hub B" --no-wait
from pybricks.hubs import TechnicHub
from pybricks.parameters import Axis, Port, Direction, Button
from pybricks.tools import wait
from swerve import SwerveDriveMotor, SwerveTurningMotor, SwerveModule, SwerveDriveKinematics
from pybricks.iodevices import XboxController
from controller_simulation import SimulatedController, Reading
from utils import vector_rotate

hub = TechnicHub(front_side=-Axis.Y)
hub.imu.reset_heading(hub.imu.heading())

left_drive_motor = SwerveDriveMotor(Port.B, positive_direction=Direction.COUNTERCLOCKWISE)
left_turning_motor = SwerveTurningMotor(Port.D, positive_direction=Direction.COUNTERCLOCKWISE)

right_drive_motor = SwerveDriveMotor(Port.A)
right_turning_motor = SwerveTurningMotor(Port.C, positive_direction=Direction.COUNTERCLOCKWISE)

left_swerve_module = SwerveModule(left_drive_motor, left_turning_motor, index=0)
right_swerve_module = SwerveModule(right_drive_motor, right_turning_motor, index=1)

swerve_modules = [left_swerve_module, right_swerve_module]

kinematics = SwerveDriveKinematics(swerve_module_positions=[(-1, 0), (1, 0)])


def get_controller(simulated=False):
    if simulated:
        return SimulatedController(
            joystick_left_readings=[
                # Reading((0, 100), 2000),
                Reading((0, 0), 1000),
                # Reading((0, 0), 3000),
                # Reading((0, 0), 1000),
                Reading((0, 100), 1000),
            ],
            joystick_right_readings=[
                # Reading((0, 0), 2000),
                # Reading((0, 0), 1000),
                Reading((100, 0), 1000),
                Reading((0, 0), 1000),
                # Reading((0, 0), 3000),
            ],
            button_readings=[Reading([], 3000), Reading([Button.B], 0)],
        )
    else:
        return XboxController()


controller = get_controller(simulated=False)

try:
    while Button.B not in controller.buttons.pressed():
        x1, y1 = controller.joystick_left()
        x2, y2 = controller.joystick_right()

        angle = -hub.imu.heading() + 360 % 360
        x1, y1 = vector_rotate((x1, y1), -angle)

        drive_base_center = (0, 0)
        turn_factor = 0.5
        drive_base_velocity = (x1, y1, -x2 * turn_factor)
        module_states = kinematics.to_swerve_module_states(drive_base_velocity, drive_base_center)

        SwerveDriveKinematics.normalize_module_states(module_states)
        SwerveModule.set_desired_states(swerve_modules, module_states, wait=False)

        wait(25)


finally:
    left_swerve_module.terminate()
    right_swerve_module.terminate()
