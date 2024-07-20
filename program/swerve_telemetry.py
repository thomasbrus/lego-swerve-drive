def swerve_telemetry(hub, swerve_modules):
    return swerve_hub_telemetry(hub) + swerve_module_telemetry(swerve_modules[0]) + swerve_module_telemetry(swerve_modules[1])


def swerve_hub_telemetry(hub):
    return [hub.imu.heading()]


def swerve_module_telemetry(swerve_module):
    turning_motor = swerve_module.turning_motor
    drive_motor = swerve_module.drive_motor

    return [
        turning_motor.angle(),
        turning_motor.speed(),
        drive_motor.speed(),
    ]
