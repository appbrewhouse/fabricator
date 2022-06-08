const { execSync } = require("node:child_process");
const fs = require("fs");

function setupGithubRepository(
  {
    gitToken,
    gitCollaborators,
    orgName,
    appName,
    backendIsNeeded,
    webappIsNeeded,
    staticFeIsNeeded,
    cloudProvider,
  },
  baseDir
) {
  let appsList = "";
  const appNames = [];

  if (backendIsNeeded) {
    appsList += '"backend",';
    appNames.push("backend");
  }

  if (webappIsNeeded) {
    appsList += '"webapp",';
    appNames.push("webapp");
  }

  if (staticFeIsNeeded) {
    appsList += '"staticfe",';
    appNames.push("staticfe");
  }

  if (cloudProvider) {
    appsList += '"infra",';
    appNames.push("infra");
  }

  if (!appsList) {
    console.log("Should have atleast one app to create provision git");
    return;
  }

  let gitTerraformPath = baseDir;

  if (!fs.existsSync(gitTerraformPath)) {
    fs.mkdirSync(gitTerraformPath);
  }

  execSync(
    "git clone https://github.com/appbrewhouse/fabricate-github-project.git github-provisioner -q",
    { cwd: gitTerraformPath }
  );

  gitTerraformPath += "/github-provisioner";

  execSync(`rm -rf ./.git`, {
    cwd: `${gitTerraformPath}`,
  });

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

  fs.writeFileSync(`${gitTerraformPath}/terraform.tfvars`, tfvarsFileContent);

  console.log("GIT: Installing terraform modules");
  execSync("terraform init", {
    cwd: `${gitTerraformPath}`,
  });

  console.log("GIT: Applying terraform");

  execSync("terraform apply --auto-approve", {
    cwd: `${gitTerraformPath}`,
  });

  console.log("GIT: Completed.");

  cloneRepos({
    orgName,
    appName,
    appNames,
  });
}

function cloneRepos(data) {
  const path = `${data.orgName}/${data.appName}`;

  data.appNames.forEach((app) => {
    execSync(
      `git clone https://github.com/appbrewhouse/${data.appName}-${app}.git ${app} -q`,
      { cwd: path }
    );
  });

  execSync("mv ./infra-temp/github-provisioner ./infra/github-provisioner ", {
    cwd: path,
  });

  execSync(`rm -rf ./infra-temp`, {
    cwd: `${path}`,
  });

  execSync(`git add . && git commit -m "Adding git provisioners tf files" && git push origin`, {
    cwd: `${path}/infra`,
  });
}

module.exports = {
  setupGithubRepository,
};
