DROP DATABASE IF EXISTS employeeTrackerDB;

CREATE DATABASE employeeTrackerDB;

USE employeeTrackerDB;

CREATE TABLE employees (
    id INTEGER NOT NULL AUTO_INCREMENT,
    firstName VARCHAR(30),
    lastName VARCHAR(30),
    role_id INTEGER,
    manager_id INTEGER,
    PRIMARY KEY (id)
);

CREATE TABLE departments (
    id INTEGER NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    PRIMARY KEY (id)
);

CREATE TABLE roles (
    id INTEGER NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL(10,2),
    department_id INTEGER,
    PRIMARY KEY (id)
);

INSERT INTO departments (name)
VALUES ("Sales"),("CustomerService"),("IT");

INSERT INTO roles (title, salary, department_id)
VALUES ("Manager",250000.00,1),("Principle Software Engineer",150000.00,1),("Senior Software Engineer",105000.00,1),
("Software Engineer",950000.00,2),
("Master Software Engineer",165000.00,3),("Junior Software Engineer",90000.00,3);

INSERT INTO employees (firstName, lastName, role_id, manager_id)
VALUES ("John","Doe",1,null),("Jane","Doe",2,1),("James", "Smith",3,1),
("John","Anderson",4,null),
("Ricky","Ponting",5,null),("Michael","Clarke",6,5);