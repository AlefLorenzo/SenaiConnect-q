import { useState } from 'react';
import { useAuth, useToast } from '../store';
import { Button, Input } from '../components/UI';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

export function AuthPage() {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (mode === 'register' && !formData.name.trim()) newErrors.name = 'Informe seu nome';
    if (!formData.email.trim()) newErrors.email = 'Informe seu e-mail';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'E-mail inválido';
    if (!formData.password) newErrors.password = 'Informe sua senha';
    else if (formData.password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    if (mode === 'register' && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let success: boolean;
      if (mode === 'login') {
        success = await login(formData.email, formData.password);
        if (success) addToast('success', 'Login realizado com sucesso!');
        else {
          addToast('error', 'E-mail ou senha incorretos. Tente novamente.');
          setErrors({ email: 'Credenciais inválidas' });
        }
      } else {
        success = await register(formData.name, formData.email, formData.password);
        if (success) addToast('success', 'Conta criada com sucesso! Boas-vindas!');
      }
    } catch {
      addToast('error', 'Não foi possível concluir a ação. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-senai-light via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-senai to-senai-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">SENAI Connect</h1>
          <p className="text-sm text-text-secondary mt-1">Rede Social Acadêmica</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 animate-scale-in">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar sua conta'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {mode === 'login' ? 'Bem-vindo de volta! Insira suas credenciais.' : 'Preencha os dados para se cadastrar.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div className="animate-fade-in">
                <Input
                  label="Nome completo"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  error={errors.name}
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="seu@email.senai.br"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none ${
                    errors.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  required
                  autoComplete="email"
                />
              </div>
              {errors.email && <p id="email-error" className="text-xs text-red-600 mt-1" role="alert">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={`w-full pl-10 pr-12 py-2.5 rounded-xl border bg-white text-sm transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none ${
                    errors.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-invalid={!!errors.password}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1" role="alert">{errors.password}</p>}
            </div>
            {mode === 'register' && (
              <div className="animate-fade-in">
                <Input
                  label="Confirmar senha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
              <button onClick={switchMode} className="ml-1 font-semibold text-senai hover:text-senai-hover transition">
                {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
              </button>
            </p>
          </div>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs text-blue-700 text-center">
              💡 <strong>Demo:</strong> Use qualquer e-mail com "senai" no domínio para fazer login.
              <br />Ex: <code className="bg-blue-100 px-1 rounded">aluno@sp.senai.br</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 SENAI Connect — Plataforma educacional
        </p>
      </div>
    </div>
  );
}
