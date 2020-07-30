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
    #endif
}