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


def swerve_loop(hub, field_centric=False, callback=lambda _module_states: None):
    drive_base_center = (0, 0)

    try:
        while True:
            line = stdin.readline()

            if not line:
                break

            cmd, *args = line.strip().split(",")

            if cmd == "exit":
                break
            elif cmd == "set_drive_base_center":
                cy, cx = [int(arg) for arg in args]
                drive_base_center = (cx, cy)
            elif cmd == "toggle_field_centric":
                field_centric = not field_centric
            elif cmd == "drive":
                vx, vy, omega = [float(arg) for arg in args]

                if field_centric:
                    angle = hub.imu.heading()
                    vx = vx * cos(radians(angle)) - vy * sin(radians(angle))
                    vy = vx * sin(radians(angle)) + vy * cos(radians(angle))

                drive_base_velocity = (vx, vy, omega)
                module_states = kinematics.to_swerve_module_states(drive_base_velocity, drive_base_center)

                SwerveDriveKinematics.normalize_module_states(module_states)

                callback(module_states)

                if DEBUG:
                    wait(1000)

                stdout.buffer.write(b"ack")

    except Exception as e:
        stdout.write(str(e))
        raise e
