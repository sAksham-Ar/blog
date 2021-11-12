+++
title="Using Selenium in Python"
date=2021-04-29

[taxonomies]
categories = ["Python"]

[extra]
toc = true
comments = true
+++

Today we are going to learn how to automate your browser using Selenium in Python.Today we will go to Youtube search something and store the results as JSON.Scraping Youtube results is not possible using normal webscraping as it uses a JS framework.

## Requirements

For web scraping we would require selenium library.

Just install it with pip as:

```bash
pip3 install selenium
```
You would also require [chromedriver](https://chromedriver.chromium.org/downloads) if you have Chrome or [geckodriver](https://github.com/mozilla/geckodriver/releases) if you have Firefox.

## Starting

Firstly, we would need to import the required libraries:

```py
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import os
import json
from time import sleep
```
Now, we would need to provide the path for our chromedriver or geckodriver.(*NOTE:I have kept the chromedriver in the same directory as my python script.*)

In python in Windows this would look like:

```py
driver=webdriver.Chrome(os.getcwd()+"/chromedriver.exe")
```
For Firefox:

```py
driver=webdriver.Firefox(os.getcwd()+"/geckodriver.exe")
```
We will now navigate to the youtube website.

```py
url="https://www.youtube.com/"
driver.get(url)
```
Now the browser will go to youtube.com .

## Searching a video

The best way in my opinion to learn selenium is running it in interactive mode.So through command line navigate to where your script is and run:
```bash
python3 -i your_file_name.py
```
You will see that a browser has opened and it has navigated to youtube.com.

Next we need to get the serach bar, we do this by clicking inspect element on it.

![search div](/assets/selenium-search.jpg)

From this photo we can see that it is an input element ```id``` search. We get that element using selenium:
```py
search=driver.find_element_by_xpath("//input[@id='search']")
```
Now we send what we want to type:

```py
search.send_keys("foo bar")
```
As you can see foo bar is typed in the search bar.Now sending enter to search:

```py
search.send_keys(Keys.RETURN)
```
Now it should have opened the results page.

## Storing it as JSON

We now need to store the title and links of videos so we first inspect element the title to find which element they are in.

![search div](/assets/selenium-title.jpg)

We see that they are in an ```a``` element with ```id = video-title```. So we just find all of these and store the href and title in a list.

```py
videos=driver.find_elements_by_xpath("//a[@id='video-title']")

ResultList=[]
for video in videos:
    ResultDict={}
    ResultDict["title"]=video.get_attribute("title")
    ResultDict["link"]=video.get_Attribute("href")
    ResultList.append(ResultDict)

print(json.dumps(ResultList,indent=4))
```
Output:

![output](/assets/selenium-output.jpg)

## Entire Code

```py
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import os
import json
from time import sleep

driver=webdriver.Chrome(os.getcwd()+"/chromedriver.exe")

url="https://www.youtube.com/"
driver.get(url)

search=driver.find_element_by_xpath("//input[@id='search']")
search.send_keys("foo bar")
sleep(1)#waiting for the text to be typed
search.send_keys(Keys.RETURN)

sleep(2)# to give time for the search to load
videos=driver.find_elements_by_xpath("//a[@id='video-title']")

ResultList=[]
for video in videos:
    ResultDict={}
    ResultDict["title"]=video.get_attribute("title")
    ResultDict["link"]=video.get_attribute("href")
    ResultList.append(ResultDict)

print(json.dumps(ResultList,indent=4))

driver.quit()#closing the browser
```
## Conclusion

This is just a small part of what selenium can do, read more [here](https://selenium-python.readthedocs.io/). Have fun experimenting with this!
