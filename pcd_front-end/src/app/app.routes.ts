import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Informacoes } from './informacoes/informacoes';
import { Tarefa } from './tarefa/tarefa';
import { Professor } from './professor/professor';
import { Boletim } from './boletim/boletim';
import { Recados } from './recados/recados';
import { Tutoriais } from './tutoriais/tutoriais';
import { Configuracoes } from './configuracoes/configuracoes';
import { Materiais } from './materiais/materiais';
import { ProfessorConfiguracoes } from './professor-configuracoes/professor-configuracoes';
import { Coordenador } from './coordenador/coordenador';
import { TodosAlunos } from './coordenador/todos-alunos/todos-alunos';
import { Familiar } from './responsavel/familiar/familiar';  // ← NOVO

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  // ── ALUNO ──────────────────────────────
  { path: 'painel', component: Home },
  { path: 'painel/informacoes', component: Informacoes },
  { path: 'painel/tarefas', component: Tarefa },
  { path: 'painel/boletim', component: Boletim },
  { path: 'painel/recados', component: Recados },
  { path: 'painel/tutoriais', component: Tutoriais },
  { path: 'painel/configuracoes', component: Configuracoes },
  { path: 'painel/materiais', component: Materiais },

  // ── PROFESSOR / APOIO ──────────────────
  { path: 'professor', component: Professor },
  { path: 'professor/configuracoes', component: ProfessorConfiguracoes },

  // ── COORDENADOR ────────────────────────
  { path: 'coordenador', component: Coordenador },
  { path: 'coordenador/alunos', component: TodosAlunos },

  // ── RESPONSÁVEL ────────────────────────
  { path: 'responsavel', component: Familiar },  // ← NOVO

  // ── ALIASES ────────────────────────────
  { path: 'home', redirectTo: 'painel', pathMatch: 'full' },
  { path: 'info', redirectTo: 'painel/informacoes', pathMatch: 'full' },
  { path: 'tarefa', redirectTo: 'painel/tarefas', pathMatch: 'full' },
];