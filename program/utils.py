from umath import pi, atan2, degrees, cos, sin, radians


def percentage_to_speed(percentage):
    max_speed = 390 / 360 * 1000
    return percentage / 100 * max_speed


def vector_angle(vector):
    angle = degrees(pi - atan2(vector[1], vector[0])) - 90
    return (angle + 360) % 360


def vector_rotate(vector, angle):
    x = vector[0] * cos(radians(angle)) - vector[1] * sin(radians(angle))
    y = vector[0] * sin(radians(angle)) + vector[1] * cos(radians(angle))
    return x, y


def vector_distance(vector):
    return (vector[0] ** 2 + vector[1] ** 2) ** 0.5
