import { Link } from "react-router-dom";

const HomePage = () => {

    return (
        <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center text-center px-4">
            {/* Hero Section */}
            <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    Feeling off?
                </h1>
                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-700">
                    Check your symptoms safely and quickly
                </h2>
                <p className="text-lg md:text-xl mb-8 text-gray-600">
                    Answer a few simple questions and get insights to help you understand how you feel.
                </p>

                <Link
                    to="/check-symptoms"
                    className="btn btn-primary btn-lg px-8 py-4 text-lg hover:scale-105 transition-transform duration-200"
                >
                    Start Symptom Check
                </Link>
            </div>

            {/* Optional footer / disclaimer */}
            <p className="text-sm text-center text-gray-500 mt-12 max-w-md">
                Your data is private. This tool is for educational purposes only and not a medical diagnosis.
            </p>
        </div>
    );
};

export default HomePage;
