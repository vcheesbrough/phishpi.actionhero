#include "SerialMessageReadBuffer.h"
#include <unity.h>
#include "IMockableSerial.h"
#include "Constants.h"

#ifndef ARDUINO
#include <single_header/standalone/fakeit.hpp>
using namespace fakeit;

namespace SerialMessageReadBufferTests {

    void givenNoAvailable_thenReadNotCalled() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer<20> target(mockSerial.get());

        When(Method(mockSerial,available)).Return(0);

        target.tryGetNextCommand();

        Verify(Method(mockSerial,read)).Never();
    }

    void givenCommandLongerThanBuffer_commandNotReturned() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer<3> target(mockSerial.get());

        When(Method(mockSerial,available)).Return(6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return(COMMAND_START_TOKEN,'A','B','C','D',COMMAND_END_TOKEN);

        char * nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_NULL(nextCommand);
    }

    void givenCommandSameSizeAsBuffer_commandReturned() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer<4> target(mockSerial.get());

        When(Method(mockSerial,available)).Return(6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return(COMMAND_START_TOKEN,'A','B','C','D',COMMAND_END_TOKEN);

        char * nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("ABCD",nextCommand);
    }

    void givenSeveralAvailableWithoutMarkCharacters_thenReadCalled() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer<20> target(mockSerial.get());

        When(Method(mockSerial,available)).Return(3,2,1,0);
        When(Method(mockSerial,read)).Return('A','B','C');

        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_NULL(nextCommand);
        Verify(Method(mockSerial,read)).Exactly(3);
    }

    void givenCommandAvailableSuroundedByJunk_thenCommandReturned() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer<20> target(mockSerial.get());

        When(Method(mockSerial,available)).Return(7,6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return('X',COMMAND_START_TOKEN,'C','D','E',COMMAND_END_TOKEN,'F');

        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("CDE",nextCommand);
    }

    void givenTwoCommandAvailableSuroundedByJunk_thenFirstCommandReturned() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer<20> target(mockSerial.get());

        When(Method(mockSerial,available)).Return(7,6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return('X',COMMAND_START_TOKEN,'C',COMMAND_END_TOKEN,COMMAND_START_TOKEN,'D',COMMAND_END_TOKEN);

        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("C",nextCommand);
    }

    void givenTwoCommandAvailableSuroundedByJunk_thenSecondCommandReturnedOnSecondInvocation() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer<20> target(mockSerial.get());

        When(Method(mockSerial,available)).Return(7,6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return('X',COMMAND_START_TOKEN,'C',COMMAND_END_TOKEN,COMMAND_START_TOKEN,'D',COMMAND_END_TOKEN);

        target.tryGetNextCommand();
        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("D",nextCommand);
    }

    void givenHalfCommandAvailableOnFirstInvocationAndOtherHalfAvailableOnSecond_thenSecondInvocationReturnsCommand() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer<20> target(mockSerial.get());

        When(Method(mockSerial,available)).Return(3,2,1,0);
        When(Method(mockSerial,read)).Return(COMMAND_START_TOKEN,'C','D');

        target.tryGetNextCommand();

        When(Method(mockSerial,available)).Return(3,2,1,0);
        When(Method(mockSerial,read)).Return('E','F',COMMAND_END_TOKEN);

        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("CDEF",nextCommand);
    }
}


#endif
