# $ pybricksdev run ble two_wheel_hub.py --name "Technic Hub B" --no-wait
from pybricks.hubs import TechnicHub
from pybricks.parameters import Axis, Port, Direction, Button, Color
from pybricks.tools import wait
from swerve import SwerveDriveMotor, SwerveTurningMotor, SwerveModule, SwerveDriveKinematics
from pybricks.iodevices import XboxController
from controller_simulation import SimulatedController, Reading
from utils import vector_rotate, vector_angle, vector_distance
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
        return controller_examples.straight_line_example()
    else:
        return XboxController()


controller = get_controller(simulated=False)

try:

    def shift_center(center, dx, dy):
        return center[0] + dx, center[1] + dy

    def hub_color(vx, vy):
        hue = vector_angle((vx, vy))
        value = min(100, vector_distance((vx, vy)))
        return Color(h=hue, s=100, v=value)

    drive_base_center = (0, 0)
    turn_factor = 0.5
    field_oriented = True

    while True:
        pressed_buttons = controller.buttons.pressed()

        if Button.LEFT in pressed_buttons:
            drive_base_center = shift_center(drive_base_center, -0.5, 0)
        elif Button.RIGHT in pressed_buttons:
            drive_base_center = shift_center(drive_base_center, 0.5, 0)
        elif Button.UP in pressed_buttons:
            drive_base_center = shift_center(drive_base_center, 0, 0.5)
        elif Button.DOWN in pressed_buttons:
            drive_base_center = shift_center(drive_base_center, 0, -0.5)
        elif Button.LB in pressed_buttons:
            turn_factor = max(0.2, turn_factor - 0.1)
        elif Button.RB in pressed_buttons:
            turn_factor = min(1, turn_factor + 0.1)
        elif Button.A in pressed_buttons:
            field_oriented = True
        elif Button.B in pressed_buttons:
            break
        elif Button.X in pressed_buttons:
            field_oriented = False
        elif Button.Y in pressed_buttons:
            drive_base_center = (0, 0)
            turn_factor = 0.5

        x1, y1 = controller.joystick_left()
        x2, y2 = controller.joystick_right()

        vx, vy = vector_rotate((x1, y1), -hub.imu.heading()) if field_oriented else (x1, y1)
        omega = -x2 * turn_factor
        hub.light.on(hub_color(vx, vy))

        drive_base_velocity = (vx, vy, omega)
        module_states = kinematics.to_swerve_module_states(drive_base_velocity, drive_base_center)

        SwerveDriveKinematics.normalize_module_states(module_states)
        SwerveModule.set_desired_states(swerve_modules, module_states, wait=False)

        wait(25)


finally:
    left_swerve_module.terminate()
    right_swerve_module.terminate()
