# $ pybricksdev run ble drive_hub.py --name "Technic Hub B" --no-wait
from pybricks.parameters import Direction, Port
from pybricks.pupdevices import Motor
from usys import stdin, stdout
from message import Message

drive_settings = dict(profile=360)
drive_limits = dict(acceleration=1000)

fl_drive_motor = Motor(Port.D, **drive_settings)
fr_drive_motor = Motor(Port.C, **drive_settings, positive_direction=Direction.COUNTERCLOCKWISE)
bl_drive_motor = Motor(Port.A, **drive_settings)
br_drive_motor = Motor(Port.B, **drive_settings, positive_direction=Direction.COUNTERCLOCKWISE)

fl_drive_motor.control.limits(**drive_limits)
fr_drive_motor.control.limits(**drive_limits)
bl_drive_motor.control.limits(**drive_limits)
br_drive_motor.control.limits(**drive_limits)

drive_motors = [
    fl_drive_motor,
    fr_drive_motor,
    bl_drive_motor,
    br_drive_motor,
]


def percentage_to_speed(percentage):
    max_speed = 390 / 360 * 1000
    return percentage / 100 * max_speed


def send_message(type, payload={}):
    stdout.write(str(Message(type, payload)))


try:
    while True:
        speeds = stdin.readline().strip().split(",")

        for i, speed in enumerate(speeds):
            drive_motors[i].run(percentage_to_speed(int(speed)))

except SystemExit as e:
    send_message("debug", {"exception": "SystemExit"})
    raise e

except Exception as e:
    send_message("debug", {"exception": "Exception", "message": str(e)})
    raise e
