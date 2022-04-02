+++
title="Keeping Microservices in Sync using RabbitMQ"
date=2022-03-25
description = "This blog describes how we kept our microservices in sync with RabbitMQ for Opensoft event."

[taxonomies]
categories = ["RabbitMQ"]

[extra]
toc = true
comments = true
+++

## Introduction

This Year's Opensoft Problem Statement was very interesting from a DevOps perspective. Basically, we had to convert a Monolithic Application to Microservices, Dockerize the microservices and then deploy them on Kubernetes.

## The Problem

We have created 7 microservices and each microservice has its own database, but some data has to be shared between multiple microservices. Keeping a single database for these defeats the point of creating microservices. We ended up using [RabbitMQ](https://www.rabbitmq.com/) for keeping the important data in sync between microservices.

## RabbitMQ

In RabbitMQ, each microservice has its own queue and all essential microservices can produce data to these queues. We used `fanout` type of exchange where every producer published to all the queues. Each microservice then consumes the message and acts according to the `properties.content_type` which we sent during producing.

## Producing

For producing in Django, we just have to write a `producer.py`,

```python
import pika, json
from django.conf import settings

RABBITMQ_URL = settings.RABBITMQ_URL
params = pika.URLParameters(RABBITMQ_URL+"?heartbeat=600&"+"blocked_connection_timeout=300")

def publish(method, body):
    connection = pika.BlockingConnection(params)

    exchange_queue = 'logs'
    channel = connection.channel()
    channel.exchange_declare(exchange=exchange_queue, exchange_type='fanout')   

    properties = pika.BasicProperties(method)
    channel.basic_publish(exchange=exchange_queue, routing_key='', body=json.dumps(body), properties=properties)

    connection.close()
```

Now wherever we want to publish, we just import the publish function and send the method(which defines the `properties.content_type`) and the body.

## Consuming

For consuming, we have to write a `consumer.py`. An example from the Restaurant Menu microservice which keeps track of items of each restaurant,

```python
import pika, json
import os
import django
from sys import path

path.append(os.getcwd()+'/restaurant_menu/settings.py')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_menu.settings') 
django.setup()
from restaurant_menu_app.models import Restaurant, MenuItem
from restaurant_menu_app.serializers import RestaurantSerializer, MenuItemSerializer
from django.conf import settings
from django.contrib.auth.hashers import make_password
from restaurant_menu_app.producer import publish

RABBITMQ_URL = settings.RABBITMQ_URL

params = pika.URLParameters(RABBITMQ_URL)
connection = pika.BlockingConnection(params)

exchange_queue = 'logs'
channel = connection.channel()
channel.exchange_declare(exchange=exchange_queue, exchange_type='fanout')

result = channel.queue_declare(queue='', exclusive=True)
queue_name = result.method.queue

exchange_queue = 'logs'
channel.queue_bind(exchange=exchange_queue, queue=queue_name)

def callback(ch, method, properties, body):
    print("Received in Restaurant Menu Item Application", flush=True)
    data = json.loads(body)

    elif properties.content_type == 'RESTAURANT_CREATED':
        data["password"] = make_password(data["password"])
        serializer = RestaurantSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
```

We have to run `consumer.py` separate from our Django application and this will keep the important data in sync.

## Syncing Data between Clusters

For the Problem Statement we had to deploy 2 clusters. For keeping the data of same microservices in sync in different clusters, what we did was when a new data was being sent to the backend we did not save it, rather we published to RabbitMQ. The RabbitMQ queue does the job of keeping the data in sync with the same microservice from the other cluster. For example in `consumer.py` of the Restaurant microservice,

```python
    if(properties.content_type=="RESTAURANT_SIGNUP"):
        # If a restaurnat signups
        raw_password = data["password"]
        data["password"] = make_password(raw_password)
        serializer = RestaurantSerializer(data=data)
        if(serializer.is_valid()):
            restaurant = serializer.save()
            data_to_be_published = {
                'restaurant_id': restaurant.restaurant_id,
                'email': data['email'],
                'password': raw_password,
                "restaurant_name": data['restaurant_name']
            }
            publish(method="RESTAURANT_CREATED", body=data_to_be_published)
```

## Problems we faced

RabbitMQ was very hard to debug as if a consumer errors out the data in the microservices becomes inconsistent leading to strange behaviour in the app. We were using RabbitMQ hosted on [CloudAMQP](https://www.cloudamqp.com/) which sometimes force closed the connection to consumers and that lead to features stopping randomly. Working with RabbitMQ was a very frustrating experience for us and [Apache Kafka](https://kafka.apache.org/) or [Amazon SQS](https://aws.amazon.com/sqs/) may yield better results.

## Conclusion

This is how we kept our microservices in sync. You can read the entire Problem Statement [here.](https://drive.google.com/file/d/1Mv5Ro2gi5nl3zGhA4IR3NMpwZdXXmL2M/view?fbclid=IwAR3IrikkanZaprOreedwmbIFp5YtudefssTREd5RFByRYoBKcOGG2QpotUw)