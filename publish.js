/*
 * @Descripttion: 
 * @Author: yang fu ren
 * @version: 
 * @Date: 2022-10-15 09:41:25
 * @LastEditors: yang fu ren
 * @LastEditTime: 2023-04-18 14:41:00
 */
#!/usr/bin/env node
const shell = require('shelljs');
shell.exec('npx npm-cli-login -u jenkins -p jenkins -e');
const version = process.env.npm_package_version;
const p = /[a-z]/i;
const isAlpha = p.test(version);
if (!isAlpha) {
  shell.exec('npm publish');
} else {
  const versionArr = version.split('-');
  const devTag = versionArr[1].replace(/[^a-z]/ig, '');
  shell.exec(`npm publish --tag ${devTag}`);
}
