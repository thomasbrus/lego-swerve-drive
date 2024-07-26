from pybricks.tools import StopWatch


class ReadingsTimeline:
    def __init__(self, readings):
        self.readings = readings
        self.stop_watch = StopWatch()

    def current(self):
        elapsed_time = self.stop_watch.time()
        total_duration = 0

        for reading in self.readings:
            total_duration += reading.duration
            if elapsed_time < total_duration:
                return reading.value

        return self.readings[-1].value

    def is_empty(self):
        return not self.readings


class SimulatedController:
    def __init__(
        self,
        joystick_left_readings=[],
        joystick_right_readings=[],
        trigger_readings=[],
        button_readings=[],
    ):
        self.joystick_left_readings_timeline = ReadingsTimeline(joystick_left_readings)
        self.joystick_right_readings_timeline = ReadingsTimeline(joystick_right_readings)
        self.trigger_readings_timeline = ReadingsTimeline(trigger_readings)
        self.buttons = SimulatedKeypad(button_readings)
        self.stop_watch = StopWatch()

    def joystick_left(self):
        if self.joystick_left_readings_timeline.is_empty():
            raise IndexError("No readings available for left joystick.")
        return self.joystick_left_readings_timeline.current()

    def joystick_right(self):
        if self.joystick_right_readings_timeline.is_empty():
            raise IndexError("No readings available for right joystick.")
        return self.joystick_right_readings_timeline.current()

    def triggers(self):
        if self.trigger_readings_timeline.is_empty():
            raise IndexError("No readings available for triggers.")
        return self.trigger_readings_timeline.current()


class SimulatedKeypad:
    def __init__(self, button_readings=[]):
        self.button_readings_timeline = ReadingsTimeline(button_readings)
        self.stop_watch = StopWatch()

    def pressed(self):
        if self.button_readings_timeline.is_empty():
            raise IndexError("No readings available for buttons.")
        return self.button_readings_timeline.current()


class Reading:
    def __init__(self, value, duration):
        self.value = value
        self.duration = duration
