import { Request, Response, Router } from 'express'
import { validate, isEmpty } from 'class-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

import User from '../entities/User'
import auth from '../middleware/auth'

const register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body

    try {
        let errors: any = {}
        const emailUser = await User.findOne({ email })
        const usernameUser = await User.findOne({ username })

        if (emailUser) errors.email = 'Email is Already taken'
        if (usernameUser) errors.username = 'Username is Already taken'

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors })
        }

        console.log({ email, username, password })
        const user = new User({ email, username, password })

        errors = await validate(user)
        if (errors.length > 0) return res.status(400).json({ errors })

        await user.save()

        return res.json(user)
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
}

const login = async (req: Request, res: Response) => {
    const { username, password } = req.body

    try {
        let errors: any = {}

        if (isEmpty(username)) errors.username = 'Username must not be empty'
        if (isEmpty(password)) errors.password = 'password must not be empty'
        if (Object.keys(errors).length > 0)
            return res.status(400).json({ errors })

        const user = await User.findOne({ username })

        if (!user) return res.status(404).json({ error: 'User not found' })

        console.log('password, user.password', password, user.password)
        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch)
            return res.status(401).json({ password: 'Password is incorrect' })

        const token = jwt.sign({ username }, process.env.JWT_SECRET)

        res.set(
            'Set-Cookie',
            cookie.serialize('token', token, {
                httpOnly: true, // Access http only
                secure: process.env.NODE_ENV === 'production', // Only https
                sameSite: 'strict', // Same Site
                maxAge: 3600, // Max Age
                path: '/', // Path can access
            })
        )

        res.json(user)
    } catch (err) {
        console.log(err)
        res.json({ error: 'Something went wrong' })
    }
}

const me = async (_: Request, res: Response) => {
    res.json(res.locals.user)
}

const logout = (_: Request, res: Response) => {
    res.set(
        'Set-Cookie',
        cookie.serialize('token', '', {
            httpOnly: true, // Access http only
            secure: process.env.NODE_ENV === 'production', // Only https
            sameSite: 'strict', // Same Site
            expires: new Date(0), // Max Age
            path: '/', // Path can access}))
        })
    )
    return res.status(200).json({ success: true })
}

const router = Router()
router.post('/register', register)
router.post('/login', login)
router.get('/me', auth, me)
router.get('/logout', auth, logout)

export default router
