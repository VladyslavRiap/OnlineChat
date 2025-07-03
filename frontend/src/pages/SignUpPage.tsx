import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageSquare,
  User,
  User2,
} from "lucide-react";
import AuthImage from "../components/AuthImage";
import { useState } from "react";
import { Link } from "react-router-dom";
const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    password: "",
    email: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className=" grid lg:grid-cols-2 min-h-screen">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get Started with your free account
              </p>
            </div>
          </div>
          <form className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 inset-y-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`input w-full input-bordered pl-10`}
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">User name</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 inset-y-0 pl-3 flex items-center pointer-events-none">
                  <User2 className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  className={`input w-full input-bordered pl-10`}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">email</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 inset-y-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  placeholder="JohnDoe@email.com"
                  className={`input w-full input-bordered pl-10`}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">password</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 inset-y-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="........"
                  className={`input w-full input-bordered pl-10`}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-0 pr-3  inset-y-5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {!showPassword ? (
                    <Eye className="size-5 text-base-content/40 hover:text-base-content/20" />
                  ) : (
                    <EyeOff className="size-5 text-base-content/40 hover:text-base-content/20" />
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Create Account
            </button>
          </form>
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className=" link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthImage
        title="Join our community"
        subtitle="Connect with friends , share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignUpPage;
