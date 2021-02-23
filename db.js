const mysql = require("mysql");
require("dotenv").config();
require("console.table");

const connectionInfo = require("./dbinfo");
const app = require("./index.js");

console.log(app);

const db = mysql.createConnection({
  host: connectionInfo.db_host,
  port: connectionInfo.db_port,
  user: connectionInfo.db_user,
  password: connectionInfo.db_pass,
  database: "employeeTrackerDB",
});

db.connect((err) => {
  if (err) throw err;
  app.init();
});

var showAll = (table_name) => {
  let query = "";
  let cb = "";
  if (table_name === "employees") {
    query = `SELECT emp1.firstName AS 'First Name', emp1.lastName AS 'Last Name', title AS 'Title', name AS 'Department', salary AS 'Salary', GROUP_CONCAT(DISTINCT emp2.firstName,' ', emp2.lastName) AS 'Manager'
        FROM employees emp1
        JOIN roles ON emp1.role_id = roles.id
        JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees emp2 ON emp1.manager_id = emp2.id
        GROUP BY emp1.id
        ORDER BY emp1.lastName ASC`;
  } else if (table_name === "roles") {
    query = `SELECT title AS 'Position', name AS 'Department', salary AS 'Salary', COUNT(employees.role_id) AS 'Total Employees'
        FROM roles
        LEFT OUTER JOIN departments ON roles.department_id = departments.id
        LEFT OUTER JOIN employees ON employees.role_id = roles.id
        GROUP BY roles.id
        ORDER BY title ASC`;
  } else if (table_name === "departments") {
    query = `SELECT name AS 'Department', COUNT(roles.department_id) AS 'Total Roles'
        FROM departments
        LEFT OUTER JOIN roles ON roles.department_id = departments.id
        GROUP BY departments.id
        ORDER BY name ASC`;
  }

  db.query(query, table_name, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    app.crudPrompt(table_name, false);
  });
};

var createRow = (data, table_name) => {
  db.query(`INSERT INTO ${table_name} SET ?`, [data], function (err, res) {
    if (err) throw err;
    console.log("\nSuccess! Added to " + table_name + ".\n");
    app.mainPrompt();
  });
};

var getSpecific = (columns, table) => {
  return new Promise(function (resolve, reject) {
    db.query(`SELECT ${columns} FROM ${table}`, (err, res) => {
      if (err) throw err;

      if (res === undefined) {
        reject(new Error("Not found."));
      } else {
        resolve(res);
      }
    });
  });
};

var getEmployeeChoices = () => {
  return getSpecific("id,firstName,lastName", "employees").then((res) => {
    let employeeChoices = [];
    res.forEach((choice) => {
      employeeChoices.push({
        name: choice.firstName + " " + choice.lastName,
        value: choice.id,
      });
    });
    return new Promise(function (resolve, reject) {
      if (employeeChoices.length > 0) {
        resolve(employeeChoices);
      } else {
        reject(new Error("There was a problem retrieving employees"));
      }
    });
  });
};

var getRoleChoices = () => {};

var getDepartmentChoices = () => {};

module.exports = {
  connection: db,
  getSpecific: getSpecific,
  showAll: showAll,
  createRow: createRow,
  choices: {
    employees: getEmployeeChoices,
    roles: getRoleChoices,
    departments: getDepartmentChoices,
  },
};
