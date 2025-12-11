import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from "lucide-react"

import { useSignup } from '../hooks/useSignupActions'

const SignUpPage = () => {
    const { signup, isLoading, error: apiError } = useSignup();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [sex, setSex] = useState('');
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        birthDate: '',
        sex: ''
    });
    const [showPassword, setShowPassword] = useState(false)

    // Frontend validation matching backend

    const validateEmail = (value) => {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Invalid email format';
        return '';
    }

    const validatePassword = (value) => {
        if (!value.trim()) return 'Password is required'
        const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!pwRegex.test(value)) {
            return 'Password must contain at least 8 characters, include uppercase, lowercase, number, and special character';
        }
        return '';
    }

    const validateBirthDate = (value) => {
        if (!value) return 'Birth date is required';

        const birth = new Date(value);
        const today = new Date();

        if (birth > today) return 'Birth date cannot be in the future';

        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        if (age < 0 || age > 120) return 'Invalid age range';
        return '';
    };

    const validateSex = (value) => {
        if (!value) return 'Sex is required';
        if (!['male', 'female'].includes(value.toLowerCase())) return 'Invalid sex value';
        return '';
    }

    const validators = {
        email: validateEmail,
        password: validatePassword,
        birthDate: validateBirthDate,
        sex: validateSex,
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        const values = { email, password, birthDate, sex };

        const newErrors = Object.fromEntries(
            Object.entries(validators).map(([key, validator]) => [
                key,
                validator(values[key])
            ])
        );

        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) return;

        await signup(email, password, birthDate, sex.toLowerCase());
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-base-200 p-6">
            <div className="card w-full max-w-md shadow-xl bg-base-100 p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Email */}
                    <div>
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            autoComplete="email"
                            className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
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
                                name="password"
                                autoComplete="new-password"
                                type={showPassword ? "text" : "password"}
                                className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""
                                    }`}
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
                            <span className="label-text-alt text-error">
                                {errors.password}
                            </span>
                        )}
                    </div>

                    {/* Birth Date */}
                    <div>
                        <label className="label">
                            <span className="label-text">Birth Date</span>
                        </label>
                        <input
                            type="date"
                            autoComplete="bday"
                            className={`input input-bordered w-full ${errors.birthDate ? 'input-error' : ''}`}
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                        />
                        {errors.birthDate && (
                            <span className="label-text-alt text-error">{errors.birthDate}</span>
                        )}
                    </div>

                    {/* Sex */}
                    <div>
                        <label className="label">
                            <span className="label-text">Sex (assigned at birth)</span>
                        </label>
                        <select
                            className={`select select-bordered w-full ${errors.sex ? 'select-error' : ''}`}
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                        >
                            <option value="">Select sex</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        {errors.sex && (
                            <span className="label-text-alt text-error">{errors.sex}</span>
                        )}
                    </div>

                    {/* API error above submit button */}
                    {apiError && (
                        <span className="label-text-alt text-error block text-center">{apiError}</span>
                    )}

                    <button
                        type="submit"
                        className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-sm text-center mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default SignUpPage
