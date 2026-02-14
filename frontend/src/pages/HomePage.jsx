import { Link } from "react-router-dom";
import { BookLock, ClipboardList, Route, ArrowRight, ClipboardCheck, MessageSquareText, HelpCircle} from "lucide-react";

const HomePage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-base-200">
            {/* Decorative animated background blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
                <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl animate-floatSlow" />
                <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float" />
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10">

                {/* Hero */}
                <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
                    <div className="animate-enter space-y-6">
                        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                            Understand what you’re feeling —{" "}
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                without the guesswork
                            </span>
                        </h1>

                        <p className="text-base opacity-80 md:text-lg">
                            Answer a few questions about your symptoms. We’ll suggest possible conditions and
                            help you decide what to do next — purely informational, never a diagnosis.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                to="/check-symptoms"
                                className="btn btn-primary btn-lg group"
                            >
                                Start Symptom Check
                                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                        </div>

                        {/* Trust row */}
                        <div className="flex flex-wrap gap-3 pt-2 text-sm opacity-80">
                            <span className="badge badge-outline gap-2 py-3">
                                <BookLock className="h-4 w-4" />
                                Private
                            </span>
                            <span className="badge badge-outline gap-2 py-3">
                                <ClipboardList className="h-4 w-4" />
                                Guided questions
                            </span>
                            <span className="badge badge-outline gap-2 py-3">
                                <Route className="h-4 w-4" />
                                Clear next steps
                            </span>
                        </div>
                    </div>

                    {/* Right-side “preview” card */}
                    <div className="animate-enterDelay">
                        <div className="relative rounded-3xl bg-base-100 p-6 shadow-xl ring-1 ring-base-300">
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                            <div className="relative space-y-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold opacity-70">What you’ll get</p>
                                    <span className="badge badge-primary badge-outline">Preview</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4">
                                        <p className="text-sm opacity-70">Suggested condition</p>
                                        <p className="text-xl font-bold italic text-primary">Example: Migraine</p>
                                        <p className="mt-1 text-xs opacity-60">
                                            With confidence estimate based on your answers
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4">
                                            <p className="text-sm font-semibold">Helpful context</p>
                                            <p className="text-sm opacity-70">
                                                Patient-friendly info pulled from MedlinePlus.
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4">
                                            <p className="text-sm font-semibold">Save your history</p>
                                            <p className="text-sm opacity-70">
                                                Log results & notes when you’re signed in.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="divider my-1" />

                                <div className="text-xs opacity-60 leading-relaxed">
                                    Educational only. Not medical advice or a diagnosis.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div id="how" className="mt-14 grid gap-6 lg:grid-cols-3">
                    {[
                        {
                            icon: MessageSquareText,
                            title: "1) Tell us what’s going on",
                            body: "Add symptoms, plus optional height/weight to improve context.",
                        },
                        {
                            icon: HelpCircle,
                            title: "2) Answer follow-up questions",
                            body: "A guided interview adapts based on your inputs.",
                        },
                        {
                            icon: ClipboardCheck,
                            title: "3) Get results you can act on",
                            body: "See likely conditions, emergency flags, and trusted resources.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="card bg-base-100 shadow-md ring-1 ring-base-300 transition-transform duration-200 hover:-translate-y-0.5"
                        >
                            <div className="card-body">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                                        <item.icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="card-title text-base">{item.title}</h3>
                                </div>
                                <p className="opacity-70">{item.body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Disclaimer */}
                <div className="mt-14 max-w-3xl self-center text-center space-y-3">
                    <p className="text-sm opacity-70 leading-relaxed">
                        This tool provides health information for educational purposes only and is not a medical diagnosis.
                        Always seek the advice of a qualified healthcare professional with any questions regarding a medical condition.
                    </p>

                    <p className="text-sm opacity-60">
                        Powered by{" "}
                        <a
                            href="https://infermedica.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:opacity-80"
                        >
                            Infermedica
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
