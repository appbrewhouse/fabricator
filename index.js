#!/usr/bin/env node

require("dotenv").config();

const inquirer = require("inquirer");
const fs = require("fs");
const { execSync } = require("node:child_process");
const questions = require("./questions");
const { setupGithubRepository } = require("./git-fabricator");

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
  if (!fs.existsSync(data.orgName)) {
    fs.mkdirSync(data.orgName);
  }
  fs.mkdirSync(`${data.orgName}/${data.appName}`);

  const gitDir = `${data.orgName}/${data.appName}/infra-temp`;
  setupGithubRepository(data, gitDir);
}

// function setupBackendApp(data, dirPath) {
//   return new Promise((resolve, reject) => {
//     execSync("nest new . -p npm", { cwd: dirPath });
//     resolve();
//   });
// }
// function setupWebAppFe(data, dirPath) {
//   return new Promise((resolve, reject) => {
//     execSync("npx create-react-app .", { cwd: dirPath });
//     resolve();
//   });
// }
// function setupStaticFe(data, dirPath) {
//   return new Promise((resolve, reject) => {
//     execSync("npx gatsby new .", { cwd: dirPath });
//     resolve();
//   });
// }
// function setupInfra(data, dirPath) {
//   return new Promise((resolve, reject) => {
//     fs.mkdirSync(dirPath + "/packer");
//     fs.mkdirSync(dirPath + "/terraform");
//     fs.mkdirSync(dirPath + "/scripts");

//     resolve();
//   });
// }

initProject();
