import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginUserMutation } from "../../redux/queries/userApi";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import Layout from "../../Layout";
import { loginUserSchema } from "../../schema/userSchema";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });

  const { email, password } = form;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginUser, { isLoading, error }] = useLoginUserMutation();

  // Generic onChange handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        return toast.error("All fields are required", { position: "top-center" });
      }
      const result = loginUserSchema.safeParse({ email, password });
      if (!result.success) {
        return toast.error(result.error.issues[0].message);
      }

      const res = await loginUser({ email, password }).unwrap();
      dispatch(setUserInfo({ ...res }));
      navigate(-1);
    } catch (error) {
      toast.error(error?.data?.message || error?.error || "an error occurred", {
        position: "top-center",
      });
    }
  };
  return (
    <>
      <Layout>
        <div className=" flex mt-[-100px] flex-col items-center justify-center min-h-screen text-black">
          <div>
            <h1 className="mb-5 text-[20px] font-semibold">Login to your account</h1>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className=" h-[40px] bg-opacity-50 w-[300px] rounded-md   bg-gray-100  placeholder:text-grey-40  flex items-center mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={email}
                  onChange={handleChange}
                  className=" w-full shadow border rounded-md h-full bg-white bg-opacity-50 py-3 px-4  outline-0  focus:border-tomato focus:border-2"
                />
              </div>
              <div className="rounded-md border relative  h-[40px]  w-[300px]   bg-gray-100  placeholder:text-grey-40  flex items-center mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="password"
                  value={password}
                  onChange={handleChange}
                  className="w-full shadow rounded-md h-full bg-white bg-opacity-50 py-3 px-4 outline-none outline-0  focus:border-tomato focus:border-2"
                />
                <button
                  type="button"
                  className="text-grey-40 absolute right-0 focus:text-violet-60 px-4 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <Eye strokeWidth={1} />
                  ) : (
                    <span>
                      <EyeOff strokeWidth={1} />
                    </span>
                  )}
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full mt-4  rounded-lg font-semibold flex items-center justify-center  px-3 py-2  transition-all delay-50 bg-gradient-to-t from-zinc-900 to-zinc-700  shadow-[0_7px_15px_rgba(0,0,0,0.5)] hover:scale-[0.995] text-white ">
                  {!isLoading ? "Log in" : <Spinner className="border-t-slate-700" />}
                </button>
              </div>
            </form>
            <div className="mt-5">
              <span> Don't have an account? </span>
              <Link to="/register" className="font-bold underline">
                Register
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Login;
