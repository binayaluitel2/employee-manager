const inquirer = require("inquirer");
const db = require("./db.js");
const ascii = require("ascii-art-font");

var init = () => {
  console.log("\n" + "=".repeat(62) + "\n");
  ascii.create("    Employee", "Doom", (err, result) => {
    if (err) throw err;
    console.log(result);
    ascii.create("      Manager", "Doom", (err, result) => {
      if (err) throw err;
      console.log(result);
      console.log("\n" + "=".repeat(62) + "\n");
      mainPrompt();
    });
  });
};

var mainPrompt = () => {
  inquirer
    .prompt([
      {
        message: "What do you want to do?",
        type: "list",
        name: "doWhat",
        choices: ["View", "Add", "Edit", "Remove", "Quit"],
      },
    ])
    .then((answers) => {
      switch (answers.doWhat) {
        case "View":
          return viewPrompt();
        case "Add":
          return createPrompt(false);
        case "Edit":
          return updatePrompt(false);
        case "Remove":
          return removePrompt(false);
        case "Quit":
          return quitApp();
      }
    });
};

function viewPrompt() {
  inquirer
    .prompt([
      {
        message: "View:",
        type: "list",
        name: "table_name",
        choices: [
          { name: "All Employees", value: "employees" },
          { name: "All Departments", value: "departments" },
          { name: "All Roles", value: "roles" },
        ],
      },
    ])
    .then((answers) => {
      db.showAll(answers.table_name, function () {
        postViewPrompt(answers.table_name);
      });
    });
}

var postViewPrompt = (table_name) => {
  let prettyName = prettify(table_name);

  let choices = [
    {
      name: "Add " + prettyName,
      value: "create",
    },
    {
      name: "Update " + prettyName,
      value: "update",
    },
    {
      name: "Remove " + prettyName,
      value: "delete",
    },
    {
      name: "Back to View Menu",
      value: "view",
    },
    {
      name: "Back to Main Menu",
      value: "main",
    },
    {
      name: "Quit",
      value: "quit",
    },
  ];

  inquirer
    .prompt([
      {
        message: "What would you like to do?",
        type: "list",
        name: "doWhat",
        choices,
      },
    ])
    .then((answers) => {
      switch (answers.doWhat) {
        case "create":
          return createPrompt(table_name);
        case "update":
          return updatePrompt(table_name);
        case "remove":
          return removePrompt(table_name);
        case "view":
          return viewPrompt();
        case "main":
          return mainPrompt();
        case "quit":
          return quitApp();
      }
    });
};

function createPrompt(table_name) {
  if (table_name === false) {
    inquirer
      .prompt([
        {
          message: "What do you want to add?",
          name: "table_name",
          type: "list",
          choices: [
            {
              name: "New Employee",
              value: "employees",
            },
            {
              name: "New Role",
              value: "roles",
            },
            {
              name: "New Department",
              value: "departments",
            },
            {
              name: "Back to Main Menu",
              value: "mainMenu",
            },
          ],
        },
      ])
      .then((answers) => {
        if (answers.table_name === "mainMenu") return mainPrompt();

        return createPrompt(answers.table_name);
      });
  }

  if (table_name === "employees") {
    let questions = [
      {
        message: "First Name:",
        name: "firstName",
      },
      {
        message: "Last Name:",
        name: "lastName",
      },
    ];

    db.choices.roles().then((res) => {
      questions.push(formatListQuestion("role", "role_id", res));
      db.choices.employees().then((res) => {
        questions.push({
          message: "Select manager:",
          type: "list",
          name: "manager_id",
          choices: res,
        });
        inquirer.prompt(questions).then((answers) => {
          db.createRow(answers, table_name);
        });
      });
    });
  } else if (table_name === "roles") {
    let questions = [
      {
        message: "Role Title:",
        name: "title",
      },
      {
        message: "Salary",
        name: "salary",
        validate: (salary) => {
          if (isNaN(salary)) {
            console.log(
              "\n Invalid: Must be a number. Do not include decimals."
            );
            return false;
          } else {
            return true;
          }
        },
      },
    ];

    db.choices.departments().then((res) => {
      questions.push(formatListQuestion("department", "department_id", res));
      inquirer.prompt(questions).then((answers) => {
        db.createRow(answers, table_name);
      });
    });
  } else if (table_name === "departments") {
    inquirer
      .prompt([
        {
          message: "Department Name:",
          name: "name",
        },
      ])
      .then((answers) => {
        db.createRow(answers, table_name);
      });
  }
}

