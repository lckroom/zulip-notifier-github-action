import * as core from '@actions/core'
// FIXME create types for zulip-js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Zulip from 'zulip-js'

async function run(): Promise<void> {
  core.debug('Executing run')

  // assemble our configuration before before awaiting anything to catch early input errors
  const config = {
    client: {
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
