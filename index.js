// Setup dependencies
const inquirer = require("inquirer");
const db = require("./db.js");
const ascii = require("ascii-art-font");

// Initalize the app
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
          return addPrompt();
        case "Edit":
          return editPrompt();
        case "Remove":
          return removePrompt();
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
        name: "view",
        choices: ["All Employees", "All Departments", "All Roles"],
      },
    ])
    .then((answers) => {
      switch (answers.view) {
        case "All Employees":
          return db.showAll("employees");
        case "All Departments":
          return db.showAll("departments");
        case "All Roles":
          return db.showAll("roles");
      }
    });
}

function addPrompt() {}

function editPrompt() {}

function removePrompt() {}


var crudPrompt = (table_name, fromMainMenu) => {
  let prettyName = (table_name[0].toUpperCase() + table_name.slice(1)).slice(
    0,
    -1
  );

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
  ];

  if (!fromMainMenu) {
    choices.push({
      name: "Back to View Menu",
      value: "view",
    });
  }

  choices.push({
    name: "Back to Main Menu",
    value: "main",
  });

  choices.push({
    name: "Quit",
    value: "quit",
  });

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
  if (table_name === "employees") {
    let managerChoices = [];
    let roleChoices = [];

    db.getSpecific("id,firstName,lastName", "employees").then((res) => {
      res.forEach((choice) => {
        managerChoices.push({
          name: choice.firstName + " " + choice.lastName,
          value: choice.id,
        });
      });

      db.getSpecific("id,title", "roles").then((res) => {
        res.forEach((choice) => {
          roleChoices.push({ name: choice.title, value: choice.id });
        });
        inquirer
          .prompt([
            {
              message: "First Name:",
              name: "firstName",
            },
            {
              message: "Last Name:",
              name: "lastName",
            },
            {
              message: "Role:",
              type: "list",
              name: "role_id",
              choices: roleChoices,
            },
            {
              message: "Manager:",
              type: "list",
              name: "manager_id",
              choices: managerChoices,
            },
          ])
          .then((answers) => {
            db.createRow(answers, table_name);
          });
      });
    });
  } else if (table_name === "roles") {
    let departmentChoices = [];

    db.getSpecific("id,name", "departments").then((res) => {
      res.forEach((choice) => {
        departmentChoices.push({ name: choice.name, value: choice.id });
      });
      inquirer
        .prompt([
          {
            message: "Role Title:",
            name: "title",
          },
          {
            message: "Salary:",
            name: "salary",
            validate: (salary) => {
              if (isNaN(salary)) {
                return false;
              } else {
                return true;
              }
            },
          },
          {
            message: "Department:",
            name: "department_id",
            type: "list",
            choices: departmentChoices,
          },
        ])
        .then((answers) => {
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

function updatePrompt(table_name) {}

function removePrompt(table_name) {}

function quitApp() {
  console.log("\n" + "=".repeat(62) + "\n");
  ascii.create("    Goodbye!", "Doom", (err, result) => {
    if (err) throw err;
    console.log(result);
    console.log("\n" + "=".repeat(62) + "\n");
    db.connection.end();
  });
}

function prettifyTableName(string) {
  return (string[0].toUpperCase() + string.slice(1)).slice(0, -1);
}

module.exports.crudPrompt = crudPrompt;
module.exports.init = init;
module.exports.mainPrompt = mainPrompt;
