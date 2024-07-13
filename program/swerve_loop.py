from pybricks.tools import wait
from usys import stdout, stdin
from umath import cos, radians, sin
from io_simulation import SimulatedIO
from swerve import SwerveDriveKinematics


DEBUG = False
input_readings = [
    "0,100,0\n",
    "0,100,0\n",
    "100,0,0\n",
    "100,0,0\n",
    "0,100,0\n",
    "0,100,0\n",
    "100,0,0\n",
    "100,0,0\n",
    "0,100,0\n",
    "0,100,0\n",
    "100,0,0\n",
    "100,0,0\n",
]
simulated_io = SimulatedIO(input_readings=input_readings)
stdin = simulated_io if DEBUG else stdin

# Left front, right front, left rear, right rear
kinematics = SwerveDriveKinematics(swerve_module_positions=[(1, 1), (-1, 1), (1, -1), (-1, -1)])


def swerve_loop(hub, field_relative=False, callback=lambda _module_states: None):
    try:
        while True:
            line = stdin.readline()

            if not line:
                break

            vx, vy, omega = [float(value) for value in line.strip().split(",")]

            if field_relative:
                angle = hub.imu.heading()
                vx = vx * cos(radians(angle)) - vy * sin(radians(angle))
                vy = vx * sin(radians(angle)) + vy * cos(radians(angle))

            drive_base_velocity = (vx, vy, omega)
            module_states = kinematics.to_swerve_module_states(drive_base_velocity=drive_base_velocity, drive_base_center=(0, 0))

            SwerveDriveKinematics.normalize_module_states(module_states)

            callback(module_states)

            if DEBUG:
                wait(1000)

            stdout.buffer.write(b"ack")

    except Exception as e:
        stdout.write(str(e))
        raise e
