# 🏛️ University Backend Project - Microservices Architecture

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![Keycloak](https://img.shields.io/badge/Keycloak-772953?style=for-the-badge&logo=keycloak&logoColor=white)

This repository contains my **first university project** exploring **microservices architecture**, **TypeScript backend**, **MongoDB**, and **Keycloak integration** for authentication. The project implements **clean code principles** without overly complex functions, focusing on modularity and maintainability.

---

## **Project Overview**

This project demonstrates the **use of microservices** in a university context. It is designed to handle multiple responsibilities separately, enabling:

- Scalable and modular backend design  
- Clean separation of concerns for easier maintenance  
- Integration of modern authentication mechanisms (Keycloak)  
- Efficient management of API endpoints via an **API Gateway**  

---

## **Architecture**

The project uses a **microservices architecture** with an **API Gateway** managing all endpoints. Each service has a distinct responsibility and communicates through the gateway.  
| Service     | Responsibility                        | Tech/Notes                                                                    |
| ----------- | ------------------------------------- | -------------------------------------------------                             |
| Authentication| Integrated Keycloack, provides roles| TypeScript, tocken validation and access control                              |
| Backend     | Miscellaneous auxiliary tasks         | MongoDB, separate database models,no overly complex functions                 |
| API Gateway | Central routing & endpoint management | Express.js, routes all requests to proper service                             |

## **Frontend**
Built with **Vue.js + JavaScript**
Communicates with backend through **API Gateway**
Handles authentication redirects and token storage
Provides a user-friendly interface for interacting with microservices

---

## **Tech Stack**

- **Backend:** TypeScript, Node.js, Express.js, Microservices  
- **Database:** MongoDB  
- **Frontend:** Vue.js + JavaScript  
- **Authentication:** Keycloak  
- **Architecture:** API Gateway, Microservices, Clean Code  

---
