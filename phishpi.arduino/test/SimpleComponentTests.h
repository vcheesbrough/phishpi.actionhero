#include "SimpleComponent.h"
#include <unity.h>
#include "ITestDependency.h"

 #ifndef ARDUINO
#include "fakeit.h"
using namespace fakeit;
#endif

namespace SimpleComponentTests
{
    class FakeTestDependency : public phishpi::ITestDependency
    {
        public:
        virtual void doSomething() {}
        virtual char * greetMe(const char * myName) {return "Fake says Hello!";}
    };

    void thisReturnsTrue() {
        FakeTestDependency fakeDepend;
        phishpi::SimpleComponent target(fakeDepend);

        TEST_ASSERT_TRUE(target.thisReturnsTrue());
    }

    #ifndef ARDUINO
    void dependencyIsInvoked() {
        Mock<phishpi::ITestDependency> mock;
        When(Method(mock,doSomething)).Return();
        phishpi::ITestDependency & mockDependency = mock.get();
        phishpi::SimpleComponent target(mockDependency);

        target.invokeDoSomethingOnDependency();

        Verify(Method(mock,doSomething));
    }

    void valueIsReturnedFromDependency() {
        Mock<phishpi::ITestDependency> mock;
        When(Method(mock,greetMe)).Do([](const char * name)-> char *{return "Hello Person";});

        phishpi::ITestDependency & mockDependency = mock.get();
        phishpi::SimpleComponent target(mockDependency);

        const char * greeting = target.getGreetingFromDependency("Name");

        TEST_ASSERT_EQUAL("Hello Person",greeting);

        Verify(Method(mock,greetMe).Using("Name")).Once();
    }
    #endif
}