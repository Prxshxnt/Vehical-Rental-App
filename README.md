# 🚗 Vehicle Rental System

A full-stack vehicle rental web application with JWT authentication and role-based access.

---

🔧 **Tech Stack**

* Java 17
* Spring Boot 3.x
* Spring Security + JWT
* Spring Data JPA
* MySQL
* React.js + Vite
* Maven

---

✨ **Features**

* User Registration & Login (JWT Auth)
* Browse Available Vehicles
* Book a Vehicle (with date range & cost calculation)
* Cancel Booking
* Admin: Add / Update / Delete Vehicles
* Admin: View All Bookings
* Role-based Access (USER / ADMIN)

---

▶️ **Run Project**

1. Clone the repository
2. Create MySQL database (`vehicle_rental_db`)
3. Update database details in `application.properties`
4. Set your JWT secret key in `application.properties`
5. Run `VehicleRentalApplication.java`
6. Start frontend: `npm install && npm run dev`
7. Access APIs using Postman

---

🔗 **API Endpoints**

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/vehicles
GET    /api/vehicles/{id}
POST   /api/vehicles          (Admin)
PUT    /api/vehicles/{id}     (Admin)
DELETE /api/vehicles/{id}     (Admin)

POST   /api/bookings
GET    /api/bookings/my
DELETE /api/bookings/{id}
GET    /api/bookings          (Admin)
```

---

🗄️ **Database**

* MySQL
* Tables auto-created using JPA (`spring.jpa.hibernate.ddl-auto=update`)
* Entities: `User`, `Vehicle`, `Booking`

---

📌 **Project Type**

* Full-Stack Web Application
* Backend: Spring Boot REST API
* Frontend: React + Vite
* Practice Project — Java / Spring Boot / JWT Authentication
