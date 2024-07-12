from umath import pi


def radians_to_degrees(radians):
    return radians * 180 / pi


def degrees_to_radians(degrees):
    return degrees * pi / 180


def percentage_to_speed(percentage):
    max_speed = 390 / 360 * 1000
    return percentage / 100 * max_speed
