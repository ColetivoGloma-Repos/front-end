import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../../../components/common";
import { forgotPassword } from "../../../services/auth.service";
import { toast } from "react-toastify";
import { toastMessage } from "../../../helpers/toast-message";

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.warn("Por favor, informe seu e-mail");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setEmailSent(true);
      toast.success("E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || toastMessage.INTERNAL_SERVER_ERROR;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="card w-full max-w-md bg-white shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Recuperar Senha</h2>
        
        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">
              Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
              O link será válido por 1 hora.
            </p>

            <Input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={loading}
            />

            <Button
              type="submit"
              text={loading ? "Enviando..." : "Enviar link de recuperação"}
              className="w-full btn btn-primary"
              disabled={loading}
            />

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-blue-600 hover:underline"
              >
                Voltar para o login
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-green-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-700">
              E-mail enviado para <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Não recebeu o e-mail? Verifique sua caixa de spam ou aguarde alguns minutos.
            </p>
            <Button
              text="Voltar para o login"
              className="w-full btn btn-outline mt-6"
              onClick={() => navigate("/login")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
