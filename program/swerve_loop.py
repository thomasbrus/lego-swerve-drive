from pybricks.tools import wait
from usys import stdout, stdin
from umath import cos, radians, sin
from io_simulation import SimulatedIO
from swerve import SwerveDriveKinematics, SwerveModule
from swerve_telemetry import swerve_telemetry

DEBUG = False
input_readings = [
    "drive,0,100,0\n",
    "drive,0,100,0\n",
    "drive,100,0,0\n",
    "drive,100,0,0\n",
    "drive,0,100,0\n",
    "drive,0,100,0\n",
    "drive,100,0,0\n",
    "drive,100,0,0\n",
    "drive,0,100,0\n",
    "drive,0,100,0\n",
    "drive,100,0,0\n",
    "drive,100,0,0\n",
    "exit\n",
]
simulated_io = SimulatedIO(input_readings=input_readings)
stdin = simulated_io if DEBUG else stdin

# Left front, right front, left rear, right rear
kinematics = SwerveDriveKinematics(swerve_module_positions=[(1, -1), (-1, -1), (1, 1), (-1, 1)])


class SwerveLoopState:
    def __init__(self, hub, swerve_modules, drive_base_center=(0, 0), field_centric=False):
        self.hub = hub
        self.swerve_modules = swerve_modules
        self.drive_base_center = drive_base_center
        self.field_centric = field_centric


class SwerveInput:
    def __init__(self, line):
        self.line = line
        self.cmd, *self.args = self.line.strip().split(",")


def swerve_loop(hub, swerve_modules):
    state = SwerveLoopState(hub, swerve_modules, drive_base_center=(0, 0), field_centric=False)

    try:
        while True:
            line = stdin.readline()

            if not line:
                break

            input = SwerveInput(line)

            handle_input(input, state)
            ack_with_telemetry(state)

            if DEBUG:
                wait(1000)

    except Exception as e:
        stdout.write(str(e))
        raise e


def handle_input(input, state):
    if input.cmd == "exit":
        handle_exit()
    elif input.cmd == "set_drive_base_center":
        handle_set_drive_base_center(input.args, state)
    elif input.cmd == "toggle_field_centric":
        handle_toggle_field_centric(input.args, state)
    elif input.cmd == "drive":
        handle_drive(input.args, state)


def handle_exit():
    raise SystemExit


def handle_set_drive_base_center(args, state):
    cy, cx = [int(arg) for arg in args]
    state.drive_base_center = (cx, cy)


def handle_toggle_field_centric(_args, state):
    state.field_centric = not state.field_centric


def handle_drive(args, state):
    vx, vy, omega = [float(arg) for arg in args]

    if state.field_centric:
        angle = state.hub.imu.heading()
        vx = vx * cos(radians(angle)) - vy * sin(radians(angle))
        vy = vx * sin(radians(angle)) + vy * cos(radians(angle))

    drive_base_velocity = (vx, vy, omega)
    module_states = kinematics.to_swerve_module_states(drive_base_velocity, state.drive_base_center)

    SwerveDriveKinematics.normalize_module_states(module_states)

    respective_module_states = [module_states[module.index] for module in state.swerve_modules]

    SwerveModule.set_desired_states(state.swerve_modules, respective_module_states, wait=False)


def ack_with_telemetry(state):
    values = [f"{value:.2f}" for value in swerve_telemetry(state.hub, state.swerve_modules)]
    stdout.write(f"ack,{','.join(values)}\n")
