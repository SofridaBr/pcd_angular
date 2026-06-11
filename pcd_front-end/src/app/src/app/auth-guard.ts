import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Api } from '../../service/api';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const api = inject(Api);

  const tipo = api.getTipoUsuario();

  if (!tipo) {
    router.navigate(['/login']);
    return false;
  }

  const prefixosPermitidos: Record<string, string> = {
    aluno:       'painel',
    professor:   'professor',
    coordenador: 'coordenador',
    responsavel: 'responsavel',
    apoio:       'apoio'
  };

  const prefixoPermitido = prefixosPermitidos[tipo];

  const urlCompleta = route.pathFromRoot
    .map(r => r.routeConfig?.path || '')
    .filter(p => p)
    .join('/');

  if (!urlCompleta.startsWith(prefixoPermitido)) {
    router.navigate([`/${prefixoPermitido}`]);
    return false;
  }

  return true;
};