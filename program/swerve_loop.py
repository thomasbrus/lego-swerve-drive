from usys import stdout, stdin
from umath import cos, radians, sin
from io_simulation import SimulatedIO, Reading
from swerve import SwerveDriveKinematics, SwerveModule
from swerve_telemetry import swerve_telemetry
from pid_controller import PIDController

DEBUG = True
input_readings = [
    Reading("drive,0,0,100\n", 1000),
    Reading("drive,0,100,-50\n", 1000),
    Reading("drive,0,0,100\n", 1000),
    Reading("exit\n", 500),
]
simulated_io = SimulatedIO(input_readings=input_readings)
stdin = simulated_io if DEBUG else stdin

# Left front, right front, left rear, right rear
kinematics = SwerveDriveKinematics(swerve_module_positions=[(1, -1), (-1, -1), (1, 1), (-1, 1)])


class InputPIDController(PIDController):
    def __init__(self):
        super().__init__(0.2, 0.01, 0.01, 1)


class SwerveLoopState:
    def __init__(self, hub, swerve_modules, drive_base_center=(0, 0), field_centric=False):
        self.hub = hub
        self.swerve_modules = swerve_modules
        self.drive_base_center = drive_base_center
        self.field_centric = field_centric
        self.vx = 0
        self.vy = 0
        self.omega = 0
        self.vx_pid = InputPIDController()
        self.vy_pid = InputPIDController()
        self.omega_pid = InputPIDController()


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

    except SystemExit:
        pass

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
    setpoint_vx, setpoint_vy, setpoint_omega = [float(arg) for arg in args]

    state.vx += state.vx_pid.update(setpoint_vx, state.vx)
    state.vy += state.vy_pid.update(setpoint_vy, state.vy)
    state.omega += state.omega_pid.update(setpoint_omega, state.omega)

    vx = state.vx
    vy = state.vy
    omega = state.omega

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
