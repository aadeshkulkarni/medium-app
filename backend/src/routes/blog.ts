import { createBlogInput, updateBlogInput } from "@aadeshk/medium-common";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { getFormattedDate, shuffleArray } from "../utils";
import { generateArticle,generateChatResponse } from "../genAI";
import OpenAI from "openai";
import {
  buildQuery,
  buildPostSearchQuery,
  buildUserSearchQuery,
  buildTagSearchQuery,
} from "../db/queries";
import { getDBInstance } from "../db/util";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
		OPENAI_API_KEY: string;
  };
  Variables: {
    userId: string;
  };
}>();

/* 
This route should be kept above app.use("/*") middleware as it is unprotected
*/
blogRouter.get("/bulk/:id?", async (c) => {
  try {
    const userId = await c.req.param("id");
		const tagId = c.req.query("tagId");
		let page = Math.max(parseInt(c.req.query("page") || `${DEFAULT_PAGE}`), 1);
		let pageSize = Math.max(parseInt(c.req.query("pageSize") || `${DEFAULT_PAGE_SIZE}`), 1);
		const prisma = getDBInstance(c);
		const query = buildQuery(userId, tagId);
    query.skip = (page - 1) * pageSize;
		query.take = pageSize;
    const posts = await prisma.post.findMany(query);
    const countQuery = buildQuery(userId, tagId);
    delete countQuery.skip;
    delete countQuery.take;
    const totalCount = await prisma.post.count({ where: countQuery.where });
    return c.json({
      posts: shuffleArray(posts),
      totalCount: totalCount,
			page: page,
			pageSize: pageSize,
			totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (e) {
    c.status(411);
    return c.json({
      message: "Error while fetching post",
      error: e
    });
  }
});

blogRouter.get("/search", async (c) => {
  try {
    const keyword = await c.req.query("keyword") || "";
    const prisma = getDBInstance(c);
    const postQuery = buildPostSearchQuery(keyword);
    const userQuery = buildUserSearchQuery(keyword);
    const tagQuery = buildTagSearchQuery(keyword);
    const [posts, users, tags] = await Promise.all([
      prisma.post.findMany(postQuery),
      prisma.user.findMany(userQuery),
      prisma.tag.findMany(tagQuery),
    ]);
    return c.json({
      posts: posts,
      users: users,
      tags: tags,
    });
  } catch (e) {
    c.status(411);
    return c.json({
      message: "Error while fetching post",
      error: e,
    });
  }
});

blogRouter.get("/recommendation/:blogId", async (c) => {
  try {
    const blogId = c.req.param("blogId");
    const prisma = getDBInstance(c);

    // Get Blog details
    const blog = await prisma.post.findFirst({
      where: { id: blogId },
      include: { tagsOnPost: { include: { tag: true } }, author: true },
    });

    if (!blog) {
      c.status(404);
      return c.json({ message: "Blog not found." });
    }

    // Get related blogs by tags
    const tagIds = blog.tagsOnPost.map((tagOnPost) => tagOnPost.tag.id);
    const relatedByTags = await prisma.post.findMany({
      where: {
        tagsOnPost: {
          some: {
            tagId: { in: tagIds },
          },
        },
        id: { not: blogId },
      },
      take: 4,
    });

    // Get related blogs by author
    const relatedByAuthor = await prisma.post.findMany({
      where: {
        authorId: blog.author.id,
        id: { not: blogId },
      },
      take: 4,
    });

    // Combine related blogs and remove duplicates
    const relatedBlogs = [...relatedByTags, ...relatedByAuthor];
    const uniqueBlogs = Array.from(new Set(relatedBlogs.map((b) => b.id)))
      .map(id => relatedBlogs.find(blog => blog?.id === id))
      .filter((blog): blog is NonNullable<typeof blog> => blog !== undefined)
      .slice(0, 4); // Ensure no more than 4 recommendations

    // If there are not enough related blogs, fetch recent blogs
    if (uniqueBlogs.length < 4) {
      const recentBlogs = await prisma.post.findMany({
        where: { id: { not: blogId } },
        orderBy: { publishedDate: "desc" },
        take: 4 - uniqueBlogs.length,
      });
      uniqueBlogs.push(...recentBlogs.filter(recentBlog => !uniqueBlogs.find(b => b?.id === recentBlog.id)));
    }

    return c.json({
      recommendedBlogs: uniqueBlogs,
    });
  } catch (e) {
    console.log(e);
    c.status(500);
    return c.json({ message: "Error while fetching recommendations " });
  }
});

blogRouter.get("/:id", async (c) => {
  try {
		const prisma = getDBInstance(c);
    const postId = await c.req.param("id");
    const userId = c.get("userId");
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      select: {
        title: true,
        content: true,
        publishedDate: true,
        author: {
          select: {
            name: true,
            id: true,
            details: true,
            profilePic: true,
            email: true
          },
        },
        id: true,
        bookmarks: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        claps: {
          select: {
            id: true
          }
        },
        tagsOnPost: {
          select: {
            tag: {
              select: {
                id: true,
                tagName: true,
              }
            }
          }
        }
      },
    });

    const userBookmarkId = post?.bookmarks.find(
      (bookmark) => bookmark.user.id === userId
    );

    return c.json({
      post: {
        ...post,
        bookmarkId: userBookmarkId?.id,
      },
    });
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.json({
      message: "Error while fetching post",
    });
  }
});

/* 
All routes above are unprotected (Users can access them without authentication)
*/
blogRouter.use("/*", async (c, next) => {
  try {
    const header = c.req.header("authorization") || "";
    const token = header.split(" ")[1];
    const user = await verify(token, c.env.JWT_SECRET);
    if (user && typeof user.id === "string") {
      c.set("userId", user.id);
      return next();
    } else {
      c.status(403);
      return c.json({ error: "Unauthorized " });
    }
  } catch (e) {
    c.status(403);
    return c.json({
      error: "Credentials failed",
    });
  }
});

blogRouter.post("/", async (c) => {
  const prisma = getDBInstance(c);
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
      message: "Inputs incorrect",
    });
  }
  const authorId = c.get("userId");
  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId
      },
    });
    return c.json({
      id: post.id,
    });
  } catch (ex) {
    c.status(403);
    return c.json({ error: "Something went wrong ", stackTrace: ex });
  }
});

