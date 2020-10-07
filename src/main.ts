import * as core from '@actions/core'
import Zulip from 'zulip-js'

async function run(): Promise<void> {
  try {
    const client_config = {
      username: core.getInput('username'),
      apiKey: core.getInput('api-key'),
      realm: core.getInput('realm')
    }

    const message_config = {
      type: 'stream',
      to: core.getInput('stream'),
      topic: core.getInput('topic'),
      content: core.getInput('message')
    }

    const client = await Zulip(client_config)

    const result = await client.messages.send(message_config)
    core.info(result)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
