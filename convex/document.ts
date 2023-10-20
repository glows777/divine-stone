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
      .order('desc')
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

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('isArchived'), false))
      .order('desc')
      .collect()

    return documents
  },
})

export const getById = query({
  args: {
    documentId: v.id('documents')
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const document = await ctx.db.get(args.documentId)

    // * 思路
    // * 先根据 documentId 找到 文档
    // * 找不到，throw Not found
    // * 判断是否是 公开以及未删除，因为如果公开，他人可以直接在不登录 查看该文章
    // * 是，则直接返回，否则继续
    // * 判断 是否登陆
    // * 未登录，则 throw Not authenticated
    // * 已登录，继续判断 当前用户是不是文档作者
    // * 是，代表 是作者，拥有该 文档 全部权限 返回 document
    // * 否则，throw Unauthorized

    if (!document) {
      throw new Error('Not found')
    }

    if (document.isPublished && !document.isArchived) {
      return document
    }
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const userId = identity.subject

    if (document.userId !== userId) {
      throw new Error('Unauthorized')
    }

    return document
  }
})

export const update = mutation({
  args: {
    id: v.id('documents'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated')
    }

    const userId = identity.subject
    const { id, ...rest } = args

    const existingDocument = await ctx.db.get(id)

    if (!existingDocument) {
      throw new Error('Not found')
    }
    if (existingDocument.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const document = await ctx.db.patch(id, rest)
    return document
  }
})
