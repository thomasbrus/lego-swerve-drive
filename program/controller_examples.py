from controller_simulation import SimulatedController, Reading


def straight_line_example():
    return SimulatedController(
        joystick_left_readings=[
            Reading((0, 50), 1000),
            Reading((0, 75), 1000),
            Reading((0, 100), 1000),
            Reading((0, 75), 1000),
            Reading((0, 50), 1000),
            Reading((0, 0), 1000),
        ],
    )


def zig_zag_example():
    return SimulatedController(
        joystick_left_readings=[
            Reading((50, 50), 1000),
            Reading((0, 75), 1000),
            Reading((-75, 75), 1000),
            Reading((0, 100), 1000),
            Reading((100, 100), 1000),
            Reading((0, 0), 1000),
        ],
    )
