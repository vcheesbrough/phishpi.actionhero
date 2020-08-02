#include <unity.h>
#include "SerialMessageReadBufferTests.h"
#include "SerialMessageWriteBufferTests.h"
#include "RingBufferTests.h"

void common() {
    RUN_TEST(RingBufferTests::givenBufferEmpty_ThenAvailableForPutReturnsBufferSize);
    RUN_TEST(RingBufferTests::givenBufferEmptyAndPutWithMoreThanBufferSize_ThenAvailableForTakeReturnsZero);
    RUN_TEST(RingBufferTests::givenBufferEmptyAndPutWithLessThanBufferSize_ThenAvailableForTakeReturnsPutSize);
    RUN_TEST(RingBufferTests::givenBufferEmptyAndPutWithLessThanBufferSize_ThenTakeGetsPutValues);
    RUN_TEST(RingBufferTests::givenBufferEmptyAndPutTwice_ThenTakeGetsBothPutValues);
    RUN_TEST(RingBufferTests::givenBufferEmptyAndPut_ThenTakeWithLessThanPutGetsPartOfPut);
    RUN_TEST(RingBufferTests::givenBufferEmptyAndPut_ThenTakeMultipleTimesCanGetPut);
    RUN_TEST(RingBufferTests::givenBufferFull_ThenAvailableToPutIsZero);
    RUN_TEST(RingBufferTests::givenBufferHasSomeContent_ThenAvailableToPutIsRemainingSpace);
    RUN_TEST(RingBufferTests::givenContainsContentNotAtStartAndPutWillWrap_ThenTakeWillGetPutValue);
    RUN_TEST(RingBufferTests::givenIntegerBufferEmptyAndPutWithLessThanBufferSize_ThenTakeGetsPutValues);
    RUN_TEST(RingBufferTests::givenIntegerBufferEmptyAndPutWithLessThanBufferSize_ThenTakeGetsPutValues);


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
    
    RUN_TEST(SerialMessageReadBufferTests::givenNoAvailable_thenReadNotCalled);
    RUN_TEST(SerialMessageReadBufferTests::givenSeveralAvailableWithoutMarkCharacters_thenReadCalled);
    RUN_TEST(SerialMessageReadBufferTests::givenCommandAvailableSuroundedByJunk_thenCommandReturned);
    RUN_TEST(SerialMessageReadBufferTests::givenTwoCommandAvailableSuroundedByJunk_thenFirstCommandReturned);
    RUN_TEST(SerialMessageReadBufferTests::givenTwoCommandAvailableSuroundedByJunk_thenSecondCommandReturnedOnSecondInvocation);
    RUN_TEST(SerialMessageReadBufferTests::givenHalfCommandAvailableOnFirstInvocationAndOtherHalfAvailableOnSecond_thenSecondInvocationReturnsCommand);
    RUN_TEST(SerialMessageReadBufferTests::givenCommandLongerThanBuffer_commandNotReturned);
    RUN_TEST(SerialMessageReadBufferTests::givenCommandSameSizeAsBuffer_commandReturned);

    RUN_TEST(SerialMessageWriteBufferTests::givenNoMessagesInBufferAndAvailable_ThenTrySendMessagesDoesNotWrite);
    RUN_TEST(SerialMessageWriteBufferTests::givenMessageInBufferIsSmallerThanSerialAvailableForWrite_ThenTrySendMessagesWrites);
    RUN_TEST(SerialMessageWriteBufferTests::givenMessageInBufferIsLargerThanSerialAvailableForWrite_ThenTrySendMessagesWritesPartOfBuffer);
    RUN_TEST(SerialMessageWriteBufferTests::givenMessageInBufferAndZeroAvailableForWrite_ThenTrySendMessagesDoesNotWrite);

    UNITY_END();

    return 0;
}
#endif
