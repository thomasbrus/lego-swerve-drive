from pybricks.parameters import Port, Direction
from pybricks.tools import wait
from usys import stdout, stdin
from io_simulation import SimulatedIO
from swerve import SwerveDriveMotor, SwerveTurningMotor, SwerveModule, SwerveDriveKinematics


DEBUG = True
input_readings = [
    "0,100,0,0\n",
    "0,-50,0,0\n",
    "0,-50,0,0\n",
    "0,-50,0,0\n",
    "50,50,0,0\n",
    "50,50,0,0\n",
    "-50,-50,0,0\n",
    "-50,-50,0,0\n",
    "0,15,0,0\n",
    "0,15,0,0\n",
    "0,15,0,0\n",
    "0,15,0,0\n",
    "0,0,25,0\n",
    "0,0,25,0\n",
    "0,0,25,0\n",
    "0,0,25,0\n",
    "0,0,-25,0\n",
    "0,0,-25,0\n",
    "0,0,-25,0\n",
    "0,0,-25,0\n",
    "50,0,50,0\n",
]
simulated_io = SimulatedIO(input_readings=input_readings)
stdin = simulated_io if DEBUG else stdin

# Left front, right front, left rear, right rear
kinematics = SwerveDriveKinematics(swerve_module_positions=[(-1, 1), (1, 1), (-1, -1), (1, -1)])


def swerve_loop(hub, callback=lambda *args: None):
    try:
        while True:
            line = stdin.readline()

            if not line:
                break

            x1, y1, x2, _ = line.strip().split(",")
            vx, vy, omega = int(x1), int(y1), int(x2)
            drive_base_velocity = (vx, vy, omega - hub.imu.heading())
            module_states = kinematics.to_swerve_module_states(drive_base_velocity=drive_base_velocity, drive_base_center=(0, 0))

            SwerveDriveKinematics.normalize_module_states(module_states)

            callback(module_states)

            if DEBUG:
                wait(1000)

            stdout.buffer.write(b"ack")

    except Exception as e:
        stdout.write(str(e))
        raise e
