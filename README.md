# LEGO Swerve Drive

Two wheeled swerve drive, with Ackermann, tank, swerve steering. In the video below the robot keeps its orienation relative to the field using the builtin gyroscope. An unique feature of a swerve drive is that it can also rotate itself while moving sideways. At the end it switches to tank steering, with an increasingly smaller turn radius.

https://github.com/user-attachments/assets/13078f21-9577-4978-b279-8b0976e34bdb

Also built a four wheel swerve drive, the code is in the four-wheel-swerve-drive branch.

https://github.com/user-attachments/assets/10fc3e3f-b26e-4257-bff9-15ef619aaf38


## Installation

- Create virtual environment / terminal via VSSode

```bash
python3 -m pip install pipenv
pip install pybricks pybricksdev
```

## Running the Pybricks program

```bash
cd program
pybricksdev run ble main.py --name "<hub-name>"
```

Source code: [main.py](program/main.py). Also see this [Pybricks thread for longer explanation](https://github.com/orgs/pybricks/discussions/1729).

