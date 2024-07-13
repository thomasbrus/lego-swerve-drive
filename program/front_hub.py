# $ pybricksdev run ble front_hub.py --name "Technic Hub A" --no-wait
from pybricks.parameters import Port
from usys import stdin, stdout
from swerve import SwerveDriveMotor, SwerveTurningMotor, SwerveModule, SwerveDriveKinematics

left_drive_motor = SwerveDriveMotor(Port.A)
left_turning_motor = SwerveTurningMotor(Port.B)

right_drive_motor = SwerveDriveMotor(Port.C)
right_turning_motor = SwerveTurningMotor(Port.D)

left_front_swerve_module = SwerveModule(left_drive_motor, left_turning_motor)
right_front_swerve_module = SwerveModule(right_drive_motor, right_turning_motor)

kinematics = SwerveDriveKinematics(
    swerve_module_positions=[
        (1, 1),  # Left front
        (1, -1),  # Left rear
        (-1, 1),  # Right front
        (-1, -1),  # Right rear
    ]
)

try:
    while True:
        x1, y1, x2, _ = stdin.readline().strip().split(",")
        drive_base_velocity = (int(x1), int(y1), int(x2))

        desired_left_front_state, desired_right_front_state, _, _ = kinematics.to_swerve_module_states(
            drive_base_velocity=drive_base_velocity, drive_base_center=(0, 0)
        )

        left_front_swerve_module.set_desired_state(desired_left_front_state, wait=False)
        right_front_swerve_module.set_desired_state(desired_right_front_state, wait=False)

        stdout.buffer.write(b"ack")

except Exception as e:
    stdout.write(str(e))
    raise e

finally:
    left_front_swerve_module.terminate()
    right_front_swerve_module.terminate()
