import React, { useReducer, useContext, useEffect } from 'react'
import Axios from 'axios'

import { User } from '../types'

type State = {
    authenticated: boolean
    loading: boolean
    user: User | null
}

type Action = {
    type: string
    payload?: any
}

const initialState: State = {
    authenticated: false,
    loading: true,
    user: null,
}

const StateContext = React.createContext<State>(initialState)

const DispatchContext = React.createContext(null)

const reducer = (state: State, { type, payload }: Action) => {
    switch (type) {
        case 'LOGIN':
            return { ...state, authenticated: true, user: payload }
        case 'LOGOUT':
            return { ...state, authenticated: false, user: null }

        case 'STOP_LOADING':
            return { ...state, loading: false }

        default:
            throw new Error(`Unknown action type: ${type}`)
    }
}

export const AutoProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {
        async function loadUser() {
            try {
                const res = await Axios.get('/auth/me')
                dispatch({ type: 'LOGIN', payload: res.data })
            } catch (err) {
                console.log(err)
            } finally {
                dispatch({ type: 'STOP_LOADING' })
            }
        }

        loadUser()
    }, [])

    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </StateContext.Provider>
    )
}

export const useAuthState = () => useContext(StateContext)
export const useAuthDispatch = () => useContext(DispatchContext)
