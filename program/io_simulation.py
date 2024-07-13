from pybricks.tools import StopWatch, wait


class Reading:
    def __init__(self, value, duration):
        self.value = value
        self.duration = duration


class SimulatedIO:
    def __init__(self, input_readings=[]):
        self.input_readings = input_readings
        self.last_read_stop_watch = StopWatch()

    def readline(self):
        if not self.input_readings:
            raise IndexError("No readings available for input.")

        # Get the next reading
        next_reading = self.input_readings.pop(0)

        # Calculate the time since the last read
        elapsed_time = self.last_read_stop_watch.time()

        # If not enough time has passed, wait
        if elapsed_time < next_reading.duration:
            wait(next_reading.duration - elapsed_time)

        self.last_read_stop_watch.reset()

        return next_reading.value


# Example usage:
input_readings = [
    Reading("First line\n", 2000),  # 2 seconds
    Reading("Second line\n", 3000),  # 3 seconds
    Reading("Third line\n", 1000),  # 1 second
]

simulated_io = SimulatedIO(input_readings)

print(simulated_io.readline())  # Blocks for 2 seconds, then prints "First line\n"
print(simulated_io.readline())  # Blocks for 3 seconds, then prints "Second line\n"
print(simulated_io.readline())  # Blocks for 1 second, then prints "Third line\n"