blogRouter.put("/", async (c) => {
  const prisma = getDBInstance(c);
  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
      message: "Inputs incorrect",
    });
  }
  try {
    const post = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    return c.json({
      id: post.id,
    });
  } catch (ex) {
    c.status(403);
    return c.json({ error: "Something went wrong ", stackTrace: ex });
  }
});

blogRouter.delete("/:id", async (c) => {
  try {
		const prisma = getDBInstance(c);
    const postId = c.req.param("id");
    await prisma.post.delete({
      where: {id: postId}
    })

    return c.json({
      message: "Post deleted successfully",
    });
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.json({
      message: "Error while deleting post",
    });
  }
});

blogRouter.post("/generate", async (c) => {
	try {
		if (!c.env.OPENAI_API_KEY) {
			return c.json({
				title: "",
				article: "This feature is disabled.",
			});
		}
		const body = await c.req.json();
		const title = body.title;
		const response = await generateArticle(title, "gpt", c.env.OPENAI_API_KEY);
		return c.json({
			title: title,
			article: response,
		});
	} catch (ex) {
		c.status(403);
		return c.json({ error: "Something went wrong" });
	}
});

/**
 * Retrieves all the blogs for the user in bulk
 */
blogRouter.get("/bulkUser/:id", async (c) => {
  try {
    const userId = await c.req.param("id");
		const prisma = getDBInstance(c);
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      select: {
        content: true,
        title: true,
        id: true,
        publishedDate: true,
        author: {
          select: {
            name: true,
          },
        },
        published: true,
        tagsOnPost: {
          select: {
            tag: {
              select: {
                id: true,
                tagName: true,
              }
            }
          }
        }
      },
    });
    return c.json({
      posts: posts,
    });
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.json({
      message: "Error while fetching post",
    });
  }
});
blogRouter.post("/chat", async (c) => {
  try {
    if (!c.env.OPENAI_API_KEY) {
      return c.json({
        message: "This feature is disabled.",
      });
    }

    const body = await c.req.json();
    const { blogContent, userQuery, chatHistory, blogTitle } = body;
    const response = await generateChatResponse(c.env.OPENAI_API_KEY, blogContent, userQuery, chatHistory, blogTitle);

    return c.json({
      message: response,
    });
  } catch (ex: unknown) {
    c.status(403);
    return c.json({ error: "Something went wrong", stackTrace: ex instanceof Error ? ex.toString() : JSON.stringify(ex) });
  }
});