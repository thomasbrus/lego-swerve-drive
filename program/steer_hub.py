# $ pybricksdev run ble steer_hub.py --name "Technic Hub A" --no-wait
from pybricks.parameters import Direction, Port
from pybricks.pupdevices import Motor
from usys import stdin, stdout

steer_settings = dict(gears=[[20, 60]], profile=5, positive_direction=Direction.CLOCKWISE)
steer_limits = dict(acceleration=4000)

fl_steer_motor = Motor(Port.D, **steer_settings)
fr_steer_motor = Motor(Port.C, **steer_settings)
bl_steer_motor = Motor(Port.B, **steer_settings)
br_steer_motor = Motor(Port.A, **steer_settings)

fl_steer_motor.control.limits(**steer_limits)
fr_steer_motor.control.limits(**steer_limits)
bl_steer_motor.control.limits(**steer_limits)
br_steer_motor.control.limits(**steer_limits)

steer_motors = [fl_steer_motor, fr_steer_motor, bl_steer_motor, br_steer_motor]


def setup_motors(motors):
    for motor in motors:
        motor.reset_angle(motor.angle())


def teardown_motors(motors):
    for motor in motors:
        set_steering_angle(motor, speed=360, target_angle=0)


def percentage_to_speed(percentage):
    max_speed = 390 / 360 * 1000
    return percentage / 100 * max_speed


def set_steering_angle(motor, target_angle, speed=percentage_to_speed(100), wait=True):
    """Turns the steering motor to a target angle while taking the shortest path."""
    current_angle = motor.angle()
    angle_difference = target_angle - current_angle

    if angle_difference > 180:
        angle_difference -= 360
    elif angle_difference < -180:
        angle_difference += 360

    motor.run_angle(speed=speed, rotation_angle=angle_difference, wait=wait)


setup_motors(steer_motors)


try:
    while True:
        angles = stdin.readline().strip().split(",")

        for i, angle in enumerate(angles):
            set_steering_angle(steer_motors[i], int(angle), speed=percentage_to_speed(100), wait=False)

except Exception as e:
    stdout.write(str(e))
    raise e

finally:
    teardown_motors(steer_motors)
