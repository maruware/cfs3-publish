import { CloudFront } from 'aws-sdk'
import delay from 'delay'
import Listr, { ListrTask } from 'listr'

const check = async (
  cf: CloudFront,
  distributionId: string,
  id: string
): Promise<boolean> => {
  const r = await cf
    .getInvalidation({ DistributionId: distributionId, Id: id })
    .promise()
  if (r.Invalidation && r.Invalidation.Status === 'Completed') {
    return true
  }
  await delay(1000)

  return check(cf, distributionId, id)
}

export type InvalidateArgs = {
  distributionId: string
  paths: string[]
  config?: CloudFront.ClientConfiguration
  wait?: boolean
}

export const invalidateTask = ({
  distributionId,
  paths,
  config,
  wait = true
}: InvalidateArgs) => {
  const cf = new CloudFront(config)

  const tasks: ListrTask<any>[] = [
    {
      title: 'Create invalidation',
      task: async ctx => {
        const r = await cf
          .createInvalidation({
            DistributionId: distributionId,
            InvalidationBatch: {
              Paths: {
                Quantity: paths.length,
                Items: paths
              },
              CallerReference: Date.now().toString()
            }
          })
          .promise()
        if (!r.Invalidation) {
          throw new Error('Bad response')
        }
        ctx.invalidationId = r.Invalidation.Id
      }
    }
  ]
  if (wait) {
    tasks.push({
      title: 'Wait to complete invalidation',
      task: ctx => {
        const id = ctx.invalidationId
        return check(cf, distributionId, id)
      }
    })
  }

  return new Listr(tasks)
}
