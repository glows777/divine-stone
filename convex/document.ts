import { v } from 'convex/values'

import { query, mutation } from './_generated/server'
import { Doc, Id } from './_generated/dataModel'

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id('documents')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated!')
    }

    const userId = identity.subject

    const document = await ctx.db.insert('documents', {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
    })
    return document
  },
})

export const get = query({
  handler: async (ctx) => {
    // todo 抽离 出来 验证逻辑
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated!')
    }

    const documents = await ctx.db.query('documents').collect()
    return documents
  },
})