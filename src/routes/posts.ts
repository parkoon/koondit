import { Router, Request, Response } from 'express'

import auth from '../middleware/auth'
import user from '../middleware/user'
import Post from '../entities/Post'
import Sub from '../entities/Sub'
import Comment from '../entities/Comment'

const createPost = async (req: Request, res: Response) => {
    const { title, body, sub } = req.body

    const user = res.locals.user

    if (title.trim() === '') {
        return res.status(400).json({ title: 'Title must not be empty' })
    }

    try {
        // TODO: find sub
        const subRecord = await Sub.findOneOrFail({ name: sub })

        console.log('subRecord', subRecord)

        const post = new Post({ title, body, user, sub: subRecord })
        await post.save()

        return res.json(post)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find({
            order: { createdAt: 'DESC' },
            relations: ['comments', 'sub', 'votes'],
        })

        if (res.locals.user) {
            posts.forEach((p) => p.setUserVote(res.locals.user))
        }
        return res.json(posts)
    } catch (err) {
        console.log(err)
        return res.json({ error: 'Something went wrong' })
    }
}

const getPost = async (req: Request, res: Response) => {
    const { identifier, slug } = req.params
    try {
        const post = await Post.findOneOrFail(
            { identifier, slug },
            { relations: ['sub'] }
        )
        return res.json(post)
    } catch (err) {
        return res.status(404).json({ error: 'Post not found' })
    }
}

const commentOnPost = async (req: Request, res: Response) => {
    const { identifier, slug } = req.params
    const body = req.body.body

    try {
        const post = await Post.findOneOrFail({ identifier, slug })
        const comment = new Comment({ body, user: res.locals.user, post })
        await comment.save()

        return res.json(comment)
    } catch (err) {
        console.log(err)
        return res.status(404).json({ error: 'Post not found' })
    }
}

const router = Router()

router.get('/', user, getPosts)
router.get('/:identifier/:slug', getPost)
router.post('/', user, auth, createPost)
router.post('/:identifier/:slug/comments', user, auth, commentOnPost)

export default router
