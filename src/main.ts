import * as core from '@actions/core'
// FIXME create types for zulip-js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Zulip from 'zulip-js'
import Path from 'path'
import FS from 'fs'

// By default, the action is given an input for the zuliprc parameter
// However, the workflow can input 'false' which should explicitly
// disable any zuliprc-related functionality
async function get_path_to_zulip_rc(): Promise<string | undefined> {
  const zuliprc_input = core.getInput('zuliprc')

  // allow disabling of zuliprc file parsing
  if (zuliprc_input === 'false') return undefined

  // resolve the full path to the file and validate that it exists and we can read from it
  return new Promise(resolve => {
    const resolved_path = Path.resolve(zuliprc_input)
    core.debug(`Full path to zuliprc file: ${resolved_path}`)
    FS.access(resolved_path, FS.constants.F_OK | FS.constants.R_OK, error => {
      core.debug(`Result of zuliprc file access check: ${error ? error : 'OK'}`)

      if (error) resolve(undefined)
      else resolve(resolved_path)
    })
  })
}

async function run(): Promise<void> {
  core.debug('Executing run')

  const path_to_zuliprc = await get_path_to_zulip_rc()

  // assemble our configuration before before awaiting anything to catch early input errors
  const config = {
    client: {
      zuliprc: path_to_zuliprc,
      username: core.getInput('username'),
      apiKey: core.getInput('api-key'),
      realm: core.getInput('url')
    },
    message: {
      type: 'stream',
      to: core.getInput('stream'),
      topic: core.getInput('topic'),
      content: core.getInput('message')
    }
  }

  core.debug(`Config: ${JSON.stringify(config)}`)

  const client = await Zulip(config.client)
  core.debug(`Client has been constructed`)

  const {result, msg} = await client.messages.send(config.message)

  if (result === 'error') {
    core.setFailed(msg)
  } else {
    core.info(`Result: ${JSON.stringify(result)}`)
  }
}

// `catch` used in this way is safer/more robust than wrapping the contents of `run` in a try-catch
// eslint-disable-next-line github/no-then
run().catch(core.setFailed)
