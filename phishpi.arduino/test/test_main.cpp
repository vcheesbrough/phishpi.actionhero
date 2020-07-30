#include <unity.h>
#include "SimpleComponentTests.h"

void common() {
    RUN_TEST(SimpleComponentTests::thisReturnsTrue);

}

#ifdef ARDUINO
#include <Arduino.h>

void setup() {
    Serial.begin(115200);

    common();

    UNITY_BEGIN();    
}

void loop() {
    UNITY_END();
}
#else

int main(int argc, char **argv)
{
    UNITY_BEGIN();

    common();
    RUN_TEST(SimpleComponentTests::dependencyIsInvoked);

    UNITY_END();

    return 0;
}
#endif
