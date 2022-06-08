const fs = require("fs");

const validations = {
  isRequired: (value) => {
    if (!value) {
      return false;
    }
    return true;
  },
};

const questions = [
  {
    type: "password",
    name: "gitToken",
    message: "Enter your github personal access token:",
    validate: (value) => {
      if (!validations.isRequired(value)) {
        return "Github personal access token is required";
      }

      return true;
    },
  },
  {
    type: "input",
    name: "gitCollaborators",
    message:
      "Enter the list of team members you wish to add as collaborators. Add list as comma seperated text: (Make sure these are valid github usernames)",
    filter(val) {
      return val.trim();
    },
  },
  {
    type: "input",
    name: "orgName",
    message:
      "What's the name of your organization (Should be the org name of your github account) ?",
    validate: (value) => {
      if (!validations.isRequired(value)) {
        return "Organization name is required";
      }

      return true;
    },
    filter(val) {
      return val.toLowerCase();
    },
  },
  {
    type: "input",
    name: "appName",
    message: "What's the name of your application?",
    validate: (value) => {
      if (!validations.isRequired(value)) {
        return "Application name is required";
      }
      return true;
    },
    filter(val) {
      return val.toLowerCase();
    },
  },
  {
    type: "confirm",
    name: "backendIsNeeded",
    message: "Do you want a backend configuration for your application?",
    default: true,
  },
  {
    type: "confirm",
    name: "webappIsNeeded",
    message:
      "Do you want a frontend webapp configuration for your application?",
    default: true,
  },
  {
    type: "confirm",
    name: "staticFeIsNeeded",
    message:
      "Do you want a static frontend as promotional website for your application?",
    default: true,
  },
  {
    type: "list",
    name: "cloudProvider",
    message: "Choose the cloud provider you would like to deploy to:",
    choices: ["AWS"],
    filter(val) {
      return val.toLowerCase();
    },
  },
];

module.exports = questions;
