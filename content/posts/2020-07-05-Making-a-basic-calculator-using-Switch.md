+++
title="Making a basic calculator using Switch"
date=2020-07-05

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

Switch in C++ is basically like a menu.If the variable in the switch bracket is equal to the any case then the code in that specific case and subsequent cases gets executed until it encounters a `break`.If none of the cases match then  default statement gets executed.The `(float)y` is to covert y to type float so decimal answers will be printed.

```cpp
#include<iostream>
using namespace std;
int main()
{
    int x,y,choice;
    cout<<"Enter both numbers:\n";
    cin>>x>>y;
    cout<<"1.Add them\n";
    cout<<"2.Subtract them\n";
    cout<<"3.Multiply them\n";
    cout<<"4.Divide First by second\n";
    cout<<"5.Find the remainder when one gets divided by other\n";
    cout<<"Enter your choice:\n";
    cin>>choice;
    switch(choice)
    {
        case 1:cout<<x+y;
           break;
        case 2:cout<<x-y;
           break;
        case 3:cout<<x*y;
           break;
        case 4:cout<<x/(float)y;
           break;
        case 5:cout<<x%y;
           break;
        default:cout<<"wrong choice\n";
    }
    return 0;
}
```
**OUTPUT:**

![output](/assets/Making-a-basic-calculator-using-Switch.png)