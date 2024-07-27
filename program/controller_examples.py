from controller_simulation import SimulatedController, Reading
from pybricks.parameters import Button

pause_joystick = Reading((0, 0), 1000)
finish_joystick = Reading((0, 0), 0)

pause_triggers = Reading([0, 0], 1000)
finish_triggers = Reading([0, 0], 0)


def exit_readings(duration=10000):
    return [
        Reading([], duration),
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
        button_readings=[press_button(Button.A)] + exit_readings(),
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
        button_readings=[press_button(Button.A)] + exit_readings(),
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
        button_readings=[press_button(Button.A)] + exit_readings(),
    )


def tank_zero_turn_example():
    return SimulatedController(
        joystick_left_readings=[
            pause_joystick,
            Reading([100, 0], 3000),
            finish_joystick,
        ],
        button_readings=[press_button(Button.B)] + exit_readings(),
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
        button_readings=[press_button(Button.B)] + exit_readings(),
    )


def crab_straight_line_example():
    return SimulatedController(
        button_readings=[press_button(Button.X), press_button(Button.UP)] + exit_readings(),
    )


def swerve_turn_and_drive_example():
    return SimulatedController(
        joystick_left_readings=[
            pause_joystick,
            # Swerve steering mode
            Reading([100, 0], 1500),
            Reading([0, 0], 500),
            Reading([0, 100], 1500),
            Reading([0, 0], 500),
            Reading([-100, 0], 1500),
            Reading([0, 0], 500),
            Reading([0, -100], 1500),
            # Tank steering mode
            Reading([50, 0], 1000),
            Reading([60, 0], 1000),
            Reading([70, 0], 1000),
            Reading([80, 0], 1000),
            Reading([90, 0], 1000),
            Reading([100, 0], 3000),
            # Finish
            finish_triggers,
        ],
        joystick_right_readings=[
            pause_joystick,
            # Swerve steering mode
            Reading([-25, 0], 8000),
            Reading([0, 0], 500),
            # Tank steering mode
            finish_joystick,
        ],
        trigger_readings=[
            # Swerve steering mode
            Reading([0, 0], 8000),
            Reading([0, 0], 500),
            # Tank steering mode
            Reading([0, 100], 4500),
            finish_triggers,
        ],
        button_readings=[
            # Swerve steering mode
            press_button(Button.Y),
            Reading([], 8000),
            # Tank steering mode
            press_button(Button.B),
            Reading([], 10000),
            # Finish
            Reading([Button.GUIDE], 0),
        ],
    )
