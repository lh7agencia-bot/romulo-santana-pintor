import { useState, FormEvent } from 'react';
import { CheckCircle2, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { BRAND_INFO, buildWhatsAppUrl } from '../data/siteData';
import { QuoteFormValues, validateQuoteForm } from '../utils/simulatorLogic';

const SERVICE_OPTIONS = [
  'Pintura Residencial',
  'Pintura Comercial',
  'Fachada / Área Externa',
  'Massa Corrida / Textura',
  'Outro serviço de pintura',
];

export function ContactSection() {
  const [form, setForm] = useState<QuoteFormValues>({
    name: '',
    email: '',
    serviceType: 'Pintura Residencial',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormValues, string>>>({});
  const [submittedMode, setSubmittedMode] = useState<'whatsapp' | 'email' | null>(null);

  const directWhatsApp = buildWhatsAppUrl(BRAND_INFO.defaultWhatsAppMessage);

  const buildFormattedMessage = () =>
    `Olá, ${BRAND_INFO.name}! Meu nome é ${form.name.trim()} (${form.email.trim()}). Serviço: ${form.serviceType}. Detalhes: ${form.message.trim()}`;

  const handleAction = (mode: 'whatsapp' | 'email') => {
    const result = validateQuoteForm(form);
    if (!result.valid) {
      setErrors(result.errors);
      setSubmittedMode(null);
      return;
    }
    setErrors({});
    setSubmittedMode(mode);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleAction('whatsapp');
  };

  const preparedWhatsAppUrl = buildWhatsAppUrl(buildFormattedMessage());
  const preparedMailtoUrl = `mailto:${BRAND_INFO.email}?subject=${encodeURIComponent(
    `Orçamento: ${form.serviceType} - ${form.name.trim()}`,
  )}&body=${encodeURIComponent(buildFormattedMessage())}`;

  return (
    <section id="contato" className="scroll-mt-20 bg-slate-50 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold text-[#0B3D91] mb-2">Contato e Localização</p>
            <h2 className="headline-balance text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Solicite seu Orçamento sem Compromisso
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Preencha o formulário ao lado para enviar os detalhes do seu ambiente diretamente para o nosso WhatsApp ou por e-mail.
            </p>

            <div className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Phone className="h-4 w-4 text-[#0B3D91]" aria-hidden="true" />
                  Telefone e WhatsApp
                </h3>
                <a
                  href={directWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-semibold text-[#0B3D91] hover:underline tabular-nums"
                >
                  {BRAND_INFO.phoneDisplay}
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <MapPin className="h-4 w-4 text-[#0B3D91]" aria-hidden="true" />
                  Endereço
                </h3>
                <p className="mt-1 text-sm text-slate-600">{BRAND_INFO.address}</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Navigation className="h-4 w-4 text-[#0B3D91]" aria-hidden="true" />
                  Área de Atendimento
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Serra - ES e Grande Vitória — obras residenciais e comerciais.
                </p>
              </div>
            </div>
          </div>

          {/* Lead Capture Form */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-7 lg:p-8">
            <h3 className="text-xl font-bold text-slate-900">Envie os dados do seu projeto</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {BRAND_INFO.fullTitle} · {BRAND_INFO.tagline}
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quote-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nome completo
                  </label>
                  <input
                    id="quote-name"
                    type="text"
                    placeholder="Seu nome"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                      errors.name ? 'border-red-500' : 'border-slate-300 focus:border-[#0B3D91]'
                    }`}
                  />
                  {errors.name && (
                    <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="quote-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    E-mail
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                      errors.email ? 'border-red-500' : 'border-slate-300 focus:border-[#0B3D91]'
                    }`}
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="quote-service" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipo de serviço
                </label>
                <select
                  id="quote-service"
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quote-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mensagem (ambiente, metragem aproximada e bairro)
                </label>
                <textarea
                  id="quote-message"
                  rows={4}
                  placeholder="Ex.: Pintura interna de apartamento de 2 quartos em Laranjeiras, Serra."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                    errors.message ? 'border-red-500' : 'border-slate-300 focus:border-[#0B3D91]'
                  }`}
                />
                {errors.message && (
                  <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                    {errors.message}
                  </p>
                )}
              </div>

              {submittedMode && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">
                        Dados validados! Seu resumo está pronto para envio.
                      </p>
                      <p className="mt-1 text-xs text-emerald-800">
                        Clique abaixo para abrir diretamente no{' '}
                        {submittedMode === 'whatsapp' ? 'WhatsApp' : 'seu aplicativo de e-mail'}.
                      </p>
                      <a
                        href={submittedMode === 'whatsapp' ? preparedWhatsAppUrl : preparedMailtoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        {submittedMode === 'whatsapp' ? 'Abrir WhatsApp Agora' : 'Abrir E-mail Agora'}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B3D91] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#093277] transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Enviar via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('email')}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Enviar por E-mail
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
