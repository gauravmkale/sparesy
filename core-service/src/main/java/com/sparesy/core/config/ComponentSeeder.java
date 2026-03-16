package com.sparesy.core.config;

import com.sparesy.core.entity.Component;
import com.sparesy.core.repository.ComponentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ComponentSeeder implements ApplicationRunner {

    @Autowired
    private ComponentRepository componentRepository;

    @Override
    public void run(ApplicationArguments args) {
        seed("10 Ohm Resistor",         "RES-10R-0805",     "Resistors",        "10 Ohm thick film resistor, 0805 package, 1/8W");
        seed("100 Ohm Resistor",        "RES-100R-0805",    "Resistors",        "100 Ohm thick film resistor, 0805 package, 1/8W");
        seed("1K Ohm Resistor",         "RES-1K-0805",      "Resistors",        "1K Ohm thick film resistor, 0805 package, 1/8W");
        seed("10K Ohm Resistor",        "RES-10K-0805",     "Resistors",        "10K Ohm thick film resistor, 0805 package, 1/8W");

        seed("100nF Ceramic Capacitor", "CAP-100N-0805",    "Capacitors",       "100nF MLCC ceramic capacitor, 0805, 50V");
        seed("10uF Electrolytic Cap",   "CAP-10U-ELEC",     "Capacitors",       "10uF electrolytic capacitor, radial, 25V");
        seed("1uF Ceramic Capacitor",   "CAP-1U-0805",      "Capacitors",       "1uF MLCC ceramic capacitor, 0805, 16V");
        seed("470uF Electrolytic Cap",  "CAP-470U-ELEC",    "Capacitors",       "470uF electrolytic capacitor, radial, 25V");

        seed("ATmega328P",              "IC-ATMEGA328P",    "Microcontrollers", "8-bit AVR microcontroller, 32KB flash, DIP-28");
        seed("STM32F103C8T6",           "IC-STM32F103",     "Microcontrollers", "ARM Cortex-M3 32-bit MCU, 64KB flash, LQFP-48");
        seed("ESP32-WROOM-32",          "IC-ESP32-WROOM",   "Microcontrollers", "Dual-core WiFi+BT MCU module, 4MB flash");
        seed("NE555 Timer IC",          "IC-NE555",         "ICs",              "General purpose timer IC, DIP-8");
        seed("LM358 Op-Amp",            "IC-LM358",         "ICs",              "Dual general purpose op-amp, DIP-8");
        seed("74HC595 Shift Register",  "IC-74HC595",       "ICs",              "8-bit serial-in parallel-out shift register, DIP-16");

        seed("2.54mm 2-Pin Header",     "CON-HDR-2P",       "Connectors",       "2-pin straight male pin header, 2.54mm pitch");
        seed("2.54mm 4-Pin Header",     "CON-HDR-4P",       "Connectors",       "4-pin straight male pin header, 2.54mm pitch");
        seed("USB Type-B Connector",    "CON-USB-B",        "Connectors",       "USB Type-B through-hole PCB connector");
        seed("Micro USB Connector",     "CON-MICRO-USB",    "Connectors",       "Micro USB SMD PCB connector, 5-pin");

        seed("2N2222 NPN Transistor",   "TRANS-2N2222",     "Transistors",      "NPN general purpose transistor, TO-92, 600mA");
        seed("BC547 NPN Transistor",    "TRANS-BC547",      "Transistors",      "NPN general purpose transistor, TO-92, 100mA");
        seed("IRF540N MOSFET",          "TRANS-IRF540N",    "Transistors",      "N-channel power MOSFET, TO-220, 33A 100V");
        seed("AO3400 N-CH MOSFET",      "TRANS-AO3400",     "Transistors",      "N-channel MOSFET, SOT-23, 5.7A 30V");

        seed("1N4007 Rectifier Diode",  "DIODE-1N4007",     "Diodes",           "General purpose rectifier diode, DO-41, 1A 1000V");
        seed("1N5819 Schottky Diode",   "DIODE-1N5819",     "Diodes",           "Schottky barrier diode, DO-41, 1A 40V");
        seed("5mm Red LED",             "DIODE-LED-RED",    "Diodes",           "5mm red LED, 2V forward voltage, 20mA");
        seed("5mm Green LED",           "DIODE-LED-GRN",    "Diodes",           "5mm green LED, 2.1V forward voltage, 20mA");

        seed("10uH Inductor",           "IND-10UH-SMD",     "Inductors",        "10uH SMD power inductor, 1.2A, 20% tolerance");
        seed("100uH Inductor",          "IND-100UH-SMD",    "Inductors",        "100uH SMD power inductor, 0.8A, 20% tolerance");

        seed("16MHz Crystal",           "XTAL-16MHZ",       "Crystals",         "16MHz HC-49S crystal oscillator, through-hole");
        seed("8MHz Crystal",            "XTAL-8MHZ",        "Crystals",         "8MHz HC-49S crystal oscillator, through-hole");
    }

    private void seed(String name, String partNumber, String category, String description) {
        if (componentRepository.existsByPartNumber(partNumber)) return;

        Component c = new Component();
        c.setName(name);
        c.setPartNumber(partNumber);
        c.setCategory(category);
        c.setDescription(description);
        componentRepository.save(c);
    }
}