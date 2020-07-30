#ifndef _ITestDependency_
#define _ITestDependency_

namespace phishpi {
    class ITestDependency;
};

 class phishpi::ITestDependency {

    public:
    virtual void doSomething() = 0;
    virtual char * greetMe(const char * myName) =0;
};

#endif
