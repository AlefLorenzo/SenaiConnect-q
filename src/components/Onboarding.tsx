import { useState, useEffect } from 'react';
import { useAuth, useToast } from '../store';
import { Button, Input, Avatar } from './UI';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, BookOpen, Users, Bell, MessageCircle, Camera } from 'lucide-react';

export function Onboarding() {
  const { user, completeOnboarding, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState({
    bio: user?.bio || '',
    course: user?.course || '',
    interests: user?.interests || [],
  });
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = sessionStorage.getItem('senai_onboarding');
    if (completed || user?.onboardingCompleted) {
      return;
    }
  }, [user]);

  if (!user || user.onboardingCompleted || sessionStorage.getItem('senai_onboarding')) {
    return null;
  }

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    addToast('success', 'Onboarding concluído! Você pode rever as dicas no menu de ajuda.');
  };

  const handleFinish = () => {
    if (profileData.bio || profileData.course || profileData.interests.length > 0) {
      updateProfile(profileData);
      addToast('success', 'Perfil atualizado com sucesso!');
    }
    completeOnboarding();
    addToast('success', 'Tudo pronto! Explore o SENAI Connect no seu ritmo.');
  };

  const addInterest = () => {
    if (interestInput.trim() && !profileData.interests.includes(interestInput.trim())) {
      setProfileData(prev => ({ ...prev, interests: [...prev.interests, interestInput.trim()] }));
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="flex flex-col items-center text-center animate-fade-in">
      <div className="w-20 h-20 bg-gradient-to-br from-senai to-senai-dark rounded-3xl flex items-center justify-center mb-6 shadow-lg">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        Boas-vindas ao SENAI Connect!
      </h2>
      <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
        Um espaço para você se conectar, compartilhar experiências e fazer parte da comunidade SENAI.
      </p>
      <div className="bg-senai-50 border border-senai-200 rounded-xl p-4 mb-6 max-w-sm">
        <p className="text-sm text-senai-700">
          Aqui você vai encontrar colegas, professores, conteúdos educativos e muito mais. Vamos começar?
        </p>
      </div>
      <Button onClick={handleNext} size="lg" className="w-full max-w-xs">
        Vamos começar
        <ChevronRight className="w-5 h-5" />
      </Button>
      <button onClick={handleSkip} className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition">
        Pular introdução
      </button>
    </div>,

    // Step 1: Platform Overview
    <div key="overview" className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Conhecendo a plataforma</h2>
      <p className="text-sm text-gray-600 text-center mb-6">Aqui estão os principais recursos disponíveis para você:</p>
      <div className="space-y-3">
        {[
          { icon: <BookOpen className="w-5 h-5" />, title: 'Feed de Publicações', desc: 'Compartilhe conteúdos, veja posts de colegas e professores' },
          { icon: <Users className="w-5 h-5" />, title: 'Grupos e Comunidades', desc: 'Participe de grupos de estudo e projetos' },
          { icon: <MessageCircle className="w-5 h-5" />, title: 'Mensagens', desc: 'Converse diretamente com colegas e professores' },
          { icon: <Bell className="w-5 h-5" />, title: 'Notificações', desc: 'Fique por dentro de tudo que acontece' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-10 h-10 bg-senai-100 rounded-lg flex items-center justify-center text-senai shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={handlePrev} className="flex-1">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Próximo <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>,

    // Step 2: Profile Customization
    <div key="profile" className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Personalize seu perfil</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Conte um pouco sobre você. Essa etapa é opcional!
      </p>
      <div className="flex justify-center mb-4">
        <div className="relative">
          <Avatar name={user.name} size="xl" />
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-senai rounded-full flex items-center justify-center text-white shadow-lg hover:bg-senai-dark transition" aria-label="Alterar foto">
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <Input
          label="Sobre você"
          placeholder="Ex: Estudante de Desenvolvimento de Sistemas, apaixonado por tecnologia..."
          value={profileData.bio}
          onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          hint="Uma breve descrição sobre você"
        />
        <Input
          label="Curso"
          placeholder="Ex: Desenvolvimento de Sistemas"
          value={profileData.course}
          onChange={e => setProfileData(prev => ({ ...prev, course: e.target.value }))}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Interesses</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ex: React, IoT, Design..."
              value={interestInput}
              onChange={e => setInterestInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
            />
            <Button variant="secondary" size="sm" onClick={addInterest}>Adicionar</Button>
          </div>
          {profileData.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profileData.interests.map(interest => (
                <span key={interest} className="inline-flex items-center gap-1 px-3 py-1 bg-senai-50 text-senai-700 rounded-full text-xs font-medium">
                  {interest}
                  <button onClick={() => removeInterest(interest)} className="hover:text-senai-dark" aria-label={`Remover ${interest}`}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={handlePrev} className="flex-1">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Próximo <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <button onClick={() => { handleNext(); }} className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 transition">
        Pular esta etapa
      </button>
    </div>,

    // Step 3: First Interaction
    <div key="interaction" className="animate-fade-in text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <MessageCircle className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-3">Sua primeira interação</h2>
      <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
        Que tal explorar o feed e ver o que a comunidade está compartilhando? Você pode curtir, comentar ou criar sua própria publicação quando quiser.
      </p>
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3 max-w-sm mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="w-6 h-6 bg-senai-100 rounded-full flex items-center justify-center text-xs font-bold text-senai">1</span>
          Explore o feed na página inicial
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="w-6 h-6 bg-senai-100 rounded-full flex items-center justify-center text-xs font-bold text-senai">2</span>
          Curta publicações que gostar
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="w-6 h-6 bg-senai-100 rounded-full flex items-center justify-center text-xs font-bold text-senai">3</span>
          Comente e interaja com a comunidade
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="w-6 h-6 bg-senai-100 rounded-full flex items-center justify-center text-xs font-bold text-senai">4</span>
          Crie sua própria publicação
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={handlePrev} className="flex-1">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Próximo <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>,

    // Step 4: Conclusion
    <div key="conclusion" className="flex flex-col items-center text-center animate-fade-in">
      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
        <Check className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Tudo pronto!</h2>
      <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
        Explore o SENAI Connect no seu ritmo. Você pode acessar as dicas novamente quando precisar no menu de ajuda.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 max-w-sm">
        <p className="text-sm text-green-700">
          💡 <strong>Dica:</strong> Complete seu perfil para que outros colegas possam te conhecer melhor!
        </p>
      </div>
      <Button onClick={handleFinish} size="lg" className="w-full max-w-xs">
        <Sparkles className="w-5 h-5" />
        Começar a explorar
      </Button>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Etapa {step + 1} de {totalSteps}</span>
            <button onClick={handleSkip} className="text-xs text-gray-500 hover:text-gray-700 transition flex items-center gap-1">
              Pular <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-senai to-senai-dark rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {steps[step]}
      </div>
    </div>
  );
}
