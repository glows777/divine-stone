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

export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id('documents')),
  },
  handler: async (ctx, args) => {
    // todo 抽离 出来 验证逻辑
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated!')
    }

    const userId = identity.subject

    // todo 拓展为 查询所有 包括其 子下的 所有文章
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_user_parent', (q) =>
        q.eq('userId', userId).eq('parentDocument', args.parentDocument)
      )
      .filter((q) => q.eq(q.field('isArchived'), false))
      .order('desc')
      .collect()
    return documents
  },
})

export const archive = mutation({
  args: {
    id: v.id('documents'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated!')
    }
    const userId = identity.subject
    const existingDocument = await ctx.db.get(args.id)

    if (!existingDocument) {
      throw new Error('not found')
    }
    if (existingDocument?.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const recursiveArchive = async (documentId: Id<'documents'>) => {
      const children = await ctx.db
        .query('documents')
        .withIndex('by_user_parent', (q) =>
          q.eq('userId', userId).eq('parentDocument', documentId)
        )
        .collect()

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        })
        await recursiveArchive(child._id)
      }
    }

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    })
    recursiveArchive(args.id)
    return document
  },
})

export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated!')
    }

    const userId = identity.subject

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('isArchived'), true))
      .collect()

    return documents
  },
})

export const restore = mutation({
  args: {
    id: v.id('documents'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated!')
    }

    const userId = identity.subject

    const existingDocument = await ctx.db.get(args.id)

    if (!existingDocument) {
      throw new Error('not found')
    }
    if (existingDocument?.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const recursiveRestore = async (documentId: Id<'documents'>) => {
      const children = await ctx.db
        .query('documents')
        .withIndex('by_user_parent', (q) =>
          q.eq('userId', userId).eq('parentDocument', documentId)
        )
        .collect()

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        })
        recursiveRestore(child._id)
      }
    }

    const options: Partial<Doc<'documents'>> = {
      isArchived: false,
    }

    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument)
      if (parent?.isArchived) {
        options.parentDocument = undefined
      }
    }

    const document = await ctx.db.patch(args.id, options)
    recursiveRestore(args.id)

    return document
  },
})

export const remove = mutation({
  args: {
    id: v.id('documents'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject

    const existingDocument = await ctx.db.get(args.id)

    if (!existingDocument) {
      throw new Error('Not found')
    }

    if (existingDocument.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const document = await ctx.db.delete(args.id)

    return document
  },
})
