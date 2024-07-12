from pybricks.pupdevices import Motor
from pybricks.parameters import Direction, Port
from umath import cos
from utils import percentage_to_speed, degrees_to_radians


class SwerveTurningMotor(Motor):
    def __init__(self, port: Port, **kwargs) -> None:
        turning_settings = dict(gears=[[20, 60]], profile=5)
        super().__init__(port, **turning_settings, **kwargs)

        turning_limits = dict(acceleration=4000)
        self.control.limits(**turning_limits)


class SwerveDriveMotor(Motor):
    def __init__(self, port: Port, **kwargs) -> None:
        drive_settings = dict(profile=360)
        super().__init__(port, **drive_settings, **kwargs)

        drive_limits = dict(acceleration=1000)
        self.control.limits(**drive_limits)


class SwerveModuleState:
    MAX_SPEED = 390 / 360 * 1000

    def __init__(self, speed: float, angle: float) -> None:
        self.speed = speed
        self.angle = angle

    @classmethod
    def optimize(cls, desired_state, current_angle):
        delta = desired_state.angle - current_angle
        optimized_angle = desired_state.angle + 180 if abs(delta) > 90 else desired_state.angle
        optimized_speed = -optimized_speed if abs(delta) > 90 else optimized_speed
        optimized_speed = desired_state.speed * cos(degrees_to_radians(optimized_angle - current_angle))

        return SwerveModuleState(speed=optimized_speed, angle=optimized_angle)


class SwerveModule:
    def __init__(self, drive_motor: Motor, turning_motor: Motor) -> None:
        self.drive_motor = drive_motor
        self.turning_motor = turning_motor
        self.turning_motor.reset_angle(self.turning_motor.angle())

    def set_desired_state(self, desired_state: SwerveModuleState, wait=False) -> None:
        turning_motor_angle = self.turning_motor.angle()
        optimized_state = SwerveModuleState.optimize(desired_state, self.turning_motor.angle())
        drive_speed = optimized_state.speed * cos(degrees_to_radians(optimized_state.angle - turning_motor_angle))

        self.drive_motor.run(percentage_to_speed(drive_speed))
        self.turning_motor.run_target(rotation_angle=optimized_state.angle, speed=percentage_to_speed(100), wait=wait)

    def terminate(self):
        terminal_state = SwerveModuleState(speed=0, angle=0)
        self.set_desired_state(terminal_state, wait=True)
