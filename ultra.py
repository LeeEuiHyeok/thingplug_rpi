import RPi.GPIO as gpio
import time

trig_pin = 13
echo_pin = 19


gpio.setmode(gpio.BCM)

gpio.setup(trig_pin, gpio.OUT)
gpio.setup(echo_pin, gpio.IN)

try:
	
    gpio.output(trig_pin, False)
    gpio.output(trig_pin, True)
    gpio.output(trig_pin, False)

    while gpio.input(echo_pin) == 0:
            pulse_start = time.time()

    while gpio.input(echo_pin) == 1:
            pulse_end = time.time()

    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 34000 / 2
    distance = round(distance, 2)

    print(distance)

except KeyboardInterrupt as e:		
	pass
finally:
    gpio.cleanup()