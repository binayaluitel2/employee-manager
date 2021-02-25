
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