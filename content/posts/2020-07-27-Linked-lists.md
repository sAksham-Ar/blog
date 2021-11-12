+++
title="Linked lists"
date=2020-07-27

[taxonomies]
categories = ["C++"]

[extra]
toc = true
comments = true
+++

In link list a structure is declared as head and it has a next pointer which points to next item in the list and similarly all items have a next pointer.The next pointer of the last element points to `NULL`.The program goes as long as user does not input `n`.The user has two options whether to insert or delete from the list.In insert we declare a temporary variable `temp` which contains the number to insert which is done by putting `temp->next=head` and `head=temp` which means that now head points to temp and temp points to the element which was previously head.Delete is done by simply putting `head` equal to its next element.

```cpp
#include<iostream>
using namespace std;
struct Linkedlist
{
    int a;
    struct Linkedlist* next;
};
LinkedList* head;
void insert(int num)
{
    Linkedlist* temp;
    temp= new Linkedlist;
    temp->a=num;
    if(head!=NULL)
    {
        temp->next=head;
    }
    else
    {
        temp->next=NULL;
    }
    head=temp;
}
int del()
{
    if(head==NULL)
    {
        return -1;
    }
    Linkedlist *temp;
    temp=head;
    head=head->next;
    return temp->a;
}
int main()
{
    head=new Linkedlist;
    char choice;
    int c,num;
    do
    {
        cout<<"1:Insert an element\n";
        cout<<"2:Delete an element\n";
        cin>>c;
        switch(c)
        {
            case 1:
                cout<<"Enter number to insert:";
                cin>>num;
                insert(num);
                cout<<"\n";
                break;
            case 2:
                num=del();
                if(num!=-1)
                {
                    cout<<"The deleted number is:"<<num<<"\n";
                }
                else
                {
                    cout<<"list is empty\n";
                }
                break;
            default:
                cout<<"Wrong choice\n";
        }
        cout<<"Do you want to continue?(y/n)\n";
        cin>>choice;
    }while(choice=='y');
    return 0;
}
```
**OUTPUT:**

![output](/assets/Linked-lists.png)
