class SimulatedIO:
    def __init__(self, input_readings=[]):
        self.input_readings = input_readings

    def readline(self):
        if not self.input_readings:
            return ""

        # Get the next reading
        next_reading = self.input_readings.pop(0)

        return next_reading
