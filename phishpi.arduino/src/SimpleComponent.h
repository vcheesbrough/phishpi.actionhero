#ifndef _SimpleComponent_
#define _SimpleComponent_

#include "ITestDependency.h"

namespace phishpi {
    class SimpleComponent;
}

class phishpi::SimpleComponent {
    private:
    ITestDependency& dependancy;
    public:

    SimpleComponent(ITestDependency& dependancy)
        :dependancy(dependancy) {

    }

    bool thisReturnsTrue() {
        return true;
    }

    void invokeDoSomethingOnDependency() {
        dependancy.doSomething();
    }

    char * getGreetingFromDependency(const char* name) {
        return dependancy.greetMe(name);
    }
};

#endif