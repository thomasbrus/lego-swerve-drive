# $ pybricksdev run ble two_wheel_hub.py --name "Technic Hub B" --no-wait
from pybricks.hubs import TechnicHub
from pybricks.parameters import Axis, Port, Direction, Button
from pybricks.tools import wait
from swerve import SwerveDriveMotor, SwerveTurningMotor, SwerveModule, SwerveDriveKinematics
from pybricks.iodevices import XboxController
from steering_modes import AckermannSteeringMode, TankSteeringMode, CrabSteeringMode, SwerveSteeringMode

import controller_examples

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
        return controller_examples.tank_straight_line_and_turn_example()
    else:
        return XboxController()


controller = get_controller(simulated=True)


try:
    steering_mode = AckermannSteeringMode()

    while True:
        pressed_buttons = controller.buttons.pressed()

        if Button.GUIDE in pressed_buttons:
            print("Exiting program.")
            break
        elif Button.A in pressed_buttons:
            print("Switching to Ackermann steering mode.")
            steering_mode = AckermannSteeringMode()
        elif Button.B in pressed_buttons:
            print("Switching to Tank steering mode.")
            steering_mode = TankSteeringMode()
        elif Button.X in pressed_buttons:
            print("Switching to Crab steering mode.")
            steering_mode = CrabSteeringMode()
        elif Button.Y in pressed_buttons:
            print("Switching to Swerve steering mode.")
            steering_mode = SwerveSteeringMode()

        if Button.A in pressed_buttons or Button.B in pressed_buttons or Button.X in pressed_buttons or Button.Y in pressed_buttons:
            left_drive_motor.acceleration(steering_mode.acceleration())
            right_drive_motor.acceleration(steering_mode.acceleration())

        should_wait = steering_mode.should_wait()
        drive_base_center = steering_mode.drive_base_center()
        drive_base_velocity = steering_mode.drive_base_velocity(controller, heading=hub.imu.heading())

        hub_color = steering_mode.hub_color(drive_base_velocity[0], drive_base_velocity[1])
        hub.light.on(hub_color)

        module_states = kinematics.to_swerve_module_states(drive_base_velocity, drive_base_center)

        SwerveDriveKinematics.normalize_module_states(module_states)
        SwerveModule.set_desired_states(swerve_modules, module_states, wait=should_wait)

        wait(25)


finally:
    left_swerve_module.terminate()
    right_swerve_module.terminate()
