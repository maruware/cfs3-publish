import { deployTask, DeployArgs } from './s3'
import { invalidateTask, InvalidateArgs } from './cloud_front'
import Listr from 'listr'

export const deploy = async (args: DeployArgs) => {
  const tasks = await deployTask(args)
  return tasks.run()
}

export const invalidate = (args: InvalidateArgs) => {
  const tasks = invalidateTask(args)
  return tasks.run()
}

export const deployAndInvalidate = async (
  deployArgs: DeployArgs,
  invalidateArgs: InvalidateArgs
) => {
  const d = await deployTask(deployArgs)
  const i = invalidateTask(invalidateArgs)

  const tasks = new Listr([
    { title: 'Deploy to S3', task: () => d },
    { title: 'Invalidate CloudFront', task: () => i }
  ])
  await tasks.run()
}
