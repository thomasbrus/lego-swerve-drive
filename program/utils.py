from umath import pi, atan2, degrees


def percentage_to_speed(percentage):
    max_speed = 390 / 360 * 1000
    return percentage / 100 * max_speed


def vector_angle(vector):
    angle = degrees(pi - atan2(vector[1], vector[0])) - 90
    return (angle + 360) % 360


def vector_distance(vector):
    return (vector[0] ** 2 + vector[1] ** 2) ** 0.5
