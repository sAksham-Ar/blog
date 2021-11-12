+++
title="Functions"
date=2020-07-12

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

The use of functions in C++ is when we have to run the same bit of code multiple times so instead we declare a function and call it any time we have to run the code.A function has 3 parts:prototype,definition and a statement to call the function.In protoype the name of the function,the parameters(values which are given to the function) and return type(which specifies the values which it would return,void means it returns nothing).The definition is where the main code is written.The statement to call the function contains the function's name and parameters.There are two ways of giving the parameters, call by value and call by reference.In call by value a copy of the parameters is passed so the value of the original variables does not change while in call by reference  the original variable is passed under an alias so changing its value in the function changes the value of the original variable.Arrays by default are passed by reference.The protoype has to be given before calling the function,the definition however can even be given after the function is called.The words written after two forward slashes are comments,they are not executed.

```cpp
#include<iostream>
using namespace std;
void printarray(int a[])//prototype
{                                   //defintion
    int i=0;
    for(i=0;i<5;i++)
    {
        cout<<a[i]<<' ';
    }
    cout<<'\n';
}
void increment(int a,int& b); //a is called by value while b is by reference
int main()
{
    int a=8,b=8,A[]={1,2,3,4,5},B[]={6,7,8,9,10};
    cout<<"A:\n";
    printarray(A);     //calling the function
    cout<<"B:\n";
    printarray(B);
    increment(a,b);
    cout<<"a="<<a<<' '<<"b="<<b;
    return 0;
}
void increment(int a,int& b)//definition
{
    a++;
    b++;
}
```
**OUTPUT:**

![output](/assets/Functions.png)