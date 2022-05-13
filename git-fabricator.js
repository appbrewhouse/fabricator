const { execSync } = require("node:child_process");
const fs = require("fs");

function setupGithubRepository({
  gitToken,
  gitCollaborators,
  orgName,
  appName,
  backendIsNeeded,
  webappIsNeeded,
  staticFeIsNeeded,
}, baseDir) {
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

  console.log("Installing terraform modules");
  execSync("terraform init", {
    cwd: `${gitTerraformPath}`,
  });

  console.log("Applying terraform");

  execSync("terraform apply --auto-approve", {
    cwd: `${gitTerraformPath}`,
  });

  console.log("Completed.");
}

module.exports = {
  setupGithubRepository,
};
