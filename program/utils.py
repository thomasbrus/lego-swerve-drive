from umath import pi, atan2


def radians_to_degrees(radians):
    return radians * 180 / pi


def degrees_to_radians(degrees):
    return degrees * pi / 180


def percentage_to_speed(percentage):
    max_speed = 390 / 360 * 1000
    return percentage / 100 * max_speed


def vector_angle(vector):
    angle = radians_to_degrees(pi - atan2(vector[1], vector[0])) - 90
    return (angle + 360) % 360


def vector_distance(vector):
    return (vector[0] ** 2 + vector[1] ** 2) ** 0.5
