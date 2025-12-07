import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useLogin } from "../hooks/useLogin"
import { Link } from "react-router-dom"

const LoginPage = () => {
    const { login, isLoading, error: apiError } = useLogin()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)

    // Validator functions
    const validateEmail = (value) => {
        if (!value.trim()) return "Please enter your email."
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please check your email format."
        return ""
    }

    const validatePassword = (value) => {
        if (!value.trim()) return "Please enter your password."
        return ""
    }

    const validators = {
        email: validateEmail,
        password: validatePassword,
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isLoading) return

        const values = { email, password }

        const newErrors = Object.fromEntries(
            Object.entries(validators).map(([key, validator]) => [key, validator(values[key])])
        )

        setErrors(newErrors)

        if (Object.values(newErrors).some(Boolean)) return

        await login(email, password)
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-base-200 p-6">
            <div className="card w-full max-w-md shadow-xl bg-base-100 p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Email */}
                    <div>
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            autoComplete="email"
                            className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && (
                            <span className="label-text-alt text-error">{errors.email}</span>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="label">
                            <span className="label-text">Password</span>
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {errors.password && (
                            <span className="label-text-alt text-error">{errors.password}</span>
                        )}
                    </div>

                    {/* API error */}
                    {apiError && (
                        <span className="label-text-alt text-error block text-center">{apiError}</span>
                    )}

                    <button
                        type="submit"
                        className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center mt-4 text-sm">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="text-primary hover:underline">
                        Signup
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage
