import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const raw = localStorage.getItem('usuario');

  if (!raw) {
    router.navigate(['/login']);
    return false;
  }

  const usuario = JSON.parse(raw);
  const tipo: string = usuario.tipo;

  // Pega o prefixo da URL atual
  const urlCompleta = route.pathFromRoot
    .map(r => r.routeConfig?.path || '')
    .filter(p => p)
    .join('/');

  const prefixosPermitidos: Record<string, string> = {
    aluno:       'painel',
    professor:   'professor',
    coordenador: 'coordenador',
    responsavel: 'responsavel',
    apoio:       'apoio'
  };

  const prefixoPermitido = prefixosPermitidos[tipo];

  // Se a rota não começa com o prefixo do tipo dele, redireciona
  if (!urlCompleta.startsWith(prefixoPermitido)) {
    router.navigate([`/${prefixoPermitido}`]);
    return false;
  }

  return true;
};