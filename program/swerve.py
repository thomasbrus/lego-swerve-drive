from pybricks.pupdevices import Motor
from pybricks.parameters import Port, Direction
from umath import cos, radians
from utils import percentage_to_speed, vector_distance, vector_angle
from pybricks.tools import vector, cross


class SwerveTurningMotor(Motor):
    def __init__(self, port: Port, positive_direction=Direction.CLOCKWISE) -> None:
        super().__init__(port, positive_direction, [[20, 60]], True, 5)

        turning_limits = dict(acceleration=2000)
        self.control.limits(**turning_limits)
        self.reset_angle(self.angle())


class SwerveDriveMotor(Motor):
    def __init__(self, port: Port, positive_direction=Direction.CLOCKWISE) -> None:
        super().__init__(port, positive_direction, None, True, 360)

        drive_limits = dict(acceleration=1000)
        self.control.limits(**drive_limits)


class SwerveModuleState:
    MAX_SPEED = 390 / 360 * 1000

    def __init__(self, speed: float, angle: float) -> None:
        self.speed = speed
        self.angle = angle

    @classmethod
    def optimized(cls, desired_state, current_angle):
        angle_difference = desired_state.angle - current_angle

        # Adjust the angle difference to be within the range [-180, 180] degrees.
        if angle_difference > 180:
            angle_difference -= 360
        elif angle_difference < -180:
            angle_difference += 360

        optimized_speed = desired_state.speed

        # Determine the rotation direction and speed.
        if abs(angle_difference) > 90:
            # Rotate in the opposite direction if the shortest path is more than 90 degrees.
            angle_difference = angle_difference - 180 if angle_difference > 0 else angle_difference + 180
            optimized_speed = -desired_state.speed

        optimized_angle = current_angle + angle_difference
        optimized_speed = optimized_speed * cos(radians(optimized_angle - current_angle))

        return SwerveModuleState(speed=optimized_speed, angle=optimized_angle)


class SwerveModule:
    def __init__(self, drive_motor: Motor, turning_motor: Motor) -> None:
        self.drive_motor = drive_motor
        self.turning_motor = turning_motor

    def set_desired_state(self, desired_state: SwerveModuleState, wait=False) -> None:
        optimized_state = SwerveModuleState.optimized(desired_state, self.turning_motor.angle())
        turning_speed = percentage_to_speed(desired_state.speed / 4)
        self.drive_motor.run(percentage_to_speed(optimized_state.speed))
        self.turning_motor.run_target(target_angle=optimized_state.angle, speed=turning_speed, wait=wait)

    def terminate(self):
        self.drive_motor.stop()
        self.turning_motor.run_target(target_angle=0, speed=percentage_to_speed(100), wait=True)


class SwerveDriveKinematics:
    def __init__(self, swerve_module_positions) -> None:
        self.swerve_module_positions = swerve_module_positions

    def to_swerve_module_states(self, drive_base_velocity, drive_base_center) -> list:
        vx, vy, omega = drive_base_velocity
        cx, cy = drive_base_center
        velocity_vector = vector(vx, vy, omega)
        omega_vector = vector(0, 0, omega)

        module_states = []

        for rx, ry in self.swerve_module_positions:
            dx = rx - cx
            dy = ry - cy

            position_vector = vector(dx, dy, omega)

            swerve_vector = velocity_vector + cross(omega_vector, position_vector)

            speed = vector_distance(swerve_vector)
            angle = vector_angle(swerve_vector)

            module_states.append(SwerveModuleState(speed=speed, angle=angle))

        return module_states

    @classmethod
    def normalize_module_states(cls, moduleStates, attainable_max_speed=100):
        real_max_speed = 0

        for module_state in moduleStates:
            real_max_speed = max(real_max_speed, module_state.speed)

        if real_max_speed > attainable_max_speed:
            for module_state in moduleStates:
                module_state.speed = module_state.speed / real_max_speed * attainable_max_speed
