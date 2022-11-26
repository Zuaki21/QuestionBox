import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Route } from "react-router-dom";

function PrivateRoute({ children }) {
    const [loading, setLoading] = useState(true)
    const [isLogin, setIsLogin] = useState(false)

    useEffect(() => {
        axios.get('/api/whoami')
            .then(e => {
                if (e.status === 200) {
                    setIsLogin(true)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    if (!loading) {
        if (isLogin) {
            return children
        } else {
            return <Navigate replace to='/login' />
        }
    }
}

export default PrivateRoute