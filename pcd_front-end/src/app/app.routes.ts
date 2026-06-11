import { Routes } from '@angular/router';
import { authGuard } from './src/app/auth-guard';
import { Login } from './login/login';
import { Home } from './home/home';
import { Informacoes } from './home/informacoes/informacoes';
import { Tarefa } from './home/tarefa/tarefa';
import { Professor } from './professor/professor';
import { Boletim } from './home/boletim/boletim';
import { Recados } from './home/recados/recados';
import { Tutoriais } from './home/tutoriais/tutoriais';
import { Configuracoes } from './home/configuracoes/configuracoes';
import { Materiais } from './home/materiais/materiais';
import { ProfessorConfiguracoes } from './professor/professor-configuracoes/professor-configuracoes';
import { Coordenador } from './coordenador/coordenador';
import { TodosAlunos } from './coordenador/todos-alunos/todos-alunos';
import { Familiar } from './responsavel/familiar/familiar';
import { Apoio } from './apoio/apoio';
import { TodosProfessores } from './coordenador/todos-professores/todos-professores';
import { TodosResponsaveis } from './coordenador/todos-responsaveis/todos-responsaveis';
import { TodosCuidadores } from './coordenador/todos-cuidadores/todos-cuidadores';
import { Comunicacao } from './coordenador/comunicacao/comunicacao';
import { CoordenadorConfiguracoes } from './coordenador/coordenador-configuracoes/coordenador-configuracoes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  // ── ALUNO ──────────────────────────────
  { path: 'painel',                    component: Home,           canActivate: [authGuard] },
  { path: 'painel/informacoes',        component: Informacoes,    canActivate: [authGuard] },
  { path: 'painel/tarefas',            component: Tarefa,         canActivate: [authGuard] },
  { path: 'painel/boletim',            component: Boletim,        canActivate: [authGuard] },
  { path: 'painel/recados',            component: Recados,        canActivate: [authGuard] },
  { path: 'painel/tutoriais',          component: Tutoriais,      canActivate: [authGuard] },
  { path: 'painel/configuracoes',      component: Configuracoes,  canActivate: [authGuard] },
  { path: 'painel/materiais',          component: Materiais,      canActivate: [authGuard] },

  // ── PROFESSOR ──────────────────────────
  { path: 'professor',                 component: Professor,             canActivate: [authGuard] },
  { path: 'professor/configuracoes',   component: ProfessorConfiguracoes, canActivate: [authGuard] },

  // ── COORDENADOR ────────────────────────
  { path: 'coordenador',               component: Coordenador,              canActivate: [authGuard] },
  { path: 'coordenador/alunos',        component: TodosAlunos,              canActivate: [authGuard] },
  { path: 'coordenador/professores',   component: TodosProfessores,         canActivate: [authGuard] },
  { path: 'coordenador/responsaveis',  component: TodosResponsaveis,        canActivate: [authGuard] },
  { path: 'coordenador/cuidadores',    component: TodosCuidadores,          canActivate: [authGuard] },
  { path: 'coordenador/comunicacao',   component: Comunicacao,              canActivate: [authGuard] },
  { path: 'coordenador/configuracoes', component: CoordenadorConfiguracoes, canActivate: [authGuard] },

  // ── RESPONSÁVEL ────────────────────────
  { path: 'responsavel',               component: Familiar, canActivate: [authGuard] },

  // ── APOIO ──────────────────────────────
  { path: 'apoio',                     component: Apoio,    canActivate: [authGuard] },

  // ── ALIASES ────────────────────────────
  { path: 'home',   redirectTo: 'painel',             pathMatch: 'full' },
  { path: 'info',   redirectTo: 'painel/informacoes', pathMatch: 'full' },
  { path: 'tarefa', redirectTo: 'painel/tarefas',     pathMatch: 'full' },

  // ── QUALQUER ROTA INVÁLIDA ─────────────
  { path: '**', redirectTo: 'login' }
];