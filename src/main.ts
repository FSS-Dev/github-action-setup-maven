import * as core from '@actions/core'
import * as httpm from '@actions/http-client'
import * as fs from 'fs'
import * as path from 'path'

async function run(): Promise<void> {
  try {
    const masterPassword: string = core.getInput('maven-master-password', {
      required: true
    })

    const http = new httpm.HttpClient('setup-maven', undefined, {
      allowRetries: true,
      maxRetries: 3
    })
    const homeDir = process.env['HOME'] || '/home/runner'
    const mavenHome = path.join(homeDir, '.m2')
    const mavenSettingsUrl =
      'https://byu-oit.github.io/byu-apps-custom-cicd-resources/maven-settings.xml'
    const resp = await http.get(mavenSettingsUrl)
    fs.mkdirSync(mavenHome)
    fs.writeFileSync(
      path.join(mavenHome, 'settings.xml'),
      await resp.readBody()
    )
    const mavenSecuritySettings = `<settingsSecurity><master>${masterPassword}</master></settingsSecurity>`
    fs.writeFileSync(
      path.join(mavenHome, 'settings-security.xml'),
      mavenSecuritySettings
    )
    core.debug(new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
