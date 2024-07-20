from pybricks.tools import StopWatch, wait


class Reading:
    def __init__(self, value, duration):
        self.value = value
        self.duration = duration


class SimulatedIO:
    def __init__(self, input_readings=[]):
        self.input_readings = input_readings
        self.stop_watch = StopWatch()
        self.last_read_time = 0
        self.current_reading = None
        self.current_reading_start_time = 0

    def readline(self):
        if not self.input_readings:
            return self.current_reading.value if self.current_reading else ""

        elapsed_time = self.stop_watch.time() - self.current_reading_start_time

        if self.current_reading is None or elapsed_time >= self.current_reading.duration:
            # Update the current reading
            self.current_reading = self.input_readings.pop(0)
            self.current_reading_start_time = self.stop_watch.time()

        return self.current_reading.value
