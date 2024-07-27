from pybricks.parameters import Color, Button
from utils import vector_rotate, vector_distance, vector_angle


class SteeringMode:
    def should_wait(self):
        return False

    def drive_base_center(self):
        return 0, 0

    def drive_base_velocity(self, controller, heading):
        return 0, 0, 0

    def hub_color(self, vx, vy):
        green_hue = 120
        hue = vector_angle(vector_rotate((vx, vy), green_hue))
        value = min(100, vector_distance((vx, vy)))
        return Color(h=hue, s=100, v=value)


class AckermannSteeringMode(SteeringMode):
    def drive_base_center(self):
        return 0, 0

    def drive_base_velocity(self, controller, heading):
        left, right = controller.triggers()
        x1, y1 = controller.joystick_left()

        vx = 0
        vy = right - left
        omega = -x1 * 0.2 * (abs(vy) / 100)

        return vx, vy, omega

    def acceleration(self):
        return 1500


class TankSteeringMode(SteeringMode):
    def drive_base_center(self):
        return 0, 0

    def drive_base_velocity(self, controller, heading):
        left, right = controller.triggers()
        x1, y1 = controller.joystick_left()

        vx = 0
        vy = right - left
        omega = -x1 * 0.2

        return vx, vy, omega

    def acceleration(self):
        return 1000


class CrabSteeringMode(SteeringMode):
    def __init__(self):
        self.up_toggled = False
        self.down_toggled = False
        self.left_toggled = False
        self.right_toggled = False

    def should_wait(self):
        return True

    def drive_base_velocity(self, controller, heading):
        pressed_buttons = controller.buttons.pressed()

        if Button.UP in pressed_buttons:
            self.up_toggled = not self.up_toggled

        if Button.DOWN in pressed_buttons:
            self.down_toggled = not self.down_toggled

        if Button.LEFT in pressed_buttons:
            self.left_toggled = not self.left_toggled

        if Button.RIGHT in pressed_buttons:
            self.right_toggled = not self.right_toggled

        vx = (-100 if self.left_toggld else 0) + (100 if self.right_toggled else 0)
        vy = (100 if self.up_toggled else 0) + (-100 if self.down_toggled else 0)
        omega = 0

        return vx, vy, omega

    def acceleration(self):
        return 4000


class SwerveSteeringMode(SteeringMode):
    TURN_FACTOR = 0.5

    def drive_base_velocity(self, controller, heading):
        x1, y1 = controller.joystick_left()
        x2, y2 = controller.joystick_right()

        vx, vy = vector_rotate((x1, y1), -heading())
        omega = -x2 * self.TURN_FACTOR

        return vx, vy, omega

    def acceleration(self):
        return 3000
