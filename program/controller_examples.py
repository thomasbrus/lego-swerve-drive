from controller_simulation import SimulatedController, Reading
from pybricks.parameters import Button
from swerve import SwerveModuleState

pause_joystick = Reading((0, 0), 1000)
finish_joystick = Reading((0, 0), 0)

pause_triggers = Reading([0, 0], 1000)
finish_triggers = Reading([0, 0], 0)

exit_readings = [
    Reading([], 10000),
    Reading([Button.GUIDE], 0),
]


def press_button(button):
    return Reading([button], 25)


def ackermann_straight_line_example():
    return SimulatedController(
        trigger_readings=[
            pause_triggers,
            Reading([0, 100], 2500),
            Reading([0, -100], 2500),
            finish_triggers,
        ],
        button_readings=[press_button(Button.A)] + exit_readings,
    )


def ackermann_curve_example():
    return SimulatedController(
        trigger_readings=[
            pause_triggers,
            Reading([0, 100], 1775),
            Reading([0, 0], 1775),
            Reading([0, -100], 1775),
            finish_triggers,
        ],
        joystick_left_readings=[
            pause_joystick,
            Reading([100, 0], 1775),
            Reading([0, 0], 1775),
            Reading([-100, 0], 1775),
            finish_joystick,
        ],
        button_readings=[press_button(Button.A)] + exit_readings,
    )


def ackermann_circle_example():
    return SimulatedController(
        trigger_readings=[
            pause_triggers,
            Reading([0, 100], 4400),
            finish_triggers,
        ],
        joystick_left_readings=[
            pause_joystick,
            Reading([100, 0], 4400),
            finish_joystick,
        ],
        button_readings=[press_button(Button.A)] + exit_readings,
    )


def tank_zero_turn_example():
    return SimulatedController(
        joystick_left_readings=[
            pause_joystick,
            Reading([100, 0], 3000),
            finish_joystick,
        ],
        button_readings=[press_button(Button.B)] + exit_readings,
    )


def tank_straight_line_and_turn_example():
    return SimulatedController(
        trigger_readings=[
            pause_triggers,
            Reading([0, 100], 1500),
            Reading([0, 0], 1800),
            Reading([0, 100], 1500),
            Reading([0, 0], 2700),
            finish_triggers,
        ],
        joystick_left_readings=[
            pause_joystick,
            Reading([0, 0], 1500),
            Reading([100, 0], 1800),
            Reading([0, 0], 1500),
            Reading([100, 0], 2700),
            finish_joystick,
        ],
        button_readings=[press_button(Button.B)] + exit_readings,
    )
