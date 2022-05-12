#!/usr/bin/env node

require("dotenv").config();

const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const { execSync } = require("node:child_process");

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
      const dirName = value.toLowerCase();

      if (fs.existsSync(value)) {
        return `Directory with name ${dirName} already exists in the current location. Please move to a different directory or choose a diffrent name.`;
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
    choices: ["AWS", "Google Cloud", "Microsoft Azure", "Digital Ocean"],
    filter(val) {
      return val.toLowerCase();
    },
  },
];

function initProject() {
  inquirer
    .prompt(questions)
    .then((answers) => {
      setupOrganization(answers);
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.error("Prompt couldn't be rendered in the current environment");
      } else {
        console.error("Something else went wrong", error);
      }
    });
}

function setupOrganization(data) {
  fs.mkdirSync(data.orgName);
  fs.mkdirSync(`${data.orgName}/${data.appName}`);

  // if (data.backendIsNeeded) {
  //   const dir = `${data.orgName}/${data.appName}/backend`;
  //   fs.mkdirSync(dir);
  //   setupBackendApp(data, dir);
  // }
  // if (data.webappIsNeeded) {
  //   const dir = `${data.orgName}/${data.appName}/webapp`;
  //   fs.mkdirSync(dir);
  //   setupWebAppFe(data, dir);
  // }
  // if (data.staticFeIsNeeded) {
  //   const dir = `${data.orgName}/${data.appName}/staticfe`;
  //   fs.mkdirSync(dir);
  //   setupStaticFe(data);
  // }
  // if (data.cloudProvider) {
  //   const dir = `${data.orgName}/${data.appName}/infra`;
  //   fs.mkdirSync(dir);
  //   setupInfra(data);
  // }

  setupGithubRepository(data);
}

function setupBackendApp(data, dirPath) {
  return new Promise((resolve, reject) => {
    execSync("nest new . -p npm", { cwd: dirPath });
    resolve();
  });
}
function setupWebAppFe(data, dirPath) {
  return new Promise((resolve, reject) => {
    execSync("npx create-react-app .", { cwd: dirPath });
    resolve();
  });
}
function setupStaticFe(data, dirPath) {
  return new Promise((resolve, reject) => {
    execSync("npx gatsby new .", { cwd: dirPath });
    resolve();
  });
}
function setupInfra(data, dirPath) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(dirPath + "/packer");
    fs.mkdirSync(dirPath + "/terraform");
    fs.mkdirSync(dirPath + "/scripts");

    resolve();
  });
}

function setupGithubRepository({
  gitToken,
  gitCollaborators,
  orgName,
  appName,
  backendIsNeeded,
  webappIsNeeded,
  staticFeIsNeeded,
}) {
  let appsList = "";

  if (backendIsNeeded) {
    appsList += '"backend",';
  }

  if (webappIsNeeded) {
    appsList += '"webapp",';
  }

  if (staticFeIsNeeded) {
    appsList += '"staticfe",';
  }

  if (!appsList) {
    console.log("Should have atleast one app to create git repos");
    return;
  }

  const gitTerraformPath = `${orgName}`;
  execSync(
    "git clone https://github.com/appbrewhouse/fabricate-github-project.git init -q",
    { cwd: gitTerraformPath }
  );

  const tfvarsFileContent = `
git_token               = "${gitToken}"
org_name                = "${orgName}"
app_name                = "${appName}"
collaborators_usernames = [${gitCollaborators
    .split(",")
    .map((i) => `"${i}"`)
    .join(",")}]
apps_list               = [${appsList.slice(0, -1)}]
`;

  fs.writeFileSync(
    `${gitTerraformPath}/init/terraform.tfvars`,
    tfvarsFileContent
  );

  console.log("Installing terraform modules");
  execSync("terraform init", {
    cwd: `${gitTerraformPath}/init`,
  });

  console.log("Applying terraform");

  execSync("terraform apply --auto-approve", {
    cwd: `${gitTerraformPath}/init`,
  });

  console.log("Completed.");
}

initProject();
