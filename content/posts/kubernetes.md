+++
title="Deploying Microservices on Kubernetes"
date=2022-03-24
description = "This blog describes how I deployed microservices on Kubernetes for the OpenSoft event."

[taxonomies]
categories = ["Kubernetes"]

[extra]
toc = true
comments = true
+++

## Introduction

This Year's Opensoft Problem Statement was very interesting from a DevOps perspective. Basically, we had to convert a Monolithic Application to Microservices, Dockerize the microservices and then deploy them on Kubernetes.

## Initial Set-up

We choose Google Kubernetes Engine for hosting because of their very good free trial($300 in credits for first three months). Using local docker images would have been very time-consuming as we had to make sure they were present on all the nodes, I decided to push my images to GitHub Container Registry.

Firstly, creating a Personal Access Token on GitHub and logging in on GHCR from docker,

```bash
export CR_PAT=YOUR_TOKEN
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
```
Then tagging and pushing the image on ghcr, 

```bash
docker tag image_name ghcr.io/github_username/image_name
docker push ghcr.io/github_username/image_name
```
Then, I created a cluster on GKE. I also downloaded the `google-cloud-sdk` and authorized it so that I could control the remote cluster using the `kubectl` command on my system,

```bash
gcloud auth
gcloud container clusters get-credentials cluster_name --zone zone_name --project project_name
```

Creating a secret to pull images from ghcr,

```bash
kubectl create secret docker-registry github-secret --docker-server=https://ghcr.io --docker-username=github_username --docker-password=github_pat --docker-email=github_email
```

## Deploying a MicroService

Firstly, we created the deployment of the database for the microservice. Here we are using Postgres,

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: restaurant-db-deployment
  labels:
    type: essential
spec:
  selector:
    matchLabels:
      name: restaurant-db
  replicas: 1
  template:
    metadata:
      name: restaurant-db-pod
      labels:
        name: restaurant-db
    spec:
      containers: 
      - name: restaurant-db-container
        image: postgres
        env:
        - name: POSTGRES_USER
          value: restaurant
        - name: POSTGRES_PASSWORD
          value: restaurant
        - name: POSTGRES_DB
          value: restaurant
        volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: postgredb
              subPath: postgres
      volumes:
        - name: postgredb
          persistentVolumeClaim:
            claimName: restaurant-db-pvc
```
**Note: without `subPath` the pod does not start. ([see here for more details.](https://stackoverflow.com/questions/51168558/how-to-mount-a-postgresql-volume-using-aws-ebs-in-kubernete))**

As we want our database data to persist, we need to create a Persistent Volume Claim.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: restaurant-db-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

We do not need to create a Persistent Volume as GKE automatically provisions a Persistent Volume when a PVC is bound.

For the microservice we first create the config map,

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: restaurant-config
data:
  DJANGO_SECRET_KEY: XXXXX
  DJANGO_DEBUG: "True"
  RABBITMQ_URL: XXXXX
  IS_DEPLOYED: "True"
  PORT: "8000"
  DATABASE_URL: postgres://restaurant:restaurant@restaurant-db/restaurant
```

We are using RabbitMQ to keep our databases in sync, read more [here.](@/posts/rabbitmq.md)

After the Config Map, we create the deployment for the microservice,

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: restaurant-ms-deployment
  labels:
    type: essential
spec:
  selector:
    matchLabels:
      name: restaurant-ms
  replicas: 3
  template:
    metadata:
      name: restaurant-ms-pod
      labels:
        name: restaurant-ms
    spec:
      containers:
      - name: restaurant-ms-container
        image: ghcr.io/saksham-ar/restaurant-ms:v2
        command: ["/bin/sh","-c"]
        args: ["python manage.py migrate &&
          python manage.py collectstatic --noinput &&
          python manage.py runserver 0.0.0.0:8000"]
        envFrom:
          - configMapRef:
              name: restaurant-config
      imagePullSecrets:
        - name: github-secret
```

## Creating Services

Till this point, we have written the deployment files but, there is no way for the microservice deployment to access the database. For this we create a service `ClusterIp`,

```yaml
apiVersion: v1
kind: Service
metadata:
  name: restaurant-db
  labels:
    app: restaurant-ms
spec:
  selector:
    name: restaurant-db
  ports:
    - port: 5432
      targetPort: 5432
```
This microservice will access this through the `DATABASE_URL` we have given in the Config Map of the microservice. Now starting the microservice with,

```bash
kubectl create -f restaurant-config.yml
kubectl create -f restaurant-db-pvc.yml
kubectl create -f restaurant-db-deploy.yml
kubectl create -f restaurant-db-service.yml
kubectl create -f restaurant-deploy.yml
```

Now to make the microservice accessible on a port on the nodes we create a `NodePort` microservice,

```yaml
apiVersion: v1
kind: Service
metadata:
  name: restaurant-ms-service
  labels:
    app: restaurant-ms
spec:
  type: NodePort
  selector:
    name: restaurant-ms
  ports:
    - port: 8000
      targetPort: 8000
      nodePort: 30006
```
Starting this will make the microservice available on the port `30006` of all nodes,

```bash
kubectl create -f restaurant-service.yml
```

## Ingress

Now, we can see the microservice on `http://node-ip:30006` of all nodes but, we want only a singular ip that can send the request to all nodes. This is where Load Balancer and Ingress are useful.  

I am using `nginx-ingress-controller` here. Installing from helm,


```bash
helm install nginx-ingress nginx-stable/nginx-ingress --set prometheus.create=true
```

`prometheus.create=true` provides metrics from nginx for prometheus. 

This automatically provisions a load balancer in Google Cloud which will give us a Singular IP. Now we need to define rules for routing, so we can access multiple microservices from the same IP,

```yaml
apiVersion: k8s.nginx.org/v1
kind: VirtualServer
metadata:
  name: ingress
spec:
  host: opensoft.example.com
  upstreams:
  - name: restaurant
    service: restaurant-ms-service
    port: 8000
  
  routes:
  - path: ~/restaurant/?(.*)
    action:
      proxy:
        upstream: restaurant
        rewritePath: /$1
``` 

The `rewritePath` here converts `/restaurant/login` to `/login` so, we would not need to change the routes in all our microservices. Applying this, we can access our microservice at `http://load-balancer-ip/restaurant`.

```bash
kubectl apply -f ingress.yml
```
## Conclusion

This is how we deployed our microservices on Kubernetes. You can read the entire Problem Statement [here.](https://drive.google.com/file/d/1Mv5Ro2gi5nl3zGhA4IR3NMpwZdXXmL2M/view?fbclid=IwAR3IrikkanZaprOreedwmbIFp5YtudefssTREd5RFByRYoBKcOGG2QpotUw)