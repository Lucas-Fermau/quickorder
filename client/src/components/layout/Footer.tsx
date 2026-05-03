import { ChefHat, MapPin, Phone, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-amber-500 text-white">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight">QuickOrder Burger</span>
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            O melhor delivery de hambúrgueres da cidade. Peça em minutos.
          </p>
        </div>
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Clock className="h-4 w-4 text-brand-500" />
            Atendimento
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Seg–Sex 18h às 23h</li>
            <li>Sáb–Dom 12h às 00h</li>
            <li className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              (11) 0000-0000
            </li>
          </ul>
        </div>
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <MapPin className="h-4 w-4 text-brand-500" />
            Endereço
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Av. Paulista, 1000</li>
            <li>Bela Vista — São Paulo, SP</li>
            <li>CEP 01310-100</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-slate-200 px-4 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500 sm:px-6">
        © {new Date().getFullYear()} QuickOrder Burger. Projeto de portfólio fictício.
      </div>
    </footer>
  );
}