function updatePrompt(table_name) {
  if (table_name === false) {
    inquirer
      .prompt([
        {
          message: "What do you want to edit?",
          name: "table_name",
          type: "list",
          choices: [
            {
              name: "Employee",
              value: "employees",
            },
            {
              name: "Role",
              value: "roles",
            },
            {
              name: "Department",
              value: "departments",
            },
            {
              name: "Back to Main Menu",
              value: "mainMenu",
            },
          ],
        },
      ])
      .then((answers) => {
        if (answers.table_name === "mainMenu") return mainPrompt();
        return updatePrompt(answers.table_name);
      });
  } else {
    db.showAll(table_name);

    if (table_name === "employees") {
      db.choices.employees().then((res) => {
        inquirer
          .prompt([
            formatListQuestion("employee", "employee_id", res),
            {
              message: "What do you want to update for this employee?",
              name: "whatToUpdate",
              type: "list",
              choices: ["Role", "Department", "Both"],
            },
          ])
          .then((answers) => {
            let employeeId = answers.employee_id;

            switch (answers.whatToUpdate) {
              case "Role":
                db.choices.roles().then((res) => {
                  inquirer
                    .prompt([formatListQuestion("role", "role_id", res)])
                    .then((answers) => {
                      db.update(table_name, res, employeeId);
                      mainPrompt();
                    });
                });
                break;
              case "Department":
                db.choices.departments().then((res) => {
                  inquirer
                    .prompt([
                      formatListQuestion("department", "department_id", res),
                    ])
                    .then((answers) => {
                      db.update(table_name, res, employeeId);
                      mainPrompt();
                    });
                });
                break;
              case "Both":
                db.choices.roles().then((res) => {
                  inquirer
                    .prompt([formatListQuestion("role", "role_id", res)])
                    .then((answers) => {
                      let newInfo = answers;
                      db.choices.departments().then((res) => {
                        inquirer
                          .prompt([
                            formatListQuestion(
                              "department",
                              "department_id",
                              res
                            ),
                          ])
                          .then((answers) => {
                            newInfo.department_id = answers.department_id;
                            db.update(table_name, newInfo, employeeInfo);
                            mainPrompt();
                          });
                      });
                    });
                });
                break;
            }
          });
      });
    } else if (table_name === "roles") {
      let questions = [
        {
          message: "Role Title:",
          name: "title",
        },
        {
          message: "Salary",
          name: "salary",
          validate: (salary) => {
            if (isNaN(salary)) {
              console.log(
                "\n Invalid: Must be a number. Do not include decimals."
              );
              return false;
            } else {
              return true;
            }
          },
        },
      ];

      db.choices.departments().then((res) => {
        questions.push({
          message: "Select role:",
          type: "list",
          name: "department_id",
          choices: res,
        });
        inquirer.prompt(questions).then((answers) => {
          db.createRow(answers, table_name);
        });
      });
    } else if (table_name === "departments") {
      inquirer
        .prompt([
          {
            message: "Department Name:",
            name: "name",
          },
        ])
        .then((answers) => {
          db.createRow(answers, table_name);
        });
    }
  }
}

function removePrompt(table_name) {
  if (table_name === false) {
    inquirer
      .prompt([
        {
          message: "What do you want to remove?",
          name: "table_name",
          type: "list",
          choices: [
            {
              name: "Employee",
              value: "employees",
            },
            {
              name: "Role",
              value: "roles",
            },
            {
              name: "Department",
              value: "departments",
            },
            {
              name: "Back to Main Menu",
              value: "mainMenu",
            },
          ],
        },
      ])
      .then((answers) => {
        if (answers.table_name === "mainMenu") return mainPrompt();
        return removePrompt(answers.table_name);
      });
  } else {
    db.showAll(table_name, () => {});

    if (table_name === "employees") {
      db.choices.employees().then((res) => {
        inquirer
          .prompt([formatListQuestion("employee", "id", res)])
          .then((answers) => {
            db.deleteRow(table_name, answers, function () {
              removePrompt(false);
            });
          });
      });
    } else if (table_name === "roles") {
      db.choices.roles().then((res) => {
        inquirer
          .prompt([
            formatListQuestion("role", "id", res),
            {
              message:
                "This will delete all employees associated with this role. Are you sure?",
              name: "confirm",
              type: "confirm",
            },
          ])
          .then((answers) => {
            if (answers.confirm) {
              db.deleteRow(table_name, { id: answers.id }, function () {
                removePrompt(false);
              });
            }
          });
      });
    } else if (table_name === "departments") {
      db.choices.departments().then((res) => {
        inquirer
          .prompt([
            formatListQuestion("department", "id", res),
            {
              message:
                "This will delete all roles and employees associated with this department. Are you sure?",
              name: "confirm",
              type: "confirm",
            },
          ])
          .then((answers) => {
            if (answers.confirm) {
              db.deleteRow(table_name, { id: answers.id }, function () {
                removePrompt(false);
              });
            }
          });
      });
    }
  }
}

function quitApp() {
  console.log("\n" + "=".repeat(62) + "\n");
  ascii.create("    Goodbye!", "Doom", (err, result) => {
    if (err) throw err;
    console.log(result);
    console.log("\n" + "=".repeat(62) + "\n");
    db.connection.end();
  });
}

function formatListQuestion(identifier, colName, choices) {
  return {
    message: `Select ${identifier}:`,
    type: "list",
    name: `${colName}`,
    choices,
  };
}

function prettify(string) {
  return (string[0].toUpperCase() + string.slice(1)).slice(0, -1);
}

module.exports.init = init;
