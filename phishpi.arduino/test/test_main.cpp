#include <unity.h>
#include "SimpleComponentTests.h"
#include "SerialCommandReadBufferTests.h"

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
    RUN_TEST(SimpleComponentTests::valueIsReturnedFromDependency);
    
    RUN_TEST(SerialCommandReadBufferTests::givenNoAvailable_thenReadNotCalled);
    RUN_TEST(SerialCommandReadBufferTests::givenSeveralAvailableWithoutMarkCharacters_thenReadCalled);
    RUN_TEST(SerialCommandReadBufferTests::givenCommandAvailableSuroundedByJunk_thenCommandReturned);
    RUN_TEST(SerialCommandReadBufferTests::givenTwoCommandAvailableSuroundedByJunk_thenFirstCommandReturned);
    RUN_TEST(SerialCommandReadBufferTests::givenTwoCommandAvailableSuroundedByJunk_thenSecondCommandReturnedOnSecondInvocation);
    RUN_TEST(SerialCommandReadBufferTests::givenHalfCommandAvailableOnFirstInvocationAndOtherHalfAvailableOnSecond_thenSecondInvocationReturnsCommand);
    RUN_TEST(SerialCommandReadBufferTests::givenCommandLongerThanBuffer_commandNotReturned);
    RUN_TEST(SerialCommandReadBufferTests::givenCommandSameSizeAsBuffer_commandReturned);

    UNITY_END();

    return 0;
}
#endif
