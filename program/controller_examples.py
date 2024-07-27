from controller_simulation import SimulatedController, Reading
from pybricks.parameters import Button
from swerve import SwerveModuleState

pause_joystick = Reading((0, 0), 1000)
finish_joystick = Reading((0, 0), 0)

exit_readings = [
    Reading([], 10000),
    Reading([Button.B], 0),
]

disable_field_oriented = Reading([Button.X], 25)


def straight_line_example():
    return SimulatedController(
        joystick_left_readings=[
            pause_joystick,
            Reading((0, 100), 2500),
            Reading((0, -100), 2500),
            finish_joystick,
        ],
        button_readings=exit_readings,
    )


def sideways_example():
    return SimulatedController(
        joystick_left_readings=[
            pause_joystick,
            Reading((100, 0), 2500),
            Reading((-100, 0), 2500),
            finish_joystick,
        ],
        button_readings=exit_readings,
    )


def zig_zag_example():
    return SimulatedController(
        joystick_left_readings=[
            pause_joystick,
            Reading((100, 100), 1775),
            Reading((-100, -100), 1775),
            finish_joystick,
        ],
        button_readings=exit_readings,
    )
