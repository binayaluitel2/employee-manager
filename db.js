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

var showAll = (table_name, callback) => {
  let query = "";
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
    callback();
  });
};

var createRow = (data, table_name) => {
  db.query(`INSERT INTO ${table_name} SET ?`, [data], function (err, res) {
    if (err) throw err;
    console.log("\nSuccess! Added to " + table_name + ".\n");
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

var update = (table_name, new_data, id) => {
  db.query(
    "UPDATE ?? SET ? WHERE ?",
    [table_name, new_data, id],
    function (err, res) {
      console.log("\nSuccessfully updated employee!\n");
    }
  );
};

var deleteRow = (table_name, id, callback) => {
  db.query("DELETE FROM ?? WHERE ?", [table_name, id], function (err, res) {
    if (table_name === "roles") {
      db.query(
        "DELETE FROM employees WHERE role_id IN (SELECT role_id FROM roles WHERE role_id = ?);",
        [id.id],
        function (err, result) {
          if (err) throw err;
          console.log(
            "\n Successfully deleted role and all employees associated with it.\n"
          );
          return callback();
        }
      );
    } else if (table_name === "departments") {
      db.query(
        "DELETE FROM employees WHERE role_id IN (SELECT id FROM roles WHERE department_id = " +
          id.id +
          ");",
        function (err, result) {
          if (err) throw err;
          db.query(
            "DELETE FROM roles WHERE department_id = ?",
            [id.id],
            function (err, result) {
              if (err) throw err;
              console.log(
                "\n Successfully deleted department and the roles and employees associated with it. \n"
              );
              callback();
            }
          );
        }
      );
    } else if (table_name === "employees") {
      console.log("\n Successfully deleted employee.\n");
      callback();
    }
  });
};

var getEmployeeChoices = function () {
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

var getRoleChoices = function () {
  return getSpecific("id,title", "roles").then((res) => {
    let roleChoices = [];
    res.forEach((choice) => {
      roleChoices.push({ name: choice.title, value: choice.id });
    });
    return new Promise(function (resolve, reject) {
      if (roleChoices.length > 0) {
        resolve(roleChoices);
      } else {
        reject(new Error("There was a problem retrieving roles."));
      }
    });
  });
};

var getDepartmentChoices = function () {
  return getSpecific("id,name", "departments").then((res) => {
    let departmentChoices = [];
    res.forEach((choice) => {
      departmentChoices.push({ name: choice.name, value: choice.id });
    });
    return new Promise(function (resolve, reject) {
      if (departmentChoices.length > 0) {
        resolve(departmentChoices);
      } else {
        reject(new Error("There was a problem retrieving departments."));
      }
    });
  });
};

module.exports = {
  connection: db,
  getSpecific: getSpecific,
  showAll: showAll,
  createRow: createRow,
  update: update,
  deleteRow: deleteRow,
  choices: {
    employees: getEmployeeChoices,
    roles: getRoleChoices,
    departments: getDepartmentChoices,
  },
};
