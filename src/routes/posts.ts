import { Router, Request, Response } from 'express'

import auth from '../middleware/auth'
import Post from '../entities/Post'
import Sub from '../entities/Sub'

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

const router = Router()

router.post('/', auth, createPost)

export default router
