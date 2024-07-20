class PIDController:
    def __init__(self, kp, ki, kd, dt):
        self.kp = kp  # Proportional gain
        self.ki = ki  # Integral gain
        self.kd = kd  # Derivative gain
        self.dt = dt  # Time step (delta time)

        self.integral = 0  # Integral term
        self.previous_error = 0  # Previous error

    def update(self, setpoint, measured_value):
        # Calculate error
        error = setpoint - measured_value

        # Proportional term
        proportional = self.kp * error

        # Integral term
        self.integral += error * self.dt
        integral = self.ki * self.integral

        # Derivative term
        derivative = self.kd * (error - self.previous_error) / self.dt

        # Calculate output
        output = proportional + integral + derivative

        # Save the current error as the previous error for the next iteration
        self.previous_error = error

        return output

    def reset(self):
        self.integral = 0
        self.previous_error = 0
