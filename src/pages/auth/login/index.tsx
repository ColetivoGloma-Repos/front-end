import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { login } from "../../../services/auth.service";
import { setCookie } from "../../../services/cookie.service";
import { ILogin } from "../../../interfaces/auth";
import { useAuthProvider } from "../../../context/Auth";
import { Input, Link, LoadingScreen } from "../../../components/common";
import { toast } from "react-toastify";
import { toastMessage } from "../../../helpers/toast-message";
import { LoginSchema } from "./validator";

function LoginPointScreen() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILogin>({
    resolver: zodResolver(LoginSchema),
  });
  const navigate = useNavigate();
  const { loginUser, settings } = useAuthProvider();

  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  async function onSubmit(data: ILogin) {
    if (requesting) {
      toast.warn(toastMessage.REQUESTING);
      return;
    }

    try {
      setRequesting(true);

      const response = await login(data);

      setCookie("token", response.token, 7);

      loginUser();
      toast.success("Login feito com sucesso");

      navigate("/");
    } catch (error: any) {
      console.error(error);
      toast.error(toastMessage.INTERNAL_SERVER_ERROR);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <section className="login-section">
      <LoadingScreen />

      <div className="hero min-h-screen bg-base-200 py-4">
        <div className="hero-content w-full">
          <div className="card shrink-0 w-full max-w-md shadow-2xl bg-base-100 rounded-lg">
            <div className="card-body">
              <h1 className="text-4xl pb-5 text-center font-semibold">Login</h1>

              <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">E-mail: </span>
                  </label>
                  <Input
                    type="email"
                    placeholder="Digite o seu email"
                    {...register("email")}
                    errors={errors}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Senha: </span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      {...register("password")}
                      errors={errors}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <button className="btn btn-primary rounded-lg">Login</button>
                </div>
              </form>

              <Link
                href="/forgot-password"
                className="link link-hover text-sm text-center mt-2"
              >
                Esqueceu sua senha?
              </Link>

              <Link
                href="/auth/register"
                className="link link-hover w-full text-center mt-4"
              >
                Não tem uma conta?
              </Link>

              <Link
                href={settings.support}
                className="link text-blue-500 hover:text-blue-600 underline w-full text-center mt-4"
              >
                Suporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPointScreen;
