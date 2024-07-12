# $ pybricksdev run ble front_hub.py --name "Technic Hub A" --no-wait
from pybricks.parameters import Port
from usys import stdin, stdout
from swerve import SwerveDriveMotor, SwerveTurningMotor, SwerveModuleState, SwerveModule

left_drive_motor = SwerveDriveMotor(Port.A)
left_turning_motor = SwerveTurningMotor(Port.B)

right_drive_motor = SwerveDriveMotor(Port.C)
right_turning_motor = SwerveTurningMotor(Port.D)

left_swerve_module = SwerveModule(left_drive_motor, left_turning_motor)
right_swerve_module = SwerveModule(right_drive_motor, right_turning_motor)

try:
    while True:
        speed_left, angle_left, speed_right, angle_right = stdin.readline().strip().split(",")

        desired_left_state = SwerveModuleState(speed=int(speed_left), angle=int(angle_left))
        desired_right_state = SwerveModuleState(speed=int(speed_right), angle=int(angle_right))

        left_swerve_module.set_desired_state(desired_left_state, wait=False)
        right_swerve_module.set_desired_state(desired_right_state, wait=False)

        stdout.buffer.write(b"ack")

except Exception as e:
    stdout.write(str(e))
    raise e

finally:
    left_swerve_module.terminate()
    right_swerve_module.terminate()
