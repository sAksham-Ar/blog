+++
title="Double pointer"
date=2020-07-22

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

We use double pointer or pointer to a pointer for things like dynamically declaring 2d arrays where we first dynamically declare its rows as 1d arrays and then for each row we declare its columns.The name of pointer points to address of the first row or to the pointer that points to first element of the first row.One `*` with the pointer points to the address of the first element of the first row and with two `*` it points to its value.

```cpp
#include<iostream>
using namespace std;
int main()
{
    int **a,m,n,i;
    cout<<"Enter rows:\n";
    cin>>m;
    cout<<"Enter columns:\n";
    cin>>n;
    a=new int*[m];
    for(i=0;i<n;i++)
    {
        a[i]=new int[n];
    }
    a[0][0]=5;
    cout<<"Address of first row:"<<&a[0]<<" and "<<a<<"\n";
    cout<<"Address of first elment of first row:"<<&a[0][0]<<" and "<<*a<<'\n';
    cout<<"Value of first element of first row:"<<a[0][0]<<" and "<<**a<<'\n';
    return 0;
}
```
**OUTPUT:**

![output](/assets/Double-pointer.png)
